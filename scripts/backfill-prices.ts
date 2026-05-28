// Standalone price backfill script
// Run with: npx tsx scripts/backfill-prices.ts

const BRAND_BASE_PRICES: Record<string, number> = {
  "TOYOTA": 28500, "HONDA": 27500, "NISSAN": 27000, "MAZDA": 26000,
  "SUBARU": 29000, "MITSUBISHI": 24000, "SUZUKI": 22000,
  "LEXUS": 42000, "ACURA": 38000, "INFINITI": 39000,
  "FORD": 33000, "CHEVROLET": 31000, "DODGE": 32000, "CHRYSLER": 30000,
  "CADILLAC": 45000, "LINCOLN": 46000, "BUICK": 35000, "GMC": 38000,
  "JEEP": 36000, "RAM": 35000, "TESLA": 42000,
  "BMW": 43000, "MERCEDES-BENZ": 47000, "AUDI": 42000, "PORSCHE": 62000,
  "VOLKSWAGEN": 28000, "MINI": 30000,
  "HYUNDAI": 26000, "KIA": 25000, "GENESIS": 42000,
  "VOLVO": 40000, "POLESTAR": 48000,
  "JAGUAR": 48000, "LAND ROVER": 52000, "ASTON MARTIN": 160000,
  "BENTLEY": 200000, "ROLLS-ROYCE": 330000, "LOTUS": 80000, "MCLAREN": 190000,
  "FERRARI": 280000, "LAMBORGHINI": 220000, "MASERATI": 80000,
  "ALFA ROMEO": 42000, "FIAT": 22000,
  "BYD": 30000, "NIO": 48000, "XPENG": 35000, "ZEEKR": 42000,
  "GEELY": 22000, "LI AUTO": 45000, "CHERY": 18000, "AVATR": 40000,
  "HONGQI": 35000, "GWM": 25000, "MG MOTOR": 24000, "LEAPMOTOR": 22000,
  "DENZA": 38000, "CHANGAN": 20000, "GAC": 22000, "LYNK & CO": 28000,
  "AITO": 35000, "AION": 25000, "DEEPAL": 23000, "ARCFOX": 38000,
  "VOYAH": 42000, "IM MOTORS": 32000, "HAVAAL": 28000, "ORA": 24000,
  "WEY": 30000, "TANK": 32000, "CHANGHE": 18000,
  "LUCID": 78000, "RIVIAN": 68000, "FISKER": 38000, "SHELBY": 80000,
};

const TYPE_MULTIPLIERS: Record<string, number> = {
  "Sedan": 1.0, "SUV": 1.15, "Truck": 1.10, "Hatchback": 0.85,
  "Coupe": 1.20, "Convertible": 1.25, "Van": 1.05, "Wagon": 1.05,
};

function getYearMultiplier(year: number): number {
  const age = new Date().getFullYear() - year;
  if (age <= 0) return 1.0;
  if (age === 1) return 0.92;
  if (age === 2) return 0.85;
  if (age === 3) return 0.78;
  if (age === 4) return 0.72;
  return 0.65;
}

const PREMIUM_INDICATORS = [
  "sport", "performance", "m3", "m4", "m5", "m6", "m8",
  "amg", "s-class", "7 series", "a8", "range rover",
  "corvette", "gt-r", "rs6", "rs7", "rsq8",
  "plaid", "model s", "model x", "turbo", "gts", "gt3",
];

const BUDGET_INDICATORS = [
  "base", "compact", "entry", "corolla", "civic", "sentra",
  "elantra", "forte", "versa", "mirage", "spark", "fit",
];

function estimatePrice(brand: string, model: string, type: string, year: number): number | null {
  const brandUpper = brand.toUpperCase();
  let basePrice = BRAND_BASE_PRICES[brandUpper];
  if (!basePrice) {
    for (const [key, price] of Object.entries(BRAND_BASE_PRICES)) {
      if (brandUpper.includes(key) || key.includes(brandUpper)) {
        basePrice = price;
        break;
      }
    }
  }
  if (!basePrice) return null;

  const typeMultiplier = TYPE_MULTIPLIERS[type] || 1.0;
  const modelLower = model.toLowerCase();
  let modelMultiplier = 1.0;

  for (const indicator of PREMIUM_INDICATORS) {
    if (modelLower.includes(indicator)) { modelMultiplier = 1.35; break; }
  }
  for (const indicator of BUDGET_INDICATORS) {
    if (modelLower.includes(indicator)) { modelMultiplier = 0.82; break; }
  }

  const yearMultiplier = getYearMultiplier(year);
  return Math.round(basePrice * typeMultiplier * modelMultiplier * yearMultiplier / 100) * 100;
}

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const db = new PrismaClient();

  try {
    const total = await db.carModel.count();
    const withPrice = await db.carModel.count({ where: { price: { not: null } } });
    console.log(`Current: ${withPrice}/${total} cars have price (${Math.round(withPrice/total*100)}%)`);

    const carsWithoutPrice = await db.carModel.findMany({
      where: { price: null },
      select: { id: true, brand: true, model: true, type: true, year: true },
    });

    console.log(`Backfilling prices for ${carsWithoutPrice.length} cars...`);

    let updated = 0;
    let noEstimate = 0;
    let batch = 0;

    for (const car of carsWithoutPrice) {
      const estimatedPrice = estimatePrice(car.brand, car.model, car.type, car.year);
      if (estimatedPrice) {
        await db.carModel.update({
          where: { id: car.id },
          data: { price: estimatedPrice, priceEstimated: true },
        });
        updated++;
      } else {
        noEstimate++;
      }

      batch++;
      if (batch % 500 === 0) {
        console.log(`  Processed ${batch}/${carsWithoutPrice.length}...`);
      }
    }

    const newWithPrice = await db.carModel.count({ where: { price: { not: null } } });
    console.log(`\nDone! Updated: ${updated}, No estimate: ${noEstimate}`);
    console.log(`Final: ${newWithPrice}/${total} cars have price (${Math.round(newWithPrice/total*100)}%)`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
