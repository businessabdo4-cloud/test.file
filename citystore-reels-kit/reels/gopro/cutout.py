"""GoPro HERO13 Black images -> assets/gopro/products/ + public/gopro/products/.

- hero13_black_angle.webp: official transparent render (2000x1125 canvas, camera ~600 px): cropped to alpha
  and enhanced x2 (Lanczos + unsharp + slight contrast) because it is shown up to ~900 px wide.
- hero13_black_bundle_kit.webp: official accessory-bundle shot (case, 2 batteries, SanDisk 64GB card, The Handler
  floating grip). City Store confirmed this is the version sold in store, so it is used (intro + cover)."""
import json, pathlib
from PIL import Image, ImageEnhance, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "gopro" / "products" / "src"
dst = ROOT / "assets" / "gopro" / "products"
pub = ROOT / "public" / "gopro" / "products"
pub.mkdir(parents=True, exist_ok=True)

im = Image.open(src / "hero13_black_angle.webp").convert("RGBA")
im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
a = im.getchannel("A")
rgb = ImageEnhance.Contrast(im.convert("RGB").filter(ImageFilter.UnsharpMask(radius=2.4, percent=80, threshold=2))).enhance(1.04)
rgb.putalpha(a)
rgb.save(dst / "hero.png")
rgb.save(pub / "hero.png")
manifest = {"hero": {"src": "gopro/products/hero.png", "w": rgb.width, "h": rgb.height}}
kit = Image.open(src / "hero13_black_bundle_kit.webp").convert("RGBA")
kit = kit.crop(kit.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
kit.save(dst / "bundle.png")
kit.save(pub / "bundle.png")
manifest["bundle"] = {"src": "gopro/products/bundle.png", "w": kit.width, "h": kit.height}
(ROOT / "public" / "gopro" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
