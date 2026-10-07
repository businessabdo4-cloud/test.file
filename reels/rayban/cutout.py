"""Cut out the supplied Ray-Ban Meta Gen 2 images -> assets/rayban/products/ + public/rayban/products/."""
import json, pathlib, shutil, sys
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "rayban" / "products" / "src"
dst = ROOT / "assets" / "rayban" / "products"
pub = ROOT / "public" / "rayban" / "products"
pub.mkdir(parents=True, exist_ok=True)
# key -> (source file, background colour)
IMAGES = {
    "headliner_front": ("headliner_gen2_front.png", (242, 242, 242)),
    "headliner_angle": ("headliner_gen2_angle.webp", None),
    "wayfarer_front": ("wayfarer_gen2_front.png", (242, 242, 242)),
    "wayfarer_angle": ("wayfarer_gen2_angle.webp", None),
}
manifest = {}
for key, (name, bg) in IMAGES.items():
    if not (src / name).exists():
        continue
    im = Image.open(src / name)
    if im.mode == "RGBA" and im.getextrema()[3][0] < 250:
        # already transparent: keep the supplied alpha, just crop to content
        im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()).save(dst / f"{key}.png")
    else:
        if bg is None:
            bg = tuple(int(v) for v in im.convert("RGB").getpixel((1, 1)))
        cutout(name, f"{key}.png", bg, tol=6, soft=14, src_dir=src, dst_dir=dst, hole_min_area=600)
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    w, h = Image.open(dst / f"{key}.png").size
    manifest[key] = {"src": f"rayban/products/{key}.png", "w": w, "h": h}
(ROOT / "public" / "rayban" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
