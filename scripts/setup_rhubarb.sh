#!/usr/bin/env bash
# Installs Rhubarb Lip Sync 1.13.0 (Linux) into tools/rhubarb.
# Prefers the official GitHub release; falls back to the npm mirror package when github.com is unreachable.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=tools/rhubarb
[ -x "$DEST/rhubarb" ] && { "$DEST/rhubarb" --version; exit 0; }
TMP=$(mktemp -d)
if curl -fsSL -o "$TMP/r.zip" https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip; then
  unzip -q "$TMP/r.zip" -d "$TMP" && mkdir -p tools && mv "$TMP"/Rhubarb-Lip-Sync-1.13.0-Linux "$DEST"
else
  (cd "$TMP" && npm pack rhubarb-lip-sync@0.0.1-alfa-3 --silent && tar xzf rhubarb-lip-sync-*.tgz)
  mkdir -p tools && mv "$TMP/package/.tools/rhubarb-Lip-Sync-1.13.0-Linux" "$DEST"
fi
chmod +x "$DEST/rhubarb"
"$DEST/rhubarb" --version
