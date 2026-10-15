"""Tablet images -> assets/tabs/products/ + public/tabs/products/.

All four supplied images are transparent product renders (cropped to alpha).
- Xiaomi: the supplied render carries "XIAOMI Pad 8 Pro" + Mi logo painted on the SCREEN (wallpaper/marketing
  overlay, not hardware). City Store sells the Pad 8 (8GB/128GB Blue), so the screen content is softened
  (blurred inside the screen only) to remove the "Pro" text. Hardware pixels untouched.
- Lenovo: the screen carries English marketing text ("Lenovo Idea Tab Plus + Lenovo Tab Pen", "12.1\" 2.5k");
  same treatment (screen-only blur), so no English text sits on screen.
- Lenovo / Xiaomi renders are small (584 / 550 px): enhanced (Lanczos x2.5 + unsharp + slight contrast)."""
import json, pathlib
import numpy as np
from scipy.ndimage import gaussian_filter
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "tabs" / "products" / "src"
dst = ROOT / "assets" / "tabs" / "products"
pub = ROOT / "public" / "tabs" / "products"
pub.mkdir(parents=True, exist_ok=True)


def soften_screen(im, poly, radius):
    """normalized-convolution blur restricted to the screen polygon (no bezel bleed)"""
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    rgb = np.asarray(im.convert("RGB"), dtype=np.float32)
    mk = np.asarray(m, dtype=np.float32) / 255
    blur = lambda a: gaussian_filter(a.astype(np.float32), radius)
    den = blur(mk) + 1e-4
    out = np.stack([blur(rgb[..., c] * mk) / den for c in range(3)], -1)
    soft = np.asarray(m.filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32)[..., None] / 255
    res = rgb * (1 - soft) + out * soft
    a = im.getchannel("A")
    o = Image.fromarray(np.clip(res, 0, 255).astype(np.uint8))
    o.putalpha(a)
    return o


def enhance(im, k):
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    a = im.getchannel("A")
    rgb = im.convert("RGB").filter(ImageFilter.UnsharpMask(radius=2.2, percent=90, threshold=2))
    rgb = ImageEnhance.Contrast(rgb).enhance(1.04)
    rgb.putalpha(a)
    return rgb


SLOTS = {
    # key: (file, screen polygon in source px or None, blur radius, upscale)
    "a9": ("galaxy_tab_a9plus_5g.png", None, 0, 1.4),
    "a11": ("galaxy_tab_a11_gray.webp", None, 0, 0.6),
    "lenovo": ("lenovo_idea_tab_plus_pen.png", [(152, 170), (497, 190), (392, 444), (28, 371)], 22, 2.5),
    "xiaomi": ("xiaomi_pad8_blue.png", [(171, 57), (460, 57), (460, 492), (171, 492)], 24, 2.5),
}
manifest = {}
for key, (name, poly, rad, k) in SLOTS.items():
    im = Image.open(src / name).convert("RGBA")
    if poly:
        im = soften_screen(im, poly, rad)
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
    im = enhance(im, k) if k > 1 else im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(dst / f"{key}.png")
    im.save(pub / f"{key}.png")
    manifest[key] = {"src": f"tabs/products/{key}.png", "w": im.width, "h": im.height}
(ROOT / "public" / "tabs" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(json.dumps(manifest))
