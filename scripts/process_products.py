#!/usr/bin/env python3
"""Product image pipeline.

  1. inspect  : convert every image in assets/products/ to PNG (assets/products/png/),
                report size + whether the background is plain (white/flat).
  2. cutout   : remove plain backgrounds (BiRefNet via rembg), de-fringe the white halo,
                split multi-product shots (e.g. red+blue pair) into single products.
  3. upscale  : 2x Real-ESRGAN on the cut-outs (assets/products/cutout/*@2x.png).
  4. vertical : 1080x1920 designed plates (assets/products/vertical/): clean + titled.

Which source file plays which role is set in assets/products/roles.json, e.g.
  {"pair": "glasse-power.png", "red_back": "GLASSE-POWER-rouge_004.png", ...}
Run `python3 scripts/process_products.py inspect` first; it writes a roles.json guess.

Usage: python3 scripts/process_products.py [inspect|cutout|vertical|all]
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PROD = ROOT / "assets/products"
PNG = PROD / "png"
CUT = PROD / "cutout"
VERT = PROD / "vertical"
FONTS = ROOT / "assets/fonts"
W, H = 1080, 1920

sys.path.insert(0, str(Path(__file__).parent))

PALETTES = {
    # top, middle, bottom of the background gradient; glow color; drop tint
    "blue": ((250, 254, 255), (214, 240, 248), (148, 208, 226), (190, 236, 246), (120, 200, 225)),
    "red": ((255, 252, 250), (255, 228, 226), (240, 170, 168), (255, 214, 210), (235, 130, 130)),
    "neutral": ((255, 255, 255), (226, 243, 255), (160, 212, 245), (205, 235, 255), (130, 195, 240)),
}


# ─── 1. inspect ──────────────────────────────────────────────────────────────
def border_stats(rgb):
    b = np.concatenate([rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3), rgb[:, :8].reshape(-1, 3), rgb[:, -8:].reshape(-1, 3)])
    return b.mean(0), b.std(0).mean()


def is_plain(rgb):
    mean, std = border_stats(rgb)
    return bool(std < 12 and mean.min() > 200)


def inspect():
    PNG.mkdir(parents=True, exist_ok=True)
    report = []
    exts = {".webp", ".png", ".jpg", ".jpeg", ".avif"}
    for f in sorted(p for p in PROD.iterdir() if p.suffix.lower() in exts and p.is_file()):
        im = Image.open(f)
        rgba = im.convert("RGBA")
        out = PNG / (f.stem + ".png")
        rgba.save(out)
        rgb = np.array(im.convert("RGB"))
        has_alpha = im.mode in ("RGBA", "LA") and np.array(rgba)[..., 3].min() < 250
        mean, std = border_stats(rgb)
        report.append({
            "file": out.name,
            "size": f"{im.width}x{im.height}",
            "mode": im.mode,
            "transparent": has_alpha,
            "plainBackground": has_alpha or is_plain(rgb),
            "borderMean": [round(float(x)) for x in mean],
            "borderStd": round(float(std), 1),
        })
    (PROD / "inspect.json").write_text(json.dumps(report, indent=2))
    for r in report:
        print(f"{r['file']:<40} {r['size']:>10}  plain={r['plainBackground']!s:<5} transparent={r['transparent']!s:<5} border={r['borderMean']} std={r['borderStd']}")
    roles = PROD / "roles.json"
    if not roles.exists():
        roles.write_text(json.dumps({r["file"]: "?" for r in report}, indent=2))
        print(f"\nwrote {roles} — map each file to a role (pair, red_front, blue_front, red_back, blue_back,\n"
              "red_composite, blue_composite, red_undersink, blue_undersink, red_kitchen, blue_kitchen, skip)")
    return report


# ─── 2. cut-out ──────────────────────────────────────────────────────────────
_session = None


def remove_bg(rgb):
    global _session
    from rembg import new_session, remove
    if _session is None:
        _session = new_session("birefnet-general")
    out = remove(Image.fromarray(rgb), session=_session, post_process_mask=True)
    return np.array(out)[..., 3]


def defringe(rgb, alpha, bg=(255, 255, 255)):
    """Un-mix the white background from semi-transparent edge pixels (kills the white halo)."""
    a = alpha.astype(np.float32)[..., None] / 255.0
    c = rgb.astype(np.float32)
    b = np.array(bg, np.float32)
    fg = np.where(a > 0.02, (c - (1 - a) * b) / np.maximum(a, 0.02), c)
    fg = np.clip(fg, 0, 255)
    # choke the matte slightly and soften: removes the last light line on the edge
    al = cv2.erode(alpha, np.ones((3, 3), np.uint8), 1)
    al = cv2.GaussianBlur(al, (3, 3), 0.7)
    return fg.astype(np.uint8), al


def split_components(alpha, min_frac=0.08):
    n, lab, stats, _ = cv2.connectedComponentsWithStats((alpha > 40).astype(np.uint8), 8)
    total = alpha.size
    comps = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > min_frac * total * 0.1]
    comps.sort(key=lambda i: stats[i, cv2.CC_STAT_LEFT])
    return lab, [(i, stats[i]) for i in comps]


def crop_rgba(rgba, pad=12):
    ys, xs = np.where(rgba[..., 3] > 8)
    y0, y1, x0, x1 = max(ys.min() - pad, 0), min(ys.max() + pad, rgba.shape[0]), max(xs.min() - pad, 0), min(xs.max() + pad, rgba.shape[1])
    return rgba[y0:y1, x0:x1]


def upscale_rgba(rgba):
    from esrgan import upscale2x
    rgb = upscale2x(np.ascontiguousarray(rgba[..., :3]))
    a = cv2.resize(rgba[..., 3], (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_CUBIC)
    return np.dstack([rgb, a])


def color_of(rgba):
    """Is this product the red or the blue (teal) version?"""
    px = rgba[..., :3][rgba[..., 3] > 200].astype(int)
    sat = px[(px.max(1) - px.min(1)) > 60]
    if len(sat) == 0:
        return "neutral"
    r, g, b = sat.mean(0)
    return "red" if r > g and r > b else "blue"


def cutout(roles=None):
    CUT.mkdir(parents=True, exist_ok=True)
    roles = roles or json.loads((PROD / "roles.json").read_text())
    made = {}
    for fname, role in roles.items():
        if role in ("skip", "?") or role.endswith(("undersink", "kitchen", "composite")):
            continue
        rgb = np.array(Image.open(PNG / fname).convert("RGB"))
        alpha = remove_bg(rgb)
        fg, alpha = defringe(rgb, alpha)
        rgba = np.dstack([fg, alpha])
        if role == "pair":
            lab, comps = split_components(alpha)
            big = [c for c in comps if c[1][cv2.CC_STAT_AREA] > 0.05 * alpha.size]
            pair = crop_rgba(rgba)
            Image.fromarray(pair).save(CUT / "pair.png")
            Image.fromarray(upscale_rgba(pair)).save(CUT / "pair@2x.png")
            made["pair"] = "pair@2x.png"
            for i, st in big:
                single = rgba.copy()
                single[..., 3] = np.where(lab == i, single[..., 3], 0)
                single = crop_rgba(single)
                col = color_of(single)
                Image.fromarray(single).save(CUT / f"{col}_front.png")
                Image.fromarray(upscale_rgba(single)).save(CUT / f"{col}_front@2x.png")
                made.setdefault(f"{col}_front", f"{col}_front@2x.png")
        else:
            one = crop_rgba(rgba)
            Image.fromarray(one).save(CUT / f"{role}.png")
            Image.fromarray(upscale_rgba(one)).save(CUT / f"{role}@2x.png")
            made[role] = f"{role}@2x.png"
        print("cut", fname, "->", role)
    (CUT / "made.json").write_text(json.dumps(made, indent=2))
    return made


# ─── 3. vertical plates ──────────────────────────────────────────────────────
def gradient(top, mid, bot):
    y = np.linspace(0, 1, H)[:, None]
    c = np.where(y < 0.55, np.array(top) + (np.array(mid) - top) * (y / 0.55), np.array(mid) + (np.array(bot) - mid) * ((y - 0.55) / 0.45))
    return np.repeat(c[:, None, :], W, 1).reshape(H, W, 3)


def soft_ellipse(color, box, blur, opacity=255, size=(W, H)):
    """Blurred ellipse as RGBA with a solid color layer (blur only the mask: no dark fringes)."""
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).ellipse(box, fill=opacity)
    layer = Image.new("RGBA", size, tuple(color) + (0,))
    layer.putalpha(mask.filter(ImageFilter.GaussianBlur(blur)) if blur else mask)
    return layer


def water_drop(size, tint):
    """A small realistic-ish water droplet (transparent PNG)."""
    s = size * 4
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((s * 0.08, s * 0.08, s * 0.92, s * 0.92), fill=tint + (70,))
    d.ellipse((s * 0.14, s * 0.14, s * 0.86, s * 0.86), outline=(255, 255, 255, 150), width=max(2, s // 30))
    d.ellipse((s * 0.25, s * 0.2, s * 0.48, s * 0.4), fill=(255, 255, 255, 230))
    d.ellipse((s * 0.55, s * 0.62, s * 0.78, s * 0.8), fill=(255, 255, 255, 90))
    shadow = soft_ellipse([int(c * 0.6) for c in tint], (s * 0.12, s * 0.2, s * 0.96, s * 1.0), s // 12, 70, (s, s))
    shadow.alpha_composite(im)
    return shadow.resize((size, size), Image.LANCZOS)


def compose_vertical(product_rgba, palette, title=False, width_frac=0.62, seed=3):
    top, mid, bot, glow, tint = PALETTES[palette]
    bg = Image.fromarray(gradient(top, mid, bot).astype(np.uint8)).convert("RGBA")
    rng = np.random.default_rng(seed)

    # product size: ~62% of frame width, never taller than the 15%..75% band
    prod = Image.fromarray(product_rgba)
    band_top, band_bot = int(H * 0.17), int(H * 0.73)
    scale = min(W * width_frac / prod.width, (band_bot - band_top) / prod.height)
    pw, ph = int(prod.width * scale), int(prod.height * scale)
    prod = prod.resize((pw, ph), Image.LANCZOS)
    px, py = (W - pw) // 2, band_bot - ph

    # glow behind product
    cy = py + ph * 0.45
    g = soft_ellipse(glow, (W / 2 - pw * 0.75, cy - pw * 0.75, W / 2 + pw * 0.75, cy + pw * 0.75), 120)
    white = soft_ellipse((255, 255, 255), (W / 2 - pw * 0.45, cy - pw * 0.45, W / 2 + pw * 0.45, cy + pw * 0.45), 90, 230)
    bg = Image.alpha_composite(Image.alpha_composite(bg, g), white)

    # water drops scattered (kept away from the product)
    for _ in range(26):
        s = int(rng.uniform(14, 64))
        x, y = int(rng.uniform(0, W - s)), int(rng.uniform(H * 0.05, H * 0.95))
        if (px - 40 < x < px + pw + 40 and py - 60 < y < py + ph + 40) or (title and y < H * 0.16):
            continue
        bg.alpha_composite(water_drop(s, tint), (x, y))

    # floor + soft realistic shadow
    sh = soft_ellipse((10, 30, 60), (px + pw * 0.02, band_bot - 34, px + pw * 0.98, band_bot + 44), 26, 95)
    contact = soft_ellipse((5, 15, 35), (px + pw * 0.08, band_bot - 12, px + pw * 0.92, band_bot + 14), 8, 150)
    bg = Image.alpha_composite(Image.alpha_composite(bg, sh), contact)
    bg.alpha_composite(prod, (px, py))

    # faint reflection
    refl = prod.transpose(Image.FLIP_TOP_BOTTOM).crop((0, 0, pw, int(ph * 0.18)))
    ra = np.array(refl).astype(np.float32)
    ra[..., 3] *= np.linspace(0.18, 0, ra.shape[0])[:, None]
    bg.alpha_composite(Image.fromarray(ra.astype(np.uint8)), (px, band_bot + 4))

    if title:
        text = "GLASSE POWER"
        size = 124
        font = ImageFont.truetype(str(FONTS / "Montserrat-900.ttf"), size)
        while font.getbbox(text)[2] > W * 0.84:
            size -= 4
            font = ImageFont.truetype(str(FONTS / "Montserrat-900.ttf"), size)
        tw = font.getbbox(text)[2]
        ty = int(H * 0.055)
        mask = Image.new("L", (W, 200), 0)
        ImageDraw.Draw(mask).text(((W - tw) / 2, 10), text, font=font, fill=255)
        c1, c2 = ((31, 162, 255), (11, 61, 145)) if palette != "red" else ((255, 75, 75), (170, 10, 20))
        grad = np.linspace(0, 1, 200)[:, None, None]
        fill = (np.array(c1) + (np.array(c2) - np.array(c1)) * grad).repeat(W, 1).astype(np.uint8)
        layer = Image.fromarray(fill).convert("RGBA")
        layer.putalpha(mask)
        shadow = Image.new("RGBA", (W, 200), (6, 26, 58, 0))  # solid color, alpha from mask
        shadow.putalpha(mask.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.35)))
        bg.alpha_composite(shadow, (0, ty + 10))
        outline = Image.new("RGBA", (W, 200), (255, 255, 255, 0))
        outline.putalpha(mask.filter(ImageFilter.MaxFilter(9)))
        bg.alpha_composite(outline, (0, ty))
        bg.alpha_composite(layer, (0, ty))
    return bg.convert("RGB")


def vertical():
    VERT.mkdir(parents=True, exist_ok=True)
    made = json.loads((CUT / "made.json").read_text())
    for role, fname in made.items():
        rgba = np.array(Image.open(CUT / fname).convert("RGBA"))
        pal = "red" if role.startswith("red") else "blue" if role.startswith("blue") else "neutral"
        wf = 0.86 if role == "pair" else 0.62
        for title in (False, True):
            out = VERT / f"{role}_{'title' if title else 'clean'}.png"
            compose_vertical(rgba, pal, title=title, width_frac=wf).save(out)
            print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "all"
    if step in ("inspect", "all"):
        inspect()
    if step in ("cutout", "all"):
        cutout()
    if step in ("vertical", "all"):
        vertical()
