#!/bin/bash
while true; do
  if ! ss -tlnp | grep -q ':3000 '; then
    echo "[$(date)] Restarting..." >> /tmp/keep-alive.log
    cd /home/z/my-project && npx next dev -p 3000 -H 0.0.0.0 >> /tmp/next-dev.log 2>&1 &
    sleep 8
  fi
  curl -s --max-time 5 http://127.0.0.1:3000/ > /dev/null 2>&1
  sleep 10
done
