// Price estimation engine — multi-tier, no external API calls.
//
// Tiers (in order of accuracy):
//   A. "curated"       — exact match in the hand-built MODEL_PRICES dataset (most accurate)
//   B. "trim-adjusted" — brand/model matched + premium/budget trim modifier from name
//   C. "brand-heuristic" — brand base price × vehicle type × year depreciation (fallback)
//
// estimatePrice() keeps the original signature for backward compatibility.
// estimatePriceWithSource() returns the chosen tier so callers can record priceSource.

import { MODEL_PRICES } from "./price-data";

export type PriceSource = "curated" | "trim-adjusted" | "brand-heuristic" | "unknown-brand";

export interface PriceEstimate {
  price: number;
  source: PriceSource;
}

// ───────────────────────── Tier C: brand fallback ─────────────────────────
// Average base MSRP by brand (2024-2025 USD). Used only when no curated
// model match exists. Tightened from the prior flat values.
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

  // ── European brands (not US-sold) — CNY/GBP/EUR→USD approx ──
  "RENAULT": 24000, "PEUGEOT": 25000, "OPEL": 24000, "CITROEN": 23000,
  "SKODA": 25000, "VAUXHALL": 24000, "DACIA": 15000, "CUPRA": 32000,
  "SEAT": 24000, "FIAT": 22000, "LANCIA": 26000,
  "SMART": 18000, "CITROËN": 23000, "VAUXHALL/OPEL": 24000,
  "DS": 38000, "DS AUTOMOBILES": 38000,
  "ALPINE": 48000, "MORGAN": 60000, "TVR": 65000,

  // ── Defunct/classic American brands (historical MSRPs) ──
  "PONTIAC": 26000, "SATURN": 22000, "MERCURY": 28000,
  "PLYMOUTH": 24000, "OLDSMOBILE": 29000, "HUMMER": 50000,
  "SAAB": 32000, "EAGLE": 22000, "AMC": 18000, "PACKARD": 30000,
  "STUDEBAKER": 18000, "DELOREAN": 65000, "TUCKER": 50000,

  // ── Additional Chinese brands ──
  "ROEWE": 22000, "MAXUS": 28000, "WULING": 12000, "BAOJUN": 15000,
  "DONGFENG": 20000, "DONGFENG AEOLUS": 18000, "DONGFENG FORTHING": 22000,
  "JETOUR": 20000, "NETA AUTO": 25000, "JAC": 18000, "JMEV": 20000,
  "BESTUNE": 20000, "LIVAN": 20000, "KAIYI": 22000,
  "BEIJING AUTOMOBILE WORKS (BAW)": 20000, "BAW": 20000,
  "CHANGFENG": 18000, "FOTON": 22000, "JMC": 22000,
  "GREAT WALL": 22000, "HAVAL": 22000, "FAW": 20000,
  "ZOTYE": 18000, "LIFAN": 16000, "BRILLIANCE": 20000,
  "CHANGAN NEVO": 22000, "DEEPAL AUTO": 23000,
  "VOLVO CARS": 40000,
};

// Vehicle-type multiplier for the brand fallback tier.
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

// Premium model-name indicators → +35% (applied when brand matches but model doesn't)
const PREMIUM_INDICATORS = [
  "sport", "performance", "m3", "m4", "m5", "m6", "m8",
  "amg", "s-class", "7 series", "a8", "range rover",
  "corvette", "gt-r", "rs6", "rs7", "rsq8",
  "plaid", "model s", "model x",
  "turbo s", "gts", "gt3",
];

const BUDGET_INDICATORS = [
  "base", "compact", "entry",
  "corolla", "civic", "sentra", "elantra", "forte",
  "versa", "mirage", "spark", "fit",
];

// ───────────────────────── Year depreciation ─────────────────────────
// Refined curve: gentler on near-new cars (which were too aggressively cut before).
function getYearMultiplier(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  if (age <= 0) return 1.0; // current/next model year
  if (age === 1) return 0.96; // ~1 year: minimal
  if (age === 2) return 0.90;
  if (age === 3) return 0.83;
  if (age === 4) return 0.76;
  if (age === 5) return 0.70;
  if (age <= 7) return 0.62;
  if (age <= 10) return 0.50;
  return 0.40; // 10+ years: floor at 40% of base
}

// Conservative default for genuinely unknown car brands (2024-2025 USD).
// Chosen as a mid-market passenger-car baseline; type multiplier still differentiates.
const DEFAULT_UNKNOWN_BRAND_PRICE = 26000;

// Junk indicators from NHTSA manufacturer records that aren't passenger cars.
const JUNK_BRAND_PATTERNS = [
  "TRAILER", "WELDING", "MANUFACTURING", "INDUSTRIES", "INDUSTRY",
  "LLC", "INC", "CORP", "COMPANY", "CO.", "LTD",
  "CONSTRUCTION", "OFFROAD", "OFF-ROAD", "FABRICAT", "STEEL",
  "MOTORSPORTS", // avoid matching "MOTOR" alone (valid for MG Motor etc.)
];

/**
 * Heuristic: does this look like a real passenger-vehicle brand?
 * Filters out NHTSA junk (trailers, industrial, numbered companies).
 */
function looksLikeRealCarBrand(brand: string): boolean {
  const b = brand.toUpperCase().trim();
  if (b.length < 2) return false;
  // Pure digits or starts with a digit → not a car brand (e.g. "3pluscoco", "702...")
  if (/^\d/.test(b)) return false;
  // Contains business suffixes / industrial words → junk
  for (const pat of JUNK_BRAND_PATTERNS) {
    if (b.includes(pat)) return false;
  }
  // Contains "&" or "/" typically indicates a company name, not a brand
  if (/[&/]/.test(b)) return false;
  return true;
}

