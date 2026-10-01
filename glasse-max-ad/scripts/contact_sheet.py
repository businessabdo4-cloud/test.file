#!/usr/bin/env python3
"""Tile PNG stills into one review image. Usage: contact_sheet.py out.png a.png b.png ..."""
import sys
from PIL import Image, ImageDraw

out, files = sys.argv[1], sys.argv[2:]
w, h, cols = 432, 768, min(4, len(files))
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w + (cols + 1) * 12, rows * (h + 40) + 12), (30, 30, 30))
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((w, h), Image.LANCZOS)
    x, y = 12 + (i % cols) * (w + 12), 12 + (i // cols) * (h + 40)
    sheet.paste(im, (x, y))
    ImageDraw.Draw(sheet).text((x + 4, y + h + 6), f.split("/")[-1], fill=(230, 230, 230))
sheet.save(out)
