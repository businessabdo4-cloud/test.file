"""Cut out the supplied OnePlus Watch 3 (Emerald Titanium) images -> assets/oneplus/products/ + public/oneplus/products/."""
import json, pathlib, shutil, sys
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "oneplus" / "products" / "src"
dst = ROOT / "assets" / "oneplus" / "products"
pub = ROOT / "public" / "oneplus" / "products"
pub.mkdir(parents=True, exist_ok=True)
# key -> (source file, extra cutout args); white studio shots (the strap loops leave enclosed holes).
# The front shot's strap is cut flat top/bottom and the side shot's strap tips fade to white: feather them.
IMAGES = {
    "front": ("oneplus_watch3_emerald_front.png", dict(feather_edges=70, feather_sides=("top", "bottom"))),
    "angle": ("oneplus_watch3_emerald_angle.webp", {}),
    "side": ("oneplus_watch3_emerald_side.png", dict(feather_edges=50, feather_sides=("bottom",))),
}
manifest = {}
for key, (name, extra) in IMAGES.items():
    cutout(name, f"{key}.png", (255, 255, 255), tol=5, soft=14, src_dir=src, dst_dir=dst, hole_min_area=800, **extra)
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    w, h = Image.open(dst / f"{key}.png").size
    manifest[key] = {"src": f"oneplus/products/{key}.png", "w": w, "h": h}
# lifestyle shot keeps its own dark-green studio background (used as a photo card, not cut out)
life = Image.open(src / "oneplus_watch3_emerald_lifestyle.webp").convert("RGB")
life.save(pub / "lifestyle.jpg", quality=92)
manifest["lifestyle"] = {"src": "oneplus/products/lifestyle.jpg", "w": life.width, "h": life.height}
(ROOT / "public" / "oneplus" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
