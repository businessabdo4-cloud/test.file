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


def _largest_filled(mask):
    """Largest connected component of `mask`, with its holes (labels, logos) filled."""
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    if n < 2:
        return np.zeros_like(mask, bool)
    keep = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    cnts, _ = cv2.findContours(keep, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    filled = np.zeros_like(keep)
    cv2.drawContours(filled, cnts, -1, 1, cv2.FILLED)
    return filled > 0


def split_trio(rgba):
    """The white unit (front-right, fully visible), separated by colour.

    In the supplied trio photo the black unit hides the teal one's right side and is itself
    partly hidden, so only the white unit makes a clean single cut-out.
    """
    rgb = rgba[..., :3].astype(int)
    a = rgba[..., 3]
    h, w = a.shape
    body = np.zeros_like(a, bool)
    body[: int(h * 0.97)] = True  # drop any floor reflection
    sat = rgb.max(2) - rgb.min(2)
    lum = rgb.mean(2)
    white = (a > 40) & body & (lum > 150) & (sat < 45)
    out = {}
    for name, m in (("white_front", white),):
        unit = _largest_filled(m)
        unit = cv2.dilate(unit.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
        one = rgba.copy()
        one[..., 3] = np.where(unit, a, 0)
        out[name] = crop_rgba(one)
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
            for name, single in split_trio(rgba).items():
                if name not in made:
                    save(name, single)
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
