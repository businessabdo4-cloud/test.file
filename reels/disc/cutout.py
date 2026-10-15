"""PlayStation Disc Drive images -> assets/disc/products/ + public/disc/products/.

- ps5_disc_drive.webp: official transparent render of the drive (874x1644): cropped to alpha ("drive").
- ps5_slim_with_disc_drive_exploded.png: official transparent render (768 canvas, product only ~285 px wide) of a
  PS5 Slim Digital body + the drive module + its cover. Split into three pieces for the install animation
  ("console", "module", "cover") and enhanced x3 (Lanczos + unsharp + slight contrast)."""
import json, pathlib
from PIL import Image, ImageEnhance, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "disc" / "products" / "src"
dst = ROOT / "assets" / "disc" / "products"
pub = ROOT / "public" / "disc" / "products"
pub.mkdir(parents=True, exist_ok=True)


def alpha_crop(im):
    return im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())


def enhance(im, k):
    im = im.resize((im.width * k, im.height * k), Image.LANCZOS)
    a = im.getchannel("A")
    rgb = ImageEnhance.Contrast(im.convert("RGB").filter(ImageFilter.UnsharpMask(radius=2.4, percent=90, threshold=2))).enhance(1.04)
    rgb.putalpha(a)
    return rgb


manifest = {}
def save(key, im):
    im.save(dst / f"{key}.png")
    im.save(pub / f"{key}.png")
    manifest[key] = {"src": f"disc/products/{key}.png", "w": im.width, "h": im.height}


# the drive render's alpha is partial across the whole (white) body plus a soft glow/floor shadow: flatten it on
# white and rebuild a solid mask (alpha > 200, eroded 2 px, 1 px anti-alias) so the body is opaque
from PIL import ImageFilter as F
drv = Image.open(src / "ps5_disc_drive.webp").convert("RGBA")
flat = Image.new("RGBA", drv.size, (255, 255, 255, 255))
flat.alpha_composite(drv)
mask = drv.getchannel("A").point(lambda a: 255 if a > 200 else 0).filter(F.MinFilter(5)).filter(F.GaussianBlur(1))
drv = flat.convert("RGB")
drv.putalpha(mask)
save("drive", alpha_crop(drv))
ex = Image.open(src / "ps5_slim_with_disc_drive_exploded.png").convert("RGBA")
# erase the end of the console's stand ring that touches the module's bottom-left corner
from PIL import ImageDraw
ImageDraw.Draw(ex).rectangle((366, 540, 381, 584), fill=(0, 0, 0, 0))
for key, box in {"console": (238, 205, 367, 584), "module": (366, 390, 438, 560), "cover": (446, 338, 528, 584)}.items():
    save(key, enhance(alpha_crop(ex.crop(box)), 3))
(ROOT / "public" / "disc" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
