#!/usr/bin/env python3
"""Search, download and prepare royalty-free stock clips from the Pixabay API.

  * Reads PIXABAY_API_KEY from .env
  * For every scene: searches the queries below, ranks candidates (resolution after a 9:16
    crop, portrait orientation, length, popularity; rejects brand/text/logo tags), downloads
    the best one, crops it to 9:16 around the most active region, trims a short segment,
    and writes assets/stock/<scene>.mp4 + a still in assets/stock/stills/.
  * Writes assets/stock/credits.txt and assets/stock/candidates.json (top picks per scene,
    so you can swap a clip: python3 scripts/fetch_stock.py --scene hook --pick 2).
  * With --apply the chosen clips are written into src/data/media.json.

Usage:
  python3 scripts/fetch_stock.py                 # all scenes, review only
  python3 scripts/fetch_stock.py --apply         # ...and use them in the video
  python3 scripts/fetch_stock.py --scene tea --pick 2 --apply
"""
import argparse
import json
import os
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
STOCK = ROOT / "assets/stock"
RAW = STOCK / "raw"
STILLS = STOCK / "stills"
MEDIA = ROOT / "src/data/media.json"

# scene key in media.json -> (queries, seconds to keep, playbackRate used in the video)
SCENES = {
    "hook": (["tap water glass", "cloudy water", "water pouring into glass"], 4, 0.6),
    "problem": (["carrying water bottles", "plastic water bottles", "shopping bottled water"], 3.5, 1),
    "splash": (["water splash", "clear water slow motion"], 2, 1),
    "features": (["water drops macro", "clean water flowing", "bubbles underwater"], 10, 0.8),
    "benefitsPure": (["water pouring into glass", "glass of water"], 2, 1),
    "benefitsTea": (["pouring tea", "mint tea"], 2, 1),
    "benefitsCoffee": (["making coffee", "coffee cup"], 2, 1),
    "benefitsFamily": (["family kitchen", "child drinking water"], 2.5, 1),
}

BANNED_TAGS = {
    "logo", "brand", "text", "title", "typography", "advertisement", "coca", "cola", "pepsi", "nestle",
    "evian", "aquafina", "dasani", "fiji", "vittel", "sidi", "ali", "cartoon", "animation", "3d", "render",
}
LICENSE = "Pixabay Content License — free for commercial use, no attribution required (https://pixabay.com/service/license-summary/)"


def env_key():
    for line in (ROOT / ".env").read_text().splitlines():
        if line.startswith("PIXABAY_API_KEY="):
            return line.split("=", 1)[1].strip()
    return os.environ["PIXABAY_API_KEY"]


def api(query, key):
    q = urllib.parse.urlencode({"key": key, "q": query, "per_page": 50, "safesearch": "true", "video_type": "film"})
    with urllib.request.urlopen(f"https://pixabay.com/api/videos/?{q}", timeout=30) as r:
        return json.load(r)["hits"]


def best_rendition(hit):
    vids = [v for v in hit["videos"].values() if v.get("url")]
    return max(vids, key=lambda v: v["width"] * v["height"])


def score(hit, query_rank):
    tags = {t.strip().lower() for t in hit["tags"].split(",")}
    words = {w for t in tags for w in t.split()}
    if tags & BANNED_TAGS or words & BANNED_TAGS:
        return -1
    v = best_rendition(hit)
    w, h = v["width"], v["height"]
    crop_w = min(w, h * 9 / 16)  # width of the 9:16 window at native res
    res = min(crop_w / 1080, 1.0)  # 1.0 = no upscaling needed
    portrait = 1.0 if h > w else 0.0
    dur = min(hit["duration"], 12) / 12
    pop = np.log1p(hit.get("downloads", 0) + 5 * hit.get("likes", 0)) / 12
    return 3 * res + 1.2 * portrait + 0.5 * dur + 0.6 * pop - 0.3 * query_rank


def download(url, out):
    if not out.exists():
        urllib.request.urlretrieve(url, out)
    return out


def probe(path):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height:format=duration", "-of", "json", str(path)], capture_output=True, text=True)
    j = json.loads(o.stdout)
    return j["streams"][0]["width"], j["streams"][0]["height"], float(j["format"]["duration"])


def focus_x(path, w, h, crop_w, t0, dur):
    """Pick the 9:16 window with the most detail + motion (subject), biased to the center."""
    if crop_w >= w - 2:
        return 0
    sw = 320
    sh = int(h * sw / w)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-t", str(dur), "-i", str(path), "-vf",
                          f"fps=3,scale={sw}:{sh},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, sh, sw).astype(np.float32)
    grad = np.abs(np.diff(frames, axis=2)).mean(0).sum(0)
    motion = np.abs(np.diff(frames, axis=0)).mean(0).sum(0) if len(frames) > 1 else 0
    energy = np.pad(grad, (0, 1)) + 2 * np.pad(motion if np.ndim(motion) else np.zeros(sw), (0, 0))
    win = int(crop_w * sw / w)
    csum = np.convolve(energy, np.ones(win), "valid")
    center = (sw - win) / 2
    bias = 1 - 0.35 * np.abs(np.arange(len(csum)) - center) / max(center, 1)
    x = int(np.argmax(csum * bias) * w / sw)
    return max(0, min(x, w - int(crop_w)))


