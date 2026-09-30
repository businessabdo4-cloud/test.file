#!/usr/bin/env python3
"""Scan ./assets and write src/data/media.json (which files the video uses).

Anything missing stays null and the video falls back to motion graphics.
Stock clips are kept as they are (managed by scripts/fetch_stock.py --apply),
but dropped if their file no longer exists.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
A = ROOT / "assets"
MEDIA = ROOT / "src/data/media.json"


def first(*rels):
    for r in rels:
        if (A / r).exists():
            return r
    return None


def main():
    media = json.loads(MEDIA.read_text())
    made = {}
    if (A / "products/cutout/made.json").exists():
        made = json.loads((A / "products/cutout/made.json").read_text())
    roles = {}
    if (A / "products/roles.json").exists():
        roles = {v: k for k, v in json.loads((A / "products/roles.json").read_text()).items()}

    cut = lambda role: f"products/cutout/{made[role]}" if role in made else None  # noqa: E731
    photo = lambda role: f"products/png/{roles[role]}" if role in roles else None  # noqa: E731

    media["logo"] = first("logo.png", "logo.webp", "logo.svg", "logo.jpg")
    media["music"] = first("music.mp3", "music.m4a", "music.wav")
    media["products"] = {
        "blueCutout": cut("blue_front"),
        "redCutout": cut("red_front"),
        "pairCutout": cut("pair"),
        "blueVertical": first("products/vertical/blue_front_clean.png"),
        "redVertical": first("products/vertical/red_front_clean.png"),
        "blueVerticalTitle": first("products/vertical/blue_front_title.png"),
        "redVerticalTitle": first("products/vertical/red_front_title.png"),
        "blueBackCutout": cut("blue_back"),
        "redBackCutout": cut("red_back"),
        "faucetCutout": first("generated/faucet_cutout.png"),
        "filtersCloseup": first("generated/closeup_filters.png"),
        "connectorsCloseup": first("generated/closeup_connectors.png"),
        "kitchenBlue": photo("blue_kitchen"),
        "kitchenRed": photo("red_kitchen"),
        "underSinkBlue": photo("blue_undersink"),
        "underSinkRed": photo("red_undersink"),
    }
    media["stock"] = {k: (v if v and (A / v["file"]).exists() else None) for k, v in media["stock"].items()}
    MEDIA.write_text(json.dumps(media, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({k: v for k, v in media.items() if k != "_help"}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
