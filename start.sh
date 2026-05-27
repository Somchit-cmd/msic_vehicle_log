#!/bin/bash
cd /home/z/my-project
while true; do
  npx next start -p 3000 -H 0.0.0.0 2>&1 | tee -a /tmp/next-prod.log
  echo "[$(date)] Server crashed, restarting in 3s..." >> /tmp/next-prod.log
  sleep 3
done
