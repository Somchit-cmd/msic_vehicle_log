-- MSIC Vehicle Log: Initial migration
-- Creates the CarModel table matching the Prisma schema

CREATE TABLE IF NOT EXISTS "CarModel" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "engine" TEXT,
  "fuelType" TEXT,
  "transmission" TEXT,
  "horsepower" INTEGER,
  "torque" INTEGER,
  "drivetrain" TEXT,
  "seatingCapacity" INTEGER,
  "price" DOUBLE PRECISION,
  "imageUrl" TEXT,
  "color" TEXT,
  "bodyStyle" TEXT,
  "mpgCity" INTEGER,
  "mpgHighway" INTEGER,
  "source" TEXT,
  "externalId" TEXT,
  "trim" TEXT,
  "region" TEXT,
  "sellerType" TEXT,
  "mileage" INTEGER,
  "isNewVehicle" BOOLEAN,
  "hasAccident" BOOLEAN,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- Indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS "CarModel_brand_idx" ON "CarModel"("brand");
CREATE INDEX IF NOT EXISTS "CarModel_model_idx" ON "CarModel"("model");
CREATE INDEX IF NOT EXISTS "CarModel_year_idx" ON "CarModel"("year");
CREATE INDEX IF NOT EXISTS "CarModel_type_idx" ON "CarModel"("type");
CREATE INDEX IF NOT EXISTS "CarModel_fuelType_idx" ON "CarModel"("fuelType");
