#!/bin/sh
# Mux the Remotion render with the mastered mix -> out/final.mp4, then print verification data.
set -e
cd "$(dirname "$0")/.."
ffmpeg -v error -y -i work/video.mp4 -i work/mix.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart out/final.mp4
ffprobe -v error -show_entries stream=codec_name,profile,width,height,pix_fmt,r_frame_rate,nb_frames,duration,bit_rate,sample_rate,channels \
  -show_entries format=duration,size -of default=nw=1 out/final.mp4
ffmpeg -hide_banner -i out/final.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):"
