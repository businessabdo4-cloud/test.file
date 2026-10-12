"""Meta Quest 3 (512GB) images -> assets/quest/products/ + public/quest/products/.

All supplied renders are transparent (cropped to alpha). They are 750-1080 px canvases with the product
~650-800 px wide, so they are enhanced x2 (Lanczos + unsharp + slight contrast) before use.
- quest3_angle.png: headset 3/4 view (hero)
- quest3_rear_lenses.png: rear view showing the lenses (4K+ display scene)
- quest3_front_controllers.png: only the two Touch Plus controllers are cut from it (the headset strap in that render is
  badly cut out / washed, so the headset part is not used)
- quest3_box_128gb_NOT_USED.png: NOT used - the retail box is printed "128 GB" while City Store sells the 512GB."""
import json, pathlib
from PIL import Image, ImageEnhance, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "quest" / "products" / "src"
dst = ROOT / "assets" / "quest" / "products"
pub = ROOT / "public" / "quest" / "products"
pub.mkdir(parents=True, exist_ok=True)
SLOTS = {"hero": "quest3_angle.png", "rear": "quest3_rear_lenses.png"}
manifest = {}
full = Image.open(src / "quest3_front_controllers.png").convert("RGBA")
W = full.width
CROPS = {"ctrlL": (0, 0, int(W * 0.3), full.height), "ctrlR": (int(W * 0.7), 0, W, full.height)}


def load(key):
    if key in CROPS:
        return full.crop(CROPS[key])
    return Image.open(src / SLOTS[key]).convert("RGBA")


for key in [*SLOTS, *CROPS]:
    im = load(key)
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
    im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    a = im.getchannel("A")
    rgb = ImageEnhance.Contrast(im.convert("RGB").filter(ImageFilter.UnsharpMask(radius=2.2, percent=80, threshold=2))).enhance(1.03)
    rgb.putalpha(a)
    rgb.save(dst / f"{key}.png")
    rgb.save(pub / f"{key}.png")
    manifest[key] = {"src": f"quest/products/{key}.png", "w": rgb.width, "h": rgb.height}
(ROOT / "public" / "quest" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
