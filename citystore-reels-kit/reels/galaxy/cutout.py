"""Cut out the supplied Samsung product images -> assets/galaxy/products/ + public/galaxy/products/."""
import json, pathlib, shutil, sys
import numpy as np
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "galaxy" / "products" / "src"
dst = ROOT / "assets" / "galaxy" / "products"
pub = ROOT / "public" / "galaxy" / "products"
pub.mkdir(parents=True, exist_ok=True)

cutout("samsung_galaxy_watch_ultra2_front.webp", "ultra2_front.png", (254, 254, 254), tol=5, soft=14, src_dir=src, dst_dir=dst)
cutout("samsung_galaxy_watch_ultra2_angle.png", "ultra2_angle.png", (255, 255, 255), tol=5, soft=14, src_dir=src, dst_dir=dst, hole_min_area=400)
cutout("samsung_galaxy_watch8_classic_angle.png", "classic_angle.png", (255, 255, 255), tol=5, soft=14, src_dir=src, dst_dir=dst,
       feather_edges=40, hole_min_area=400, feather_sides=("top", "bottom"))
# the front Classic image is already transparent: crop to content only
im = Image.open(src / "samsung_galaxy_watch8_classic_front.png").convert("RGBA")
a = np.asarray(im)
ys, xs = np.nonzero(a[..., 3] > 8)
box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
im.crop(box).save(dst / "classic_front.png")
print("classic_front.png crop", box)

manifest = {}
for name in ("ultra2_front", "ultra2_angle", "classic_angle", "classic_front"):
    shutil.copy(dst / f"{name}.png", pub / f"{name}.png")
    w, h = Image.open(dst / f"{name}.png").size
    manifest[name] = {"src": f"galaxy/products/{name}.png", "w": w, "h": h}
(ROOT / "public" / "galaxy" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
