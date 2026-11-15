"""iPhone Duo images (supplied by the user; apple.com was unreachable from this session).
- iphone_duo_star_white_folded_unfolded.webp: transparent official-style render, folded (back) + unfolded (front).
  The two phones overlap, so it is used whole (cropped to alpha) as the hero shot (box reveal + cover).
- iphone_duo_unfolded_homescreen.webp: NOT used: its screen shows English UI text and a stock photo of a person;
  the unfold animation uses a drawn device frame whose screen shows the stylised match instead."""
import json, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = ROOT / "assets" / "duo" / "products" / "src"
dst = ROOT / "assets" / "duo" / "products"
pub = ROOT / "public" / "duo" / "products"
pub.mkdir(parents=True, exist_ok=True)
im = Image.open(src / "iphone_duo_star_white_folded_unfolded.webp").convert("RGBA")
im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
im.save(dst / "duo.png")
im.save(pub / "duo.png")
manifest = {"duo": {"src": "duo/products/duo.png", "w": im.width, "h": im.height}}
(ROOT / "public" / "duo" / "data" / "products.json").write_text(json.dumps(manifest, indent=1) + "\n")
print(manifest)
