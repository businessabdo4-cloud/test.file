"""DJI Mic Mini 2 images -> assets/micmini/products/ + public/micmini/products/.
- case_hero (447 px, low-res): enhanced first (2x Lanczos upscale + unsharp mask + slight local contrast), then cut out
- kit_flatlay / dark_studio: used as photo cards (rounded), lightly sharpened
- marketing_collage: only the left panel photo (Osmo Pocket + clipped transmitter) is used, cropped below its text label
No AI upscaler is available offline; the enhancement is classic resampling + sharpening."""
import json, pathlib, shutil, sys
from PIL import Image, ImageEnhance, ImageFilter
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
from cutout_products import cutout  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "micmini" / "products" / "src"
dst = ROOT / "assets" / "micmini" / "products"
pub = ROOT / "public" / "micmini" / "products"
pub.mkdir(parents=True, exist_ok=True)
manifest = {}


def enhance(im, scale, radius=1.6, percent=90, contrast=1.04):
    im = im.convert("RGB")
    if scale != 1:
        im = im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=radius, percent=percent, threshold=2))
    return ImageEnhance.Contrast(im).enhance(contrast)


def add(key, path):
    shutil.copy(path, pub / path.name)
    w, h = Image.open(path).size
    manifest[key] = {"src": f"micmini/products/{path.name}", "w": w, "h": h}


# hero: enhance then cut out (light grey/translucent parts on white: tight tolerance)
enhance(Image.open(src / "micmini2_case_hero.png"), 2).save(src / "micmini2_case_hero_x2.png")
cutout("micmini2_case_hero_x2.png", "case_hero.png", (255, 255, 255), tol=3, soft=10, src_dir=src, dst_dir=dst, hole_min_area=1200)
add("case_hero", dst / "case_hero.png")
# photo cards
enhance(Image.open(src / "micmini2_kit_flatlay.png"), 1, radius=1.2, percent=60, contrast=1.02).crop((80, 230, 920, 800)).save(dst / "kit.jpg", quality=92)
add("kit", dst / "kit.jpg")
enhance(Image.open(src / "micmini2_dark_studio.png"), 1, radius=1.2, percent=60, contrast=1.03).crop((110, 110, 900, 900)).save(dst / "studio.jpg", quality=92)
add("studio", dst / "studio.jpg")
enhance(Image.open(src / "micmini2_marketing_collage.webp"), 1, radius=1.2, percent=60, contrast=1.02).crop((50, 335, 486, 952)).save(dst / "osmo_direct.jpg", quality=92)
add("osmo_direct", dst / "osmo_direct.jpg")
(ROOT / "public" / "micmini" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