def prepare(src, out, seconds):
    w, h, d = probe(src)
    t0 = min(max(0.4, d * 0.1), max(0, d - seconds))
    dur = min(seconds, d - t0)
    crop_w = int(min(w, h * 9 / 16)) // 2 * 2
    crop_h = int(min(h, crop_w * 16 / 9)) // 2 * 2
    x = focus_x(src, w, h, crop_w, t0, dur)
    y = (h - crop_h) // 2
    vf = f"crop={crop_w}:{crop_h}:{x}:{y},scale=1080:1920:flags=lanczos,fps=30,setsar=1"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t0), "-t", str(dur), "-i", str(src), "-vf", vf, "-an",
                    "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", str(out)], check=True)
    STILLS.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(min(1, dur / 2)), "-i", str(out), "-frames:v", "1",
                    "-q:v", "3", str(STILLS / (out.stem + ".jpg"))], check=True)
    return {"sourceRes": f"{w}x{h}", "crop": f"{crop_w}x{crop_h}+{x}+{y}", "trimmedFrom": round(t0, 2), "seconds": round(dur, 2)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", help="only this scene key")
    ap.add_argument("--pick", type=int, default=1, help="use the Nth ranked candidate (1 = best)")
    ap.add_argument("--apply", action="store_true", help="write chosen clips into src/data/media.json")
    args = ap.parse_args()

    key = env_key()
    RAW.mkdir(parents=True, exist_ok=True)
    cand_path = STOCK / "candidates.json"
    candidates = json.loads(cand_path.read_text()) if cand_path.exists() else {}
    chosen_path = STOCK / "chosen.json"
    chosen = json.loads(chosen_path.read_text()) if chosen_path.exists() else {}

    for scene, (queries, seconds, rate) in SCENES.items():
        if args.scene and scene != args.scene:
            continue
        seen, ranked = set(), []
        for qi, q in enumerate(queries):
            for hit in api(q, key):
                if hit["id"] in seen:
                    continue
                seen.add(hit["id"])
                s = score(hit, qi)
                if s > 0:
                    v = best_rendition(hit)
                    ranked.append({"score": round(float(s), 3), "id": hit["id"], "query": q, "pageURL": hit["pageURL"],
                                   "user": hit["user"], "tags": hit["tags"], "duration": hit["duration"],
                                   "url": v["url"], "res": f"{v['width']}x{v['height']}", "thumbnail": v.get("thumbnail")})
        ranked.sort(key=lambda r: -r["score"])
        candidates[scene] = ranked[:6]
        if not ranked:
            print(f"[{scene}] no usable clip — the motion-graphics fallback will be used")
            chosen.pop(scene, None)
            continue
        pick = ranked[min(args.pick, len(ranked)) - 1]
        src = download(pick["url"], RAW / f"{scene}_{pick['id']}.mp4")
        info = prepare(src, STOCK / f"{scene}.mp4", seconds)
        chosen[scene] = {**pick, **info, "file": f"stock/{scene}.mp4", "playbackRate": rate}
        print(f"[{scene}] #{args.pick} {pick['pageURL']} by {pick['user']} ({pick['res']}) -> {info}")

    cand_path.write_text(json.dumps(candidates, indent=2))
    chosen_path.write_text(json.dumps(chosen, indent=2))
    lines = ["Stock footage used in the GLASSE POWER ad", f"License: {LICENSE}", ""]
    for scene, c in chosen.items():
        lines += [f"[{scene}] assets/{c['file']}", f"  Source: {c['pageURL']}", f"  Author: {c['user']} (Pixabay)",
                  f"  Pixabay video id: {c['id']}  original: {c['res']}  used: {c['seconds']}s from {c['trimmedFrom']}s, crop {c['crop']}",
                  f"  License: {LICENSE}", ""]
    (STOCK / "credits.txt").write_text("\n".join(lines))
    print("wrote", STOCK / "credits.txt")

    if args.apply:
        media = json.loads(MEDIA.read_text())
        for scene, c in chosen.items():
            media["stock"][scene] = {"file": c["file"], "playbackRate": c["playbackRate"]}
        MEDIA.write_text(json.dumps(media, indent=2, ensure_ascii=False) + "\n")
        print("updated", MEDIA)


if __name__ == "__main__":
    main()
