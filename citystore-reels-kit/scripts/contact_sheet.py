"""Tile preview stills into one labelled contact sheet: python3 scripts/contact_sheet.py out/preview/Reel9x16_*.png out.png"""
import sys
from PIL import Image, ImageDraw
files, out = sys.argv[1:-1], sys.argv[-1]
ims = [Image.open(f).convert("RGB") for f in files]
w, h = ims[0].size
cols = min(6, len(ims))
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + 8), rows * (h + 30)), "white")
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * (w + 8), (i // cols) * (h + 30)
    sheet.paste(im, (x, y + 26))
    fr = int(f.rsplit("_", 1)[1].split(".")[0])
    d.text((x + 4, y + 6), f"frame {fr}  ({fr/30:.2f}s)", fill="black")
sheet.save(out)
print(out, sheet.size)
