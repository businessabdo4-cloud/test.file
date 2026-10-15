"""Cut out the supplied Sony WH-1000XM6 images -> assets/sony/products/ + public/sony/products/."""
import json, pathlib, shutil, sys
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "sony" / "products" / "src"
dst = ROOT / "assets" / "sony" / "products"
pub = ROOT / "public" / "sony" / "products"
pub.mkdir(parents=True, exist_ok=True)
# key -> (source file, background colour)
IMAGES = {
    "xm6_black": ("sony_wh1000xm6_black.png", (244, 246, 250)),
    "xm6_blue": ("sony_wh1000xm6_midnight_blue.png", (255, 255, 255)),
    # drop the XM5 image here as assets/sony/products/src/sony_wh1000xm5_black.png (background read from its corner)
    "xm5_black": ("sony_wh1000xm5_black.png", None),
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
    manifest[key] = {"src": f"sony/products/{key}.png", "w": w, "h": h}
(ROOT / "public" / "sony" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
