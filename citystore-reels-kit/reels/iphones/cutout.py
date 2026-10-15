"""Cut out the supplied iPhone 18 Pro (Burgundy) / iPhone 17 Pro (Orange, Silver) images
-> assets/iphones/products/ + public/iphones/products/. Background colour read from each corner."""
import json, pathlib, shutil, sys
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "iphones" / "products" / "src"
dst = ROOT / "assets" / "iphones" / "products"
pub = ROOT / "public" / "iphones" / "products"
pub.mkdir(parents=True, exist_ok=True)
IMAGES = {  # key -> (source file, tolerance); the silver phone is light grey on white: tight key
    "p17_orange": ("iphone17pro_orange_pair.webp", 5),
    "p17_silver": ("iphone17pro_silver_pair.png", 3),
    "p18_burgundy": ("iphone18pro_burgundy_pair.png", 4),
    "p18_front": ("iphone18pro_burgundy_front.png", 4),
}
manifest = {}
for key, (name, tol) in IMAGES.items():
    bg = tuple(int(v) for v in Image.open(src / name).convert("RGB").getpixel((1, 1)))
    cutout(name, f"{key}.png", bg, tol=tol, soft=10, src_dir=src, dst_dir=dst, hole_min_area=400)
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    w, h = Image.open(dst / f"{key}.png").size
    manifest[key] = {"src": f"iphones/products/{key}.png", "w": w, "h": h}
(ROOT / "public" / "iphones" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
