#!/bin/bash
# Aggressive restarter - checks every 1 second
cd /home/z/my-project

# Initial start
npx next start -p 3000 &
sleep 3

while true; do
    RESPONSE=$(curl -s --max-time 2 -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
    
    if [ "$RESPONSE" != "200" ]; then
        fuser -k 3000/tcp 2>/dev/null
        pkill -9 -f "next start" 2>/dev/null
        sleep 1
        npx next start -p 3000 &
        sleep 3
    fi
    
    sleep 1
done
