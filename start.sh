#!/bin/bash
# Persistent Next.js dev server with auto-restart
cd /home/z/my-project
export PORT=3000
export HOSTNAME=0.0.0.0

while true; do
  echo "[$(date)] Starting Next.js dev server..."
  npx next dev --port 3000 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
