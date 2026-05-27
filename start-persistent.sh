#!/bin/bash
# Persistent server starter with built-in keep-alive
cd /home/z/my-project

# Kill any existing processes
pkill -f "next start" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# Start the server
npx next start -p 3000 &
SERVER_PID=$!
echo "Started server with PID: $SERVER_PID"

# Wait for it to be ready
sleep 3

# Keep-alive loop - ping the server and restart if needed
while true; do
    sleep 5
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "[$(date)] Server process died, restarting..."
        npx next start -p 3000 &
        SERVER_PID=$!
        sleep 3
    fi
    
    # Ping to prevent idle
    curl -s -o /dev/null http://localhost:3000/ 2>/dev/null
done
