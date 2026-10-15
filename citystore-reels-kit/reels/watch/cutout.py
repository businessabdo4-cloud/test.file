"""Cut out the supplied Apple Watch Ultra 4 image -> assets/watch/products/ + public/watch/products/."""
import json, pathlib, shutil, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "watch" / "products" / "src"
dst = ROOT / "assets" / "watch" / "products"
pub = ROOT / "public" / "watch" / "products"
pub.mkdir(parents=True, exist_ok=True)
cutout("apple_watch_ultra4_black_burgundy_trail_loop.webp", "watch-ultra-4_black_burgundy.png", (250, 250, 250),
       tol=6, soft=16, src_dir=src, dst_dir=dst, feather_edges=70, hole_min_area=1500)
shutil.copy(dst / "watch-ultra-4_black_burgundy.png", pub / "watch-ultra-4_black_burgundy.png")
(ROOT / "public" / "watch" / "data" / "products.json").write_text(
    json.dumps({"watch": "watch/products/watch-ultra-4_black_burgundy.png"}, indent=1) + "\n")
