"""Background removal for the supplied official Apple product images (flat studio backgrounds).
rembg's model download (GitHub) is blocked in this environment, and these images sit on perfectly
flat backgrounds, so a border flood-fill + soft edge matte is exact and artefact-free.

assets/products/src/apple_iphone18pro_lineup.png               (pure black bg) -> iphone-18-pro_lineup.png
assets/products/src/apple_iphone18promax_<colour>_pair.png      (#F5F5F7 bg)    -> iphone-18-pro-max_<colour>_pair.png
  <colour> = black | silver | glacier | burgundy
Outputs are cropped to content and written to assets/products/ (scan_products.py publishes them).
"""
import pathlib
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "products" / "src"
DST = ROOT / "assets" / "products"


def cutout(name, out, bg, tol, soft):
    rgb = np.asarray(Image.open(SRC / name).convert("RGB")).astype(float)
    dist = np.abs(rgb - np.array(bg)).max(axis=2)
    near = dist <= tol
    # background = near-bg pixels connected to the image border
    lab, _ = ndimage.label(near)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bgmask = np.isin(lab, border[border > 0])
    fg = ndimage.binary_fill_holes(~bgmask)
    fg = ndimage.binary_opening(fg, iterations=1)
    # soft edge: alpha ramps with distance from the bg colour, only in a 2px band around the edge
    edge = fg & ~ndimage.binary_erosion(fg, iterations=2)
    alpha = fg.astype(float)
    alpha[edge] = np.clip((dist[edge] - tol * 0.5) / soft, 0, 1)
    if bg != (0, 0, 0):  # un-premultiply the light background out of the edge pixels
        a = np.clip(alpha, 1e-3, 1)[..., None]
        rgb = np.where(edge[..., None], np.clip((rgb - np.array(bg) * (1 - a)) / a, 0, 255), rgb)
    ys, xs = np.nonzero(alpha > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    img = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:y1, x0:x1]
    Image.fromarray(img, "RGBA").save(DST / out)
    print(f"{out}: {x1-x0}x{y1-y0}, crop ({x0},{y0})")
    return x0, y0


if (SRC / "apple_iphone18pro_lineup.png").exists():
    cutout("apple_iphone18pro_lineup.png", "iphone-18-pro_lineup.png", (0, 0, 0), tol=3, soft=14)
for f in sorted(SRC.glob("apple_iphone18promax_*_pair.png")):
    colour = f.stem.split("_")[2]
    bg = tuple(int(v) for v in np.asarray(Image.open(f).convert("RGB"))[2, 2])
    cutout(f.name, f"iphone-18-pro-max_{colour}_pair.png", bg, tol=4, soft=18)
