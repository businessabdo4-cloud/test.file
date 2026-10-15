"""Cuts the real City Store wordmark out of assets/logo.png as white-on-transparent layers
so the end card can rebuild the logo piece by piece (CITY slam, STORE.MA typing, icon pops).
Outputs public/logo/*.png + public/logo/layout.json (boxes in the 1080x1080 logo space)."""
import json, pathlib
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "logo"
OUT.mkdir(parents=True, exist_ok=True)
rgb = np.asarray(Image.open(ROOT / "assets" / "logo.png").convert("RGB")).astype(float)
H, W, _ = rgb.shape
alpha = np.clip((rgb[..., 0] - 150) / (235 - 150), 0, 1)  # red channel separates white from the blue bg + grid
mask = alpha > 0.5


def runs(v, min_len=1):
    out, start = [], None
    for i, on in enumerate(list(v) + [False]):
        if on and start is None:
            start = i
        elif not on and start is not None:
            if i - start >= min_len:
                out.append([start, i])
            start = None
    return out


rows = runs(mask.sum(1) > 8)
assert len(rows) == 3, rows
pad = 8


def save(name, x0, y0, x1, y1):
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
    a = (alpha[y0:y1, x0:x1] * 255).astype(np.uint8)
    img = np.dstack([np.full_like(a, 255)] * 3 + [a])
    Image.fromarray(img, "RGBA").save(OUT / f"{name}.png")
    return {"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0, "file": f"logo/{name}.png"}


layout = {"size": W}
(cy0, cy1), (sy0, sy1), (iy0, iy1) = rows
ccols = runs(mask[cy0:cy1].sum(0) > 0)
layout["city"] = save("city", ccols[0][0], cy0, ccols[-1][1], cy1)
scols = runs(mask[sy0:sy1].sum(0) > 0)
layout["storema"] = save("storema", scols[0][0], sy0, scols[-1][1], sy1)
# letter boundaries for the typewriter reveal: S T O R E . M A
prof = mask[sy0:sy1].sum(0).astype(float)
edges = [r[1] for r in scols]  # right edge of each connected run
first = scols[0]
if len(scols) < 8:  # first run holds several touching letters: split at column minima
    need = 8 - len(scols)
    seg = prof[first[0]:first[1]]
    width = (first[1] - first[0]) / (need + 1)
    splits = []
    for k in range(1, need + 1):
        c = int(first[0] + k * width)
        lo, hi = c - int(width * 0.3), c + int(width * 0.3)
        splits.append(lo + int(np.argmin(prof[lo:hi])))
    edges = splits + edges
layout["storemaLetters"] = [e - layout["storema"]["x"] for e in sorted(edges)]
icols = runs(mask[iy0:iy1].sum(0) > 0)
merged = []
for r in icols:  # merge tiny runs (watch crown) into the previous icon
    if merged and (r[1] - r[0] < 12 or r[0] - merged[-1][1] < 6):
        merged[-1][1] = r[1]
    else:
        merged.append(r)
layout["icons"] = [save(f"icon_{k}", a, iy0, b, iy1) for k, (a, b) in enumerate(merged)]
(OUT / "layout.json").write_text(json.dumps(layout, indent=1) + "\n")
print(json.dumps({k: v for k, v in layout.items() if k != "icons"}), len(layout["icons"]), "icons")
