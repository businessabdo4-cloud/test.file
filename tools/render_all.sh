#!/usr/bin/env bash
# Render every deliverable and verify the hard limits. Run from the repo root.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/deliverables"
mkdir -p "$OUT" "$ROOT/review/scenes"
cd "$ROOT/video"

if [ "${1:-}" != "--verify-only" ]; then

render() { npx remotion render src/index.ts "$1" "$2" --codec=h264 --crf=18 --pixel-format=yuv420p --color-space=bt709 --image-format=png --audio-bitrate=256k --log=error; }
render Reel9x16 "$OUT/reel_9x16.mp4"
render Reel1x1 "$OUT/reel_1x1.mp4"
npx remotion still src/index.ts Thumbnail "$OUT/thumbnail_9x16.png" --log=error
python3 "$ROOT/tools/make_srt.py" "$OUT/reel.srt" > /dev/null

# one still per scene (9:16 and 1:1)
declare -A FRAMES=([s1_street]=87 [s2_burst]=196 [s3_unboxing]=378 [s4_showroom]=483 [s5_cta]=597 [s6_endcard]=735)
for k in "${!FRAMES[@]}"; do
  npx remotion still src/index.ts Reel9x16 "$ROOT/review/scenes/${k}_9x16.png" --frame="${FRAMES[$k]}" --log=error
  npx remotion still src/index.ts Reel1x1 "$ROOT/review/scenes/${k}_1x1.png" --frame="${FRAMES[$k]}" --log=error
done

fi

echo "== verification"
for f in "$OUT/reel_9x16.mp4" "$OUT/reel_1x1.mp4"; do
  frames=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of default=nw=1:nk=1 "$f")
  vdur=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=nw=1:nk=1 "$f")
  fdur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")
  info=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,color_space -of csv=p=0 "$f")
  loud=$(ffmpeg -hide_banner -i "$f" -af ebur128=peak=true -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}')
  tp=$(ffmpeg -hide_banner -i "$f" -af ebur128=peak=true -f null - 2>&1 | awk '/True peak/{f=1} f&&/Peak:/{print $2; exit}')
  echo "$(basename "$f"): $info | frames=$frames video=${vdur}s container=${fdur}s | ${loud} LUFS, true peak ${tp} dBFS"
  [ "$frames" -le 900 ] && echo "$info" | grep -q ",yuv420p," || { echo "FAIL: more than 900 frames or not yuv420p"; exit 1; }
  python3 -c "import sys; sys.exit(0 if float('$fdur') <= 30.0 else 1)" || { echo "FAIL: longer than 30.0 s"; exit 1; }
done
echo "OK: all renders within 900 frames / 30.0 s"
