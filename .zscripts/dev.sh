#!/bin/bash
cd /home/z/my-project

# Generate Prisma client
npx prisma generate 2>/dev/null

# Push database schema
npx prisma db push 2>/dev/null

# Start Next.js production server with auto-restart
while true; do
  echo "[$(date)] Starting Next.js server..."
  HOSTNAME=0.0.0.0 PORT=3000 NODE_OPTIONS='--max-old-space-size=256' npx next start -p 3000 -H 0.0.0.0 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 2s..."
  sleep 2
done
