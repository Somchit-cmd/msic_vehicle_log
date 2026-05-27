#!/bin/bash
# Persistent Next.js dev server with keep-alive
cd /home/z/my-project
export PORT=3000
export HOSTNAME=0.0.0.0
export NODE_OPTIONS='--max-old-space-size=512'

# Start server in background
npx next dev --port 3000 &
SERVER_PID=$!

# Wait for server to be ready
sleep 10

# Keep-alive: ping the server every 30 seconds
while kill -0 $SERVER_PID 2>/dev/null; do
  curl -s http://localhost:3000/ > /dev/null 2>&1
  sleep 30
done

echo "Server died, restarting..."
