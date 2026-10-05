#!/usr/bin/env bash
# Verifies the rendered reels: <= 900 frames / 30.0 s, resolution, H.264, 30 fps, AAC audio.
set -uo pipefail
cd "$(dirname "$0")/.."
fail=0
check() {
  local f=$1 w=$2 h=$3
  [ -f "$f" ] || { echo "MISSING $f"; fail=1; return; }
  local v; v=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,nb_read_frames,pix_fmt -of default=nw=1 "$f")
  local codec vw vh fps pix frames
  codec=$(grep '^codec_name=' <<<"$v" | cut -d= -f2); vw=$(grep '^width=' <<<"$v" | cut -d= -f2)
  vh=$(grep '^height=' <<<"$v" | cut -d= -f2); fps=$(grep '^r_frame_rate=' <<<"$v" | cut -d= -f2)
  pix=$(grep '^pix_fmt=' <<<"$v" | cut -d= -f2); frames=$(grep '^nb_read_frames=' <<<"$v" | cut -d= -f2)
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  local a; a=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 "$f")
  local ok=OK
  [ "$codec" = h264 ] || ok=FAIL
  [ "$vw" = "$w" ] && [ "$vh" = "$h" ] || ok=FAIL
  [ "$fps" = "30/1" ] || ok=FAIL
  [ "$pix" = "yuv420p" ] || ok=FAIL
  [ "$frames" -le 900 ] || ok=FAIL
  awk "BEGIN{exit !($dur <= 30.0)}" || ok=FAIL
  echo "$ok  $f  ${vw}x${vh} $codec $pix ${fps}fps frames=$frames duration=${dur}s audio=[$a]"
  [ $ok = OK ] || fail=1
}
REEL=${REEL:-iphone18}
if [ "$REEL" = iphone18 ]; then OUT=out; else OUT=out/$REEL; fi
check $OUT/reel_9x16.mp4 1080 1920
check $OUT/reel_1x1.mp4 1080 1080
exit $fail
