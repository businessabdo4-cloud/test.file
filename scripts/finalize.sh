#!/usr/bin/env bash
# Post-process Remotion renders for social upload:
#  - convert full-range (yuvj420p) to broadcast-range yuv420p, BT.709 tags, faststart
#  - re-mux the master mix (public/audio/mix.wav) as AAC trimmed to a whole number of AAC
#    frames (30 s reel: 1406 x 1024 samples = 29.995 s) so the file never reports more than its length
set -euo pipefail
cd "$(dirname "$0")/.."
REEL=${REEL:-iphone18}
if [ "$REEL" = iphone18 ]; then OUT=out; PUB=public; else OUT=out/$REEL; PUB=public/$REEL; fi
FRAMES=$(python3 -c "import json; print(json.load(open('$PUB/data/timeline.json'))['totalFrames'])")
SAMPLES=$(( FRAMES * 48000 / 30 / 1024 * 1024 ))
for name in reel_9x16 reel_1x1; do
  src="$OUT/${name}_raw.mp4"; [ -f "$src" ] || mv "$OUT/${name}.mp4" "$src"
  ffmpeg -y -v error -i "$src" -i $PUB/audio/mix.wav \
    -map 0:v:0 -map 1:a:0 \
    -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
    -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
    -af "atrim=end_sample=$SAMPLES,asetpts=N/SR/TB" -c:a aac -b:a 256k -ar 48000 \
    -frames:v $FRAMES -movflags +faststart "$OUT/${name}.mp4"
  echo "finalized $OUT/${name}.mp4"
done
