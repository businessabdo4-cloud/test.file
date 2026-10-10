"""AirPods 5 images -> assets/airpods/products/ + public/airpods/products/.
- airpods5_open_case.png (752 px): enhanced 2x (Lanczos + unsharp) then cut out
- airpods5_box_contents.png (700 px): the earbuds and the case are cropped out separately (without the
  slide's text), enhanced 2.5x, then cut out
- NOT USED: rumor_graphic_NOT_USED.png (pre-launch rumour graphic, not official) and
  lesnumeriques_review_photo_NOT_USED.webp (third-party review photo with watermark)
White product on white background: very tight key (tol 2) so the white plastic edges survive."""
import json, pathlib, shutil, sys
from PIL import Image, ImageEnhance, ImageFilter
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "airpods" / "products" / "src"
dst = ROOT / "assets" / "airpods" / "products"
pub = ROOT / "public" / "airpods" / "products"
pub.mkdir(parents=True, exist_ok=True)
manifest = {}


def enhance(im, scale):
    im = im.convert("RGB").resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.8, percent=80, threshold=2))
    return ImageEnhance.Contrast(im).enhance(1.03)


JOBS = {  # key -> (source, crop box or None, scale)
    "open_case": ("airpods5_open_case.png", None, 2),
    "buds": ("airpods5_box_contents.png", (92, 215, 330, 445), 2.5),
    "case": ("airpods5_box_contents.png", (368, 222, 612, 445), 2.5),
}
for key, (name, box, scale) in JOBS.items():
    im = Image.open(src / name)
    if box:
        im = im.crop(box)
    bg = tuple(int(v) for v in im.convert("RGB").getpixel((1, 1)))
    tmp = f"_{key}_x{scale}.png"
    enhance(im, scale).save(src / tmp)
    cutout(tmp, f"{key}.png", bg, tol=2, soft=8, src_dir=src, dst_dir=dst, hole_min_area=600)
    shutil.copy(dst / f"{key}.png", pub / f"{key}.png")
    w, h = Image.open(dst / f"{key}.png").size
    manifest[key] = {"src": f"airpods/products/{key}.png", "w": w, "h": h}
(ROOT / "public" / "airpods" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
