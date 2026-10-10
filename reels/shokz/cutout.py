"""Shokz images -> assets/shokz/products/ + public/shokz/products/.

City Store sells the OpenRun Pro (1st gen). The first images supplied (shokz_openrun_pro2_*) show the OpenRun
Pro 2 (DualPitch label, square transducers), so they are only STAND-INS until OpenRun Pro (1st gen) images are
supplied: put them in src/ and point SLOTS at them (any of: transparent PNG/WebP, or white background)."""
import json, pathlib, shutil, sys
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "shokz" / "products" / "src"
dst = ROOT / "assets" / "shokz" / "products"
pub = ROOT / "public" / "shokz" / "products"
pub.mkdir(parents=True, exist_ok=True)
SLOTS = {  # key -> source file
    "hero": "shokz_openrun_pro2_angle.png",        # STAND-IN (Pro 2)
    "front": "shokz_openrun_pro2_front.webp",      # STAND-IN (Pro 2)
    "side": "shokz_openrun_pro2_dualpitch_closeup.png",  # STAND-IN (Pro 2)
    "runner": "shokz_openrun_pro2_runner.png",     # STAND-IN (Pro 2), lifestyle
}
STAND_IN = any("pro2" in v for v in SLOTS.values())
manifest = {"_standIn": STAND_IN}
for key, name in SLOTS.items():
    im = Image.open(src / name)
    if im.mode == "RGBA" and im.getextrema()[3][0] < 250:
        im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()).save(dst / f"{key}.png")
    else:
        bg = tuple(int(v) for v in im.convert("RGB").getpixel((1, 1)))
        cutout(name, f"{key}.png", bg, tol=4, soft=10, src_dir=src, dst_dir=dst, hole_min_area=600)
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    w, h = Image.open(dst / f"{key}.png").size
    manifest[key] = {"src": f"shokz/products/{key}.png", "w": w, "h": h}
(ROOT / "public" / "shokz" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
