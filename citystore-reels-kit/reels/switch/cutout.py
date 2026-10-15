"""Cut out the supplied Nintendo Switch OLED images -> assets/switch/products/ + public/switch/products/.
White consoles on white backgrounds: tight tolerance so the white Joy-Con/dock edges survive."""
import json, pathlib, shutil, sys
from PIL import Image
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "switch" / "products" / "src"
dst = ROOT / "assets" / "switch" / "products"
pub = ROOT / "public" / "switch" / "products"
pub.mkdir(parents=True, exist_ok=True)
IMAGES = {  # key -> (source file, tolerance)
    "neon_dock": ("switch_oled_neon_dock.png", 6),
    "white_dock": ("switch_oled_white_dock.webp", 3),
    "white_handheld": ("switch_oled_white_handheld.png", 3),
    "neon_tabletop": ("switch_oled_neon_tabletop.png", 4),  # transparent border around an opaque white box
}
FLOOR = {"neon_dock", "white_dock"}  # studio floor shadow under the dock to remove
manifest = {}
for key, (name, tol) in IMAGES.items():
    im = Image.open(src / name)
    if im.mode == "RGBA":  # flatten onto white so one key handles both the border and the white box
        flat = Image.new("RGB", im.size, (255, 255, 255))
        flat.paste(im, mask=im.getchannel("A"))
        name = name.rsplit(".", 1)[0] + "_flat.png"
        flat.save(src / name)
    cutout(name, f"{key}.png", (255, 255, 255), tol=tol, soft=10, src_dir=src, dst_dir=dst, hole_min_area=400)
    if key in FLOOR:
        a = np.asarray(Image.open(dst / f"{key}.png").convert("RGBA")).astype(np.float32)
        lum = a[..., :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
        dark_rows = np.flatnonzero(((lum < 120) & (a[..., 3] > 128)).sum(axis=1) > a.shape[1] * 0.05)
        base = int(dark_rows.max())  # last row of the dock/grip bottoms
        below = a[base:, :, 3] * np.clip((150 - lum[base:]) / 40, 0, 1)
        a[base:, :, 3] = below
        out = Image.fromarray(a.astype(np.uint8), "RGBA")
        out.crop(out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()).save(dst / f"{key}.png")
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    w, h = Image.open(dst / f"{key}.png").size
    manifest[key] = {"src": f"switch/products/{key}.png", "w": w, "h": h}
(ROOT / "public" / "switch" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