// ───────────────────────── Helpers ─────────────────────────
function normalizeBrand(brand: string): string {
  return brand.toUpperCase().trim();
}

function normalizeKey(brand: string, model: string): string {
  return `${brand.toLowerCase().trim()}|${model.toLowerCase().trim()}`;
}

// Look up a curated model entry, trying exact then partial brand/model matches.
function findCuratedEntry(brand: string, model: string) {
  const brandLower = brand.toLowerCase().trim();
  const modelLower = model.toLowerCase().trim();
  const modelTrim = modelLower.trim();

  // Exact key
  if (MODEL_PRICES[`${brandLower}|${modelTrim}`]) {
    return MODEL_PRICES[`${brandLower}|${modelTrim}`];
  }

  // Partial model-name match within the same brand prefix
  // (handles variants like "Camry XSE", "Model 3 Performance", "F-150 Raptor")
  for (const [key, entry] of Object.entries(MODEL_PRICES)) {
    if (!key.startsWith(`${brandLower}|`)) continue;
    const entryModel = key.slice(brandLower.length + 1);
    if (modelTrim === entryModel) return entry;
    // entry model is a substring of the stored model (e.g. key "f-150" vs model "f-150 raptor")
    if (entryModel.length >= 3 && modelTrim.startsWith(entryModel)) return entry;
    // stored model contains the entry (e.g. model "ioniq 5 limited" vs key "ioniq 5")
    if (modelTrim.length >= 3 && entryModel.startsWith(modelTrim)) return entry;
  }

  // Brand alias fallback (e.g. "Mercedes" vs "Mercedes-Benz")
  const brandAliases: Record<string, string[]> = {
    "mercedes": ["mercedes-benz"],
    "vw": ["volkswagen"],
    "chevy": ["chevrolet"],
  };
  const aliases = brandAliases[brandLower];
  if (aliases) {
    for (const alias of aliases) {
      const aliased = MODEL_PRICES[`${alias}|${modelTrim}`];
      if (aliased) return aliased;
    }
  }

  return undefined;
}

// Check premiumTrims overrides on a curated entry; return the best matching price.
function matchPremiumTrim(modelLower: string, entry: { base: number; premiumTrims?: Record<string, number> }): number {
  if (!entry.premiumTrims) return entry.base;
  for (const [trimKey, price] of Object.entries(entry.premiumTrims)) {
    if (modelLower.includes(trimKey)) return price;
  }
  return entry.base;
}

// ───────────────────────── Public API ─────────────────────────

/**
 * Estimate price for a car model. Backward-compatible with the original signature.
 * Returns null only when the brand is entirely unknown.
 */
export function estimatePrice(
  brand: string,
  model: string,
  type: string,
  year: number
): number | null {
  const result = estimatePriceWithSource(brand, model, type, year);
  return result ? result.price : null;
}

/**
 * Estimate price and report which tier produced it. Callers can persist
 * `result.source` into a `priceSource` column for transparency.
 */
export function estimatePriceWithSource(
  brand: string,
  model: string,
  type: string,
  year: number
): PriceEstimate | null {
  const modelLower = model.toLowerCase().trim();
  const yearMultiplier = getYearMultiplier(year);
  const typeMultiplier = TYPE_MULTIPLIERS[type] || 1.0;

  // ── Tier A + B: curated dataset ──
  const curated = findCuratedEntry(brand, model);
  if (curated) {
    const base = matchPremiumTrim(modelLower, curated);
    const hadTrimOverride = curated.premiumTrims
      ? Object.keys(curated.premiumTrims).some((k) => modelLower.includes(k))
      : false;
    const source: PriceSource = hadTrimOverride ? "trim-adjusted" : "curated";
    const price = roundToHundred(base * yearMultiplier);
    return { price, source };
  }

  // ── Tier C: brand + type heuristic ──
  const brandUpper = normalizeBrand(brand);
  let basePrice = BRAND_BASE_PRICES[brandUpper];
  let usedKnownBrand = basePrice !== undefined;

  // Partial brand match (e.g. "BYD Auto" → BYD)
  if (!basePrice) {
    for (const [key, price] of Object.entries(BRAND_BASE_PRICES)) {
      if (brandUpper.includes(key) || key.includes(brandUpper)) {
        basePrice = price;
        usedKnownBrand = true;
        break;
      }
    }
  }

  // Tier D — unknown brand fallback: use a conservative mid-market default,
  // BUT only if this looks like a real passenger-vehicle brand. Junk NHTSA
  // manufacturer entries (trailers, industrial, "3pluscoco", "702 TRAILER'S",
  // "A & B INDUSTRIES") are filtered out and remain null.
  if (!basePrice) {
    if (!looksLikeRealCarBrand(brand)) return null;
    basePrice = DEFAULT_UNKNOWN_BRAND_PRICE;
    usedKnownBrand = false;
  }

  // Model-level premium/budget modifier
  let modelMultiplier = 1.0;
  for (const indicator of PREMIUM_INDICATORS) {
    if (modelLower.includes(indicator)) {
      modelMultiplier = 1.35;
      break;
    }
  }
  if (modelMultiplier === 1.0) {
    for (const indicator of BUDGET_INDICATORS) {
      if (modelLower.includes(indicator)) {
        modelMultiplier = 0.82;
        break;
      }
    }
  }

  const price = roundToHundred(basePrice * typeMultiplier * modelMultiplier * yearMultiplier);
  return { price, source: usedKnownBrand ? "brand-heuristic" : "unknown-brand" };
}

function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

// Get all brand base prices (for reference / debugging)
export function getBrandBasePrices(): Record<string, number> {
  return { ...BRAND_BASE_PRICES };
}
