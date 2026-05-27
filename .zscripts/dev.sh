#!/bin/bash
cd /home/z/my-project

# Override the sandbox's DATABASE_URL with Supabase
export DATABASE_URL="postgresql://postgres.wtogscfvsjcvtxhwgudw:ghO0ubS7Jbae7bV1@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.wtogscfvsjcvtxhwgudw:ghO0ubS7Jbae7bV1@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Write correct .env (sandbox may overwrite it on restart)
cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://postgres.wtogscfvsjcvtxhwgudw:ghO0ubS7Jbae7bV1@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.wtogscfvsjcvtxhwgudw:ghO0ubS7Jbae7bV1@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
CARAPIS_API_KEY=car_XHjNLIgrJioH4s6hFYelw_fTMfSEeS7GDtvBEJHXJFc
SMARTCAR_CLIENT_ID=client_01KSKNJFGDHN9PVPNW50YTG8WP
SMARTCAR_CLIENT_SECRET=36334988381873ad3ebbbd25cef4a369b7a2aa5787a068f4577bd5bdcc40b5e8
SMARTCAR_REDIRECT_URI=http://localhost:3000/api/cars/smartcar/callback
SMARTCAR_MODE=test
ENVEOF

# Generate Prisma client
npx prisma generate 2>/dev/null

# Push schema to ensure it's in sync
npx prisma db push --accept-data-loss 2>/dev/null

# Start Next.js production server with auto-restart
while true; do
  echo "[$(date)] Starting Next.js server..."
  HOSTNAME=0.0.0.0 PORT=3000 NODE_OPTIONS='--max-old-space-size=256' npx next start -p 3000 -H 0.0.0.0 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 2s..."
  sleep 2
done
