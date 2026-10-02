"""Turn official product images into transparent cut-outs and register them for the ad.

Put the downloaded OFFICIAL images (Apple Newsroom / apple.com only) in assets/products/raw/ named
    <model>_<color>_<side>.<png|jpg|webp>
    model: iphone-18-pro-max | iphone-18-pro      color: black | silver | glacier | burgundy      side: front | back
then run:  python3 tools/prepare_products.py
Images that already have transparency are kept as-is; others go through rembg. Output: assets/products/<name>.png
(trimmed, max 1600 px tall) and assets/products/manifest.json, which the Remotion project reads — placeholders
disappear automatically and the PREVIEW badge goes away once all 16 images are present."""
import json, re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW, OUT = ROOT / "assets" / "products" / "raw", ROOT / "assets" / "products"
NAME = re.compile(r"^(iphone-18-pro-max|iphone-18-pro)_(black|silver|glacier|burgundy)_(front|back)$")

files = sorted(p for p in RAW.glob("*") if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}) if RAW.exists() else []
if not files:
    sys.exit(f"No images in {RAW} — see the docstring for naming.")
session = None
manifest = json.loads((OUT / "manifest.json").read_text()) if (OUT / "manifest.json").exists() else {}
for p in files:
    m = NAME.match(p.stem)
    if not m:
        print(f"skip {p.name}: name must be <model>_<color>_<side>")
        continue
    model, color, side = m.groups()
    im = Image.open(p).convert("RGBA")
    if im.getextrema()[3][0] == 255:  # fully opaque → remove the background
        from rembg import new_session, remove
        session = session or new_session("isnet-general-use")
        im = remove(im, session=session)
    bbox = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    im = im.crop(bbox)
    if im.height > 1600:
        im = im.resize((round(im.width * 1600 / im.height), 1600), Image.LANCZOS)
    dest = OUT / f"{p.stem}.png"
    im.save(dest)
    manifest.setdefault(model, {}).setdefault(color, {})[side] = f"products/{dest.name}"
    print(f"ok   {p.name} → {dest.relative_to(ROOT)} ({im.width}×{im.height})")
(OUT / "manifest.json").write_text(json.dumps(manifest, indent=1))
missing = [f"{mo}_{c}_{s}" for mo in ("iphone-18-pro-max", "iphone-18-pro") for c in ("black", "silver", "glacier", "burgundy") for s in ("front", "back") if not manifest.get(mo, {}).get(c, {}).get(s)]
print("all 16 product images present" if not missing else f"still missing {len(missing)}: {', '.join(missing)}")
