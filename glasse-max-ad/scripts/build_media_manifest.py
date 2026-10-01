#!/usr/bin/env python3
"""Scan ./assets and write src/data/media.json (which files the video uses).

Anything missing stays null and the video falls back to motion graphics.
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

    media["voiceover"] = first("vo/voiceover-clean.wav", "vo/voiceover-raw.wav")
    media["logo"] = first("logo.png", "logo.webp", "logo.svg", "logo.jpg")
    media["logoDrops"] = first("logo-drops.png")
    media["music"] = first("music/elevenlabs-bed.wav", "music.wav", "music.mp3")
    media["products"] = {
        "trioCutout": cut("trio"),
        "tealCutout": cut("teal_front"),
        "blackCutout": cut("black_front"),
        "whiteCutout": cut("white_front"),
        "tealFaucetCutout": cut("teal_faucet"),
        "backPortsCutout": None,
        "underSinkTeal": photo("teal_undersink"),
        "underSinkBlack": photo("black_undersink"),
        "underSinkWhite": photo("white_undersink"),
        "kitchenTeal": photo("teal_kitchen"),
        "kitchenBlack": photo("black_kitchen"),
        "kitchenWhite": photo("white_kitchen"),
    }
    media["generated"] = {"splashGlass": first("generated/splash_glass.png")}
    order = ["_help", "voiceover", "logo", "logoDrops", "music", "products", "generated"]
    media = {k: media.get(k) for k in order}
    MEDIA.write_text(json.dumps(media, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({k: v for k, v in media.items() if k != "_help"}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
