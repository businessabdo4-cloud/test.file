"""Shokz OpenRun Pro (1st gen) images -> assets/shokz/products/ + public/shokz/products/.

City Store sells the OpenRun Pro (1st gen). The first images supplied (shokz_openrun_pro2_*) show the OpenRun
Pro 2 (DualPitch label) and are NOT used. Second set (openrunpro_*) = 1st gen:
- openrunpro_angle.png / openrunpro_front.webp: transparent product shots (cropped to alpha)
- openrunpro_turbopitch_slide.webp: Shokz marketing slide; only the photo below its English text is used
  ("ear" photo card for the bone-conduction scene)
- openrunpro_controls_slide_NOT_USED.png: not used (feature not in the VO)"""
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
    "hero": "openrunpro_angle.png",
    "front": "openrunpro_front.webp",
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
# photo card: TurboPitch slide cropped below its text (transducer at ~(0.55, 0.50) of the crop)
ear = Image.open(src / "openrunpro_turbopitch_slide.webp").convert("RGB").crop((250, 470, 1150, 1400))
ear.save(dst / "ear.jpg", quality=92)
shutil.copy(dst / "ear.jpg", pub / "ear.jpg")
manifest["ear"] = {"src": "shokz/products/ear.jpg", "w": ear.width, "h": ear.height}
(ROOT / "public" / "shokz" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
