"""Sample brand gradient colours from assets/logo.png (or logo_source.jpg).
Samples background pixels only (avoids the white wordmark/grid) at the far-left and
far-right edges plus intermediate stops, and writes src/brand.generated.json."""
import json, sys, pathlib
import numpy as np
from PIL import Image

root = pathlib.Path(__file__).resolve().parent.parent
src = root / "assets" / "logo.png"
if not src.exists():
    src = root / "assets" / "logo_source.jpg"
im = np.asarray(Image.open(src).convert("RGB")).astype(float)
h, w, _ = im.shape

def bg_mask(px):
    # exclude near-white (text, icons, grid lines)
    return (px.min(axis=-1) < 200) & (np.abs(px - px.mean(axis=-1, keepdims=True)).max(axis=-1) > 25)

def sample(x0, x1, y0=0.0, y1=1.0):
    region = im[int(y0*h):int(y1*h), int(x0*w):int(x1*w)].reshape(-1, 3)
    region = region[bg_mask(region)]
    return np.median(region, axis=0)

def hexc(c):
    return "#%02X%02X%02X" % tuple(int(round(v)) for v in c)

stops = {}
for pos in [0.0, 0.25, 0.5, 0.75, 1.0]:
    x0 = max(0, pos - 0.02); x1 = min(1, pos + 0.02)
    if pos == 0.0: x1 = 0.03
    if pos == 1.0: x0 = 0.97
    # top & bottom bands avoid the wordmark
    top = sample(x0, x1, 0.02, 0.18); bot = sample(x0, x1, 0.85, 0.98)
    stops[pos] = (top + bot) / 2

# grid line colour/opacity estimate: brightest thin lines vs bg
row = im[int(0.95*h)]
out = {
    "source": src.name,
    "gradientStart": hexc(stops[0.0]),
    "gradientMid": hexc(stops[0.5]),
    "gradientEnd": hexc(stops[1.0]),
    "stops": {str(k): hexc(v) for k, v in stops.items()},
}
(root / "src").mkdir(exist_ok=True)
(root / "src" / "brand.generated.json").write_text(json.dumps(out, indent=2) + "\n")
print(json.dumps(out, indent=2))
