-- MSIC Vehicle Log: add priceSource column + backfill missing priceEstimated
-- Brings the Supabase SQL schema back in sync with prisma/schema.prisma.
--
-- 1) priceEstimated was declared in Prisma but never created in the DB.
-- 2) priceSource is new — tracks which estimator produced the price value
--    ("curated" | "trim-adjusted" | "brand-heuristic" | "carapis" | "carsxe").

ALTER TABLE "CarModel" ADD COLUMN IF NOT EXISTS "priceEstimated" BOOLEAN DEFAULT false;
ALTER TABLE "CarModel" ADD COLUMN IF NOT EXISTS "priceSource" TEXT;
