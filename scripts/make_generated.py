#!/usr/bin/env python3
"""Build extra images from the REAL product photos (crops, cut-outs, compositions).

Nothing is redrawn: every product pixel comes from the store's own photos.
Crop boxes (fractions of the source image) live in assets/generated/crops.json — adjust
them there if a close-up is off, then re-run.

Outputs (assets/generated/):
  side_by_side_red_blue.png   1080x1920 split background, both real cut-outs
  product_with_glass_<c>.png  1080x1920 crop of the store composite (faucet + glass + unit)
  closeup_filters.png         filter cartridges seen through the transparent cover
  closeup_connectors.png      inlet / drain / faucet connectors (back view)
  faucet_cutout.png           the 304 stainless faucet, background removed
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import process_products as pp  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PROD = ROOT / "assets/products"
GEN = ROOT / "assets/generated"
W, H = 1080, 1920

DEFAULT_CROPS = {
    "_help": "Boxes are [left, top, right, bottom] as fractions of the source image.",
    "faucet": {"role": "red_composite", "box": [0.75, 0.55, 0.99, 0.79]},
    "filters": {"role": "blue_undersink", "box": [0.46, 0.38, 0.79, 0.68]},
    "filters_red": {"role": "red_undersink", "box": [0.45, 0.37, 0.80, 0.68]},
    "connectors": {"role": "blue_back", "box": [0.47, 0.35, 0.78, 0.66]},
    "glass_red": {"role": "red_composite", "box": [0.0, 0.0, 0.5625, 1.0]},
    "glass_blue": {"role": "blue_composite", "box": [0.0, 0.0, 0.5625, 1.0]},
}


def src_for(role, roles):
    for f, r in roles.items():
        if r == role:
            return PROD / "png" / f
    return None


def crop(img, box):
    w, h = img.size
    l, t, r, b = box
    return img.crop((int(l * w), int(t * h), int(r * w), int(b * h)))


def up2(img):
    """2x Real-ESRGAN, keeping alpha if present."""
    arr = np.array(img.convert("RGBA"))
    return Image.fromarray(pp.upscale_rgba(arr))


def fit_cover(img, size):
    tw, th = size
    s = max(tw / img.width, th / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    l, t = (img.width - tw) // 2, (img.height - th) // 2
    return img.crop((l, t, l + tw, t + th))


def circle_closeup(img, size=800):
    img = fit_cover(img.convert("RGB"), (size, size))
    mask = Image.new("L", (size, size), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def side_by_side():
    made = json.loads((PROD / "cutout/made.json").read_text())
    if "red_front" not in made or "blue_front" not in made:
        return
    left = pp.compose_vertical(np.array(Image.open(PROD / "cutout" / made["blue_front"])), "blue", width_frac=0.4)
    right = pp.compose_vertical(np.array(Image.open(PROD / "cutout" / made["red_front"])), "red", width_frac=0.4, seed=5)
    out = Image.new("RGB", (W, H))
    out.paste(left.crop((W // 4, 0, W // 4 + W // 2, H)), (0, 0))
    out.paste(right.crop((W // 4, 0, W // 4 + W // 2, H)), (W // 2, 0))
    out.paste((255, 255, 255), (W // 2 - 4, 0, W // 2 + 4, H))
    out.save(GEN / "side_by_side_red_blue.png")
    print("wrote side_by_side_red_blue.png")


def main():
    GEN.mkdir(parents=True, exist_ok=True)
    cfg_path = GEN / "crops.json"
    if not cfg_path.exists():
        cfg_path.write_text(json.dumps(DEFAULT_CROPS, indent=2))
    crops = json.loads(cfg_path.read_text())
    roles = json.loads((PROD / "roles.json").read_text())

    for name, c in crops.items():
        if name.startswith("_"):
            continue
        src = src_for(c["role"], roles)
        if not src:
            print(f"skip {name}: no image with role {c['role']}")
            continue
        img = crop(Image.open(src).convert("RGB"), c["box"])
        if name == "faucet":
            rgb = np.array(img)
            fg, a = pp.defringe(rgb, pp.remove_bg(rgb))
            cut = Image.fromarray(pp.crop_rgba(np.dstack([fg, a])))
            up2(cut).save(GEN / "faucet_cutout.png")
        elif name in ("filters", "filters_red", "connectors"):
            circle_closeup(up2(img)).save(GEN / f"closeup_{name}.png")
        elif name.startswith("glass_"):
            fit_cover(up2(img).convert("RGB"), (W, H)).save(GEN / f"product_with_{name}.png")
        print("wrote", name)
    side_by_side()


if __name__ == "__main__":
    main()
