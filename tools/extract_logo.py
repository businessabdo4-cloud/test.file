"""Key the white wordmark/icons out of assets/logo.png into transparent PNGs for the end-card animation.
The thin grid (min channel ≈125) is rejected; the white artwork (≈255) is kept with anti-aliased edges."""
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "logo"
OUT.mkdir(exist_ok=True)
rgb = np.asarray(Image.open(ROOT / "assets" / "logo.png").convert("RGB")).astype(float)
m = rgb.min(axis=2)
alpha = np.clip((m - 170) / (240 - 170), 0, 1)
alpha[alpha < 0.04] = 0

def save(a, name):
    ys, xs = np.nonzero(a > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    crop = a[y0:y1, x0:x1]
    img = np.zeros((*crop.shape, 4), np.uint8)
    img[..., :3] = 255
    img[..., 3] = (crop * 255).round().astype(np.uint8)
    Image.fromarray(img, "RGBA").save(OUT / f"{name}.png")
    return {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}

def bands(profile, min_gap):
    on = profile > 0
    runs, start, gap = [], None, 0
    for i, v in enumerate(on):
        if v:
            if start is None: start = i
            gap = 0; end = i
        elif start is not None:
            gap += 1
            if gap >= min_gap: runs.append((start, end + 1)); start = None
    if start is not None: runs.append((start, end + 1))
    return runs

rows = bands((alpha > 0.5).sum(axis=1) > 3, 12)
assert len(rows) == 3, rows
meta = {"source": [1080, 1080], "parts": {}}
names = ["city", "storema", "icons"]
for name, (y0, y1) in zip(names, rows):
    a = np.zeros_like(alpha); a[y0:y1] = alpha[y0:y1]
    meta["parts"][name] = save(a, name)
meta["parts"]["full"] = save(alpha, "full")
# letters of STORE.MA (column runs) for the type-on reveal, relative to the storema crop
sm = meta["parts"]["storema"]
cols = bands((alpha[rows[1][0]:rows[1][1]] > 0.5).sum(axis=0) > 0, 3)
meta["storemaGlyphs"] = [[int(a - sm["x"]), int(b - sm["x"])] for a, b in cols]
# individual icons
y0, y1 = rows[2]
icons = bands((alpha[y0:y1] > 0.5).sum(axis=0) > 0, 14)
keys = ["phone", "laptop", "watch", "headphones", "controller", "camera"]
assert len(icons) == 6, icons
for k, (x0, x1) in zip(keys, icons):
    a = np.zeros_like(alpha); a[y0:y1, x0:x1] = alpha[y0:y1, x0:x1]
    meta["parts"][f"icon_{k}"] = save(a, f"icon_{k}")
json.dump(meta, open(OUT / "logo_parts.json", "w"), indent=1)
print(json.dumps(meta, indent=1))
