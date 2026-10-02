"""Cut the product photos out of the two supplied price-list posters (assets/pricelists/source/*.png, 600×600).

For each product: crop between its title and price pill → rembg BiRefNet (paper background) → remove wood-circle slivers
(warm orange/tan regions touching the background) → drop small leftover specks → trim → 2× Lanczos upscale + light unsharp mask → assets/pricelists/products/<icon>.png.
The source posters are only 600 px, so each photo starts at ~110 px — keep them modest on the 1080 px sheets."""
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/pricelists/source"
OUT = ROOT / "assets/pricelists/products"
OUT.mkdir(parents=True, exist_ok=True)

# (sheet file, icon key, crop box x0, y0, x1, y1) in 600-px poster coordinates
BOXES = [
    ("supplied_sheet1", "airpods3", 18, 86, 142, 200),
    ("supplied_sheet1", "airpods2", 172, 86, 296, 200),
    ("supplied_sheet1", "airpods4anc", 314, 80, 438, 200),
    ("supplied_sheet1", "airpods4", 455, 80, 572, 200),
    ("supplied_sheet1", "airtagPack", 16, 262, 136, 378),
    ("supplied_sheet1", "cableLightning", 162, 262, 292, 378),
    ("supplied_sheet1", "cableC", 308, 264, 438, 378),
    ("supplied_sheet1", "airtag", 460, 262, 580, 378),
    ("supplied_sheet1", "hub", 12, 448, 142, 566),
    ("supplied_sheet1", "adapter20", 172, 446, 292, 566),
    ("supplied_sheet1", "magsafe", 314, 446, 438, 566),
    ("supplied_sheet1", "earpods", 460, 446, 582, 566),
    ("supplied_sheet2", "whoopLife", 62, 80, 182, 196),
    ("supplied_sheet2", "whoopPeak", 238, 80, 362, 196),
    ("supplied_sheet2", "rayban", 396, 82, 562, 198),
    ("supplied_sheet2", "watchUltra", 62, 262, 182, 382),
    ("supplied_sheet2", "watchSeries", 228, 262, 378, 382),
    ("supplied_sheet2", "watchSE", 408, 262, 552, 382),
    ("supplied_sheet2", "airpodsPro3", 62, 448, 180, 568),
    ("supplied_sheet2", "airpodsPro2", 232, 450, 356, 568),
    ("supplied_sheet2", "airpodsMax", 402, 440, 540, 570),
]

session = new_session("birefnet-general-lite")  # far better than isnet on white-on-white products
# White products that sit on white paper: BiRefNet alone drops parts of them. For these, merge with isnet's mask,
# fill enclosed holes and open away thin rings (none of them has thin parts like cables).
MERGE = {"magsafe", "airpodsPro2", "adapter20", "airtag"}
session_isnet = new_session("isnet-general-use")
# Hand-measured rounded rectangles (poster px: x0, y0, x1, y1, radius) for pure-white parts no model keeps
INCLUDE = {
    "airpodsPro2": [(248, 488, 341, 567, 12)],
    "airpods2": [(196, 92, 276, 113, 12)],
    "magsafe": [(333, 470, 420, 551, 3)],
    "airpods4": [(468, 127, 568, 191, 16), (478, 86, 561, 131, 22)],
    "airpods4anc": [(327, 127, 427, 191, 16), (337, 86, 420, 131, 22)],
}


def rrect_mask(shape, box, origin):
    """Anti-aliased rounded-rectangle mask in 2× crop pixels."""
    x0, y0, x1, y1, r = [v * 2 for v in box]
    ox, oy = origin[0] * 2, origin[1] * 2
    yy, xx = np.mgrid[0:shape[0], 0:shape[1]]
    xx, yy = xx + ox + 0.5, yy + oy + 0.5
    cx, cy = np.clip(xx, x0 + r, x1 - r), np.clip(yy, y0 + r, y1 - r)
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) - r
    return np.clip(0.5 - d, 0, 1)
sheets = {}
meta = {}
for sheet, key, x0, y0, x1, y1 in BOXES:
    im = sheets.setdefault(sheet, Image.open(SRC / f"{sheet}.png").convert("RGB"))
    crop = im.crop((x0, y0, x1, y1)).resize(((x1 - x0) * 2, (y1 - y0) * 2), Image.LANCZOS)
    cut = remove(crop, session=session)  # RGBA, paper removed
    rgba = np.asarray(cut).astype(float)
    hsv = np.asarray(crop.convert("HSV")).astype(float)
    h, s, v = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
    base = rgba[..., 3] / 255
    for box in INCLUDE.get(key, []):
        base = np.maximum(base, rrect_mask(base.shape, box, (x0, y0)))
    if key in MERGE:
        alt = np.asarray(remove(crop, session=session_isnet)).astype(float)[..., 3] / 255
        near = ndimage.binary_dilation(base > 0.5, iterations=12)  # only fill gaps next to BiRefNet's object
        mask = ndimage.binary_fill_holes((base > 0.5) | ((alt > 0.35) & near))
        mask = ndimage.binary_opening(mask, iterations=3)
        mask = ndimage.binary_fill_holes(mask)
        base = np.maximum(base * mask, np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(float) / 255)
    # wood: only remove wood-coloured regions that connect to the outside background (edge slivers);
    # warm reflections inside a product are left alone
    wood = (h > 17) & (h < 44) & (s > 0.18) & (v > 0.35) & (v < 0.97) & (base > 0.1)
    bg_near = ndimage.binary_dilation(base < 0.1, iterations=4)
    lab_w, nw = ndimage.label(wood)
    edge_ids = np.unique(lab_w[bg_near & (lab_w > 0)])
    edge_wood = np.isin(lab_w, edge_ids[edge_ids > 0])
    wood_soft = np.asarray(Image.fromarray((edge_wood * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(float) / 255
    alpha = base * (1 - wood_soft)
    alpha[alpha < 0.06] = 0
    # drop specks / wood slivers: keep components at least 2% of the largest one
    lab, n = ndimage.label(alpha > 0.3)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
        keep = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz >= 0.02 * sizes.max()])
        alpha *= ndimage.binary_dilation(keep, iterations=2)
    out = np.dstack([np.asarray(crop).astype(float), alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = img.getchannel("A").point(lambda a: 255 if a > 20 else 0).getbbox()
    img = img.crop(bbox)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
    img.save(OUT / f"{key}.png")
    meta[key] = {"w": img.width, "h": img.height, "source": f"{sheet}.png", "box": [x0, y0, x1, y1]}
    print(f"{key:15s} {img.width}×{img.height}")
json.dump(meta, open(OUT / "products.json", "w"), indent=1)
