#!/usr/bin/env python3
"""GLASSE MAX product image pipeline.

  1. inspect : convert every image in assets/products/ to PNG (assets/products/png/),
               report size + whether the background is plain, write a roles.json guess.
  2. cutout  : remove plain backgrounds (BiRefNet via rembg), de-fringe the white halo,
               split the 3-colour shot (teal / black / white) into single units, 2x Real-ESRGAN.

Roles (assets/products/roles.json maps file -> role):
  trio                       the three colours side by side on white  -> trio + teal/black/white_front cut-outs
  teal_front / black_front / white_front   a single unit on white     -> cut-out
  teal_faucet ...            unit + faucet + glass composite           -> cut-out of the whole composite
  teal_undersink, teal_kitchen, teal_back, ... (any colour)            -> used as photos, no cut-out
  skip                       ignored

Usage: python3 scripts/process_products.py [inspect|cutout|all]
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PROD = ROOT / "assets/products"
PNG = PROD / "png"
CUT = PROD / "cutout"

sys.path.insert(0, str(Path(__file__).parent))

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
        print(f"\nwrote {roles} — map each file to a role (trio, teal_front, black_front, white_front,\n"
              "teal_faucet, teal_undersink, teal_kitchen, teal_back, ... same for black/white, or skip)")
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
    """teal, black or white unit?"""
    px = rgba[..., :3][rgba[..., 3] > 200].astype(int)
    lum = px.mean(1)
    sat = px.max(1) - px.min(1)
    if (sat > 60).mean() > 0.3:
        return "teal"
    return "black" if np.median(lum) < 90 else "white"


def split_trio(rgba):
    """Cut the 3-unit shot at the two emptiest columns (the gaps between units)."""
    a = rgba[..., 3] > 40
    h, w = a.shape
    body = a[: int(h * 0.8)]  # ignore the floor reflection
    prof = np.convolve(body.sum(0).astype(float), np.ones(15) / 15, "same")
    c1 = int(w * 0.2) + int(np.argmin(prof[int(w * 0.2):int(w * 0.5)]))
    c2 = int(w * 0.5) + int(np.argmin(prof[int(w * 0.5):int(w * 0.8)]))
    out = []
    for x0, x1 in ((0, c1), (c1, c2), (c2, w)):
        one = rgba.copy()
        one[:, :x0, 3] = 0
        one[:, x1:, 3] = 0
        out.append(crop_rgba(one))
    return out


def cutout(roles=None, upscale=True):
    CUT.mkdir(parents=True, exist_ok=True)
    roles = roles or json.loads((PROD / "roles.json").read_text())
    made = {}

    def save(name, rgba):
        Image.fromarray(rgba).save(CUT / f"{name}.png")
        if upscale:
            Image.fromarray(upscale_rgba(rgba)).save(CUT / f"{name}@2x.png")
            made[name] = f"{name}@2x.png"
        else:
            made[name] = f"{name}.png"

    for fname, role in roles.items():
        if role in ("skip", "?") or role.endswith(("undersink", "kitchen", "back")):
            continue
        rgb = np.array(Image.open(PNG / fname).convert("RGB"))
        alpha = remove_bg(rgb)
        fg, alpha = defringe(rgb, alpha)
        rgba = crop_rgba(np.dstack([fg, alpha]))
        if role == "trio":
            save("trio", rgba)
            for single in split_trio(rgba):
                col = color_of(single)
                if f"{col}_front" not in made:
                    save(f"{col}_front", single)
        else:
            save(role, rgba)
        print("cut", fname, "->", role)
    (CUT / "made.json").write_text(json.dumps(made, indent=2))
    return made


if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "all"
    if step in ("inspect", "all"):
        inspect()
    if step in ("cutout", "all"):
        cutout(upscale="--no-upscale" not in sys.argv)
