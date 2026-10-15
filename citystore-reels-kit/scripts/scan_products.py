"""Copies official product images from assets/products/ to public/products/ and writes
public/data/products.json ({name: path}). Backgrounds are removed with rembg when the image
is not already transparent (pip install rembg). Names: see SOURCES.md."""
import json, pathlib, shutil
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, DST = ROOT / "assets" / "products", ROOT / "public" / "products"
DST.mkdir(parents=True, exist_ok=True)
manifest = {}
for p in sorted(SRC.glob("*")):
    if p.suffix.lower() not in (".png", ".jpg", ".jpeg", ".webp"):
        continue
    im = Image.open(p)
    out = DST / (p.stem + ".png")
    if im.mode != "RGBA" or im.getextrema()[3][0] == 255:
        try:
            from rembg import remove
            im = remove(im.convert("RGB"))
        except ImportError:
            print(f"warning: {p.name} has no transparency and rembg is not installed")
    im.save(out)
    manifest[p.stem] = f"products/{out.name}"
(ROOT / "public" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(f"{len(manifest)} product images:", ", ".join(manifest) or "(none - icon fallbacks will be used)")
