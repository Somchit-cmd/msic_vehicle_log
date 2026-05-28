// Price estimation service for car models
// Provides MSRP estimates based on brand, model, type, and year
// Used to backfill price data for records where the source API doesn't provide pricing

// Average base MSRP by brand (2024-2025 USD)
const BRAND_BASE_PRICES: Record<string, number> = {
  // Japanese
  "TOYOTA": 28500, "HONDA": 27500, "NISSAN": 27000, "MAZDA": 26000,
  "SUBARU": 29000, "MITSUBISHI": 24000, "SUZUKI": 22000,
  "LEXUS": 42000, "ACURA": 38000, "INFINITI": 39000,

  // American
  "FORD": 33000, "CHEVROLET": 31000, "DODGE": 32000, "CHRYSLER": 30000,
  "CADILLAC": 45000, "LINCOLN": 46000, "BUICK": 35000, "GMC": 38000,
  "JEEP": 36000, "RAM": 35000, "TESLA": 42000,

  // German
  "BMW": 43000, "MERCEDES-BENZ": 47000, "AUDI": 42000, "PORSCHE": 62000,
  "VOLKSWAGEN": 28000, "MINI": 30000,

  // Korean
  "HYUNDAI": 26000, "KIA": 25000, "GENESIS": 42000,

  // Swedish
  "VOLVO": 40000, "POLESTAR": 48000,

  // British
  "JAGUAR": 48000, "LAND ROVER": 52000, "ASTON MARTIN": 160000,
  "BENTLEY": 200000, "ROLLS-ROYCE": 330000, "LOTUS": 80000,
  "MCLAREN": 190000,

  // Italian
  "FERRARI": 280000, "LAMBORGHINI": 220000, "MASERATI": 80000,
  "ALFA ROMEO": 42000, "FIAT": 22000,

  // Chinese
  "BYD": 30000, "NIO": 48000, "XPENG": 35000, "ZEEKR": 42000,
  "GEELY": 22000, "LI AUTO": 45000, "CHERY": 18000, "AVATR": 40000,
  "HONGQI": 35000, "GWM": 25000, "MG MOTOR": 24000, "LEAPMOTOR": 22000,
  "DENZA": 38000, "CHANGAN": 20000, "GAC": 22000, "LYNK & CO": 28000,
  "AITO": 35000, "AION": 25000, "DEEPAL": 23000, "ARCFOX": 38000,
  "VOYAH": 42000, "IM MOTORS": 32000, "HAVAAL": 28000, "ORA": 24000,
  "WEY": 30000, "TANK": 32000, "CHANGHE": 18000,

  // Others
  "LUCID": 78000, "RIVIAN": 68000, "FISKER": 38000,
  "SHELBY": 80000,
};

// Price adjustment by vehicle type (multiplier)
const TYPE_MULTIPLIERS: Record<string, number> = {
  "Sedan": 1.0,
  "SUV": 1.15,
  "Truck": 1.10,
  "Hatchback": 0.85,
  "Coupe": 1.20,
  "Convertible": 1.25,
  "Van": 1.05,
  "Wagon": 1.05,
};

// Price adjustment by year (depreciation for older years)
function getYearMultiplier(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  if (age <= 0) return 1.0;
  if (age === 1) return 0.92;
  if (age === 2) return 0.85;
  if (age === 3) return 0.78;
  if (age === 4) return 0.72;
  return 0.65;
}

// Premium model name indicators
const PREMIUM_INDICATORS = [
  "sport", "performance", "m3", "m4", "m5", "m6", "m8",
  "amg", "s-class", "7 series", "a8", "range rover",
  "corvette", "gt-r", "rs6", "rs7", "rsq8",
  "plaid", "model s", "model x",
  "turb0", "turbo s", "gts", "gt3",
];

const BUDGET_INDICATORS = [
  "base", "sport sedan", "compact", "entry",
  "corolla", "civic", "sentra", "elantra", "forte",
  "versa", "mirage", "spark", "fit",
];

// Estimate price for a car model
export function estimatePrice(
  brand: string,
  model: string,
  type: string,
  year: number
): number | null {
  const brandUpper = brand.toUpperCase();

  // Look up base price for brand
  let basePrice = BRAND_BASE_PRICES[brandUpper];

  // Try partial match if exact match not found
  if (!basePrice) {
    for (const [key, price] of Object.entries(BRAND_BASE_PRICES)) {
      if (brandUpper.includes(key) || key.includes(brandUpper)) {
        basePrice = price;
        break;
      }
    }
  }

  if (!basePrice) return null;

  // Apply type multiplier
  const typeMultiplier = TYPE_MULTIPLIERS[type] || 1.0;

  // Apply model-level adjustments
  const modelLower = model.toLowerCase();
  let modelMultiplier = 1.0;

  for (const indicator of PREMIUM_INDICATORS) {
    if (modelLower.includes(indicator)) {
      modelMultiplier = 1.35;
      break;
    }
  }

  for (const indicator of BUDGET_INDICATORS) {
    if (modelLower.includes(indicator)) {
      modelMultiplier = 0.82;
      break;
    }
  }

  // Apply year depreciation
  const yearMultiplier = getYearMultiplier(year);

  // Calculate estimated price
  const estimatedPrice = Math.round(basePrice * typeMultiplier * modelMultiplier * yearMultiplier / 100) * 100;

  return estimatedPrice;
}

// Get all brand base prices (for reference)
export function getBrandBasePrices(): Record<string, number> {
  return { ...BRAND_BASE_PRICES };
}
