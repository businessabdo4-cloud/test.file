"""AirPods 5 images -> assets/airpods/products/ + public/airpods/products/.

v2 (2026-10-10): City Store supplied higher-quality images, already transparent (RGBA, 1000-2000 px), so they
are only cropped to their alpha (no upscaling, no keying):
- hq_airpods5_open_case.webp -> open_case.png   (earbuds above the open case)
- hq_airpods5_buds.webp      -> buds.png        (the two earbuds)
- hq_airpods5_case_with_buds.png -> case.png    (case with the earbuds inside)
NOT USED: hq_stem_controls_diagram_NOT_USED.png (198 px control diagram with touch-zone overlays),
the first, low-res set (airpods5_open_case.png / airpods5_box_contents.png, kept in src/ for reference),
rumor_graphic_NOT_USED.png (pre-launch rumour graphic) and lesnumeriques_review_photo_NOT_USED.webp
(third-party review photo with watermark)."""
import json, pathlib, shutil
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "airpods" / "products" / "src"
dst = ROOT / "assets" / "airpods" / "products"
pub = ROOT / "public" / "airpods" / "products"
pub.mkdir(parents=True, exist_ok=True)
JOBS = {"open_case": "hq_airpods5_open_case.webp", "buds": "hq_airpods5_buds.webp", "case": "hq_airpods5_case_with_buds.png"}
manifest = {}
for key, name in JOBS.items():
    im = Image.open(src / name).convert("RGBA")
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
    im.save(dst / f"{key}.png")
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    manifest[key] = {"src": f"airpods/products/{key}.png", "w": im.width, "h": im.height}
(ROOT / "public" / "airpods" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
