#!/bin/bash
# Keep-alive script that restarts the Next.js server if it dies
cd /home/z/my-project

while true; do
    # Check if server is responding
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
        echo "[$(date)] Server not responding, restarting..."
        # Kill any existing processes
        pkill -f "next" 2>/dev/null
        sleep 1
        # Start fresh
        npx next start -p 3000 >> /home/z/my-project/server.log 2>&1 &
        sleep 5
        # Verify it started
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
            echo "[$(date)] Server started successfully"
        else
            echo "[$(date)] Server failed to start, retrying..."
        fi
    else
        echo "[$(date)] Server is healthy"
    fi
    sleep 10
done
