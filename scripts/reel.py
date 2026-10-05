"""Per-reel paths. Select a reel with the REEL env var (default: iphone18).
iphone18 keeps the original layout (public/, out/, scripts/vo_lines.json);
other reels live in reels/<id>/, assets/<id>/, public/<id>/, out/<id>/."""
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
REEL = os.environ.get("REEL", "iphone18")

if REEL == "iphone18":
    PUB = ROOT / "public"
    LINES = ROOT / "scripts" / "vo_lines.json"
    ASSETS = ROOT / "assets"
    OUT = ROOT / "out"
    PUB_PREFIX = ""
else:
    PUB = ROOT / "public" / REEL
    LINES = ROOT / "reels" / REEL / "vo_lines.json"
    ASSETS = ROOT / "assets" / REEL
    OUT = ROOT / "out" / REEL
    PUB_PREFIX = f"{REEL}/"

for d in (PUB / "audio" / "vo", PUB / "data", OUT):
    d.mkdir(parents=True, exist_ok=True)
