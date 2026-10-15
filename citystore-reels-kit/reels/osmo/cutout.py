"""Cut out the supplied DJI Osmo Pocket 4 / Pocket 3 Creator Combo images -> assets/osmo/products/ + public/osmo/products/.
retailer_bundle_pocket3_NOT_USED.png is a retailer kit (memory card, cleaning kit...) that is not the official
Creator Combo content, so it is not used in the reel."""
import json, pathlib, shutil, sys
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "osmo" / "products" / "src"
dst = ROOT / "assets" / "osmo" / "products"
pub = ROOT / "public" / "osmo" / "products"
pub.mkdir(parents=True, exist_ok=True)
IMAGES = {  # key -> source file (white studio backgrounds)
    "pocket4": "osmo_pocket4_front.png",
    "pocket3_combo": "osmo_pocket3_creator_combo.png",
    "pocket3_box": "osmo_pocket3_standard_box.png",
}
manifest = {}
for key, name in IMAGES.items():
    cutout(name, f"{key}.png", (255, 255, 255), tol=5, soft=14, src_dir=src, dst_dir=dst, hole_min_area=600)
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    w, h = Image.open(dst / f"{key}.png").size
    manifest[key] = {"src": f"osmo/products/{key}.png", "w": w, "h": h}
(ROOT / "public" / "osmo" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
