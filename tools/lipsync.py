"""Rhubarb Lip Sync (phonetic recognizer — the dialogue is Darija) on each clean line file.
Writes assets/vo/lipsync.json: {line_id: [{"start": s, "end": e, "value": "A".."H"|"X"}]} in composition seconds."""
import json, subprocess, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VO = ROOT / "assets" / "vo"
RHUBARB = Path("/home/user/models/Rhubarb-Lip-Sync-1.14.0-Linux/rhubarb")

timings = json.load(open(VO / "timings.json"))
out = {}
with tempfile.TemporaryDirectory() as tmp:
    for ln in timings["lines"]:
        src = VO / "lines" / f'{ln["id"]}.wav'
        wav16 = Path(tmp) / f'{ln["id"]}.wav'
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(wav16)], check=True)
        res = subprocess.run([str(RHUBARB), "-r", "phonetic", "-f", "json", "--extendedShapes", "GHX", "-q", str(wav16)],
                             capture_output=True, text=True, check=True)
        cues = json.loads(res.stdout)["mouthCues"]
        off = ln["fileStart"]
        out[ln["id"]] = [{"start": round(c["start"] + off, 3), "end": round(c["end"] + off, 3), "value": c["value"]} for c in cues]
        shapes = "".join(c["value"] for c in cues)
        print(f'{ln["id"]}: {len(cues):3d} cues  {shapes}')
json.dump(out, open(VO / "lipsync.json", "w"), indent=1)
