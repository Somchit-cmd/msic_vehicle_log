// CarNewsChina Data Service
// Scrapes Chinese EV data from data.carnewschina.com
// Free, no API key required - uses their internal JSON API endpoints
// Source: https://data.carnewschina.com/database/

import { db } from "@/lib/db";

const CNC_BASE = "https://data.carnewschina.com";

// CarNewsChina API response types
interface CNCModelResponse {
  status: boolean;
  models: CNCModel[];
  models_count_remain: number;
}

interface CNCModel {
  brand_name: string;
  brand_slug: string;
  brand_image: string;
  name: string;
  alt_name: string | null;
  model_slug: string;
  slug: string;
  image: string;
}

// Parsed spec data from model detail page
interface CNCModelSpecs {
  bodyType: string | null;
  fuelType: string | null;
  batteryCapacity: string | null;
  batteryType: string | null;
  drive: string | null;
  topSpeed: string | null;
  acceleration: string | null;
  torque: string | null;
  seats: number | null;
  dimensions: string | null;
  wheelbase: string | null;
  priceRange: string | null;
  consumption: string | null;
  dcCharging: string | null;
  releaseDate: string | null;
  chineseName: string | null;
}

// Map body type from CarNewsChina to our type system
function mapBodyType(bodyType: string | null, modelName: string): string {
  const name = modelName.toLowerCase();
  const bt = (bodyType || "").toLowerCase();

  if (bt.includes("sedan") || bt.includes("limousine")) return "Sedan";
  if (bt.includes("suv") || bt.includes("crossover")) return "SUV";
  if (bt.includes("hatchback") || bt.includes("compact")) return "Hatchback";
  if (bt.includes("coupe")) return "Coupe";
  if (bt.includes("convertible") || bt.includes("cabriolet")) return "Convertible";
  if (bt.includes("van") || bt.includes("minivan") || bt.includes("mpv")) return "Van";
  if (bt.includes("wagon") || bt.includes("estate") || bt.includes("shooting brake")) return "Wagon";
  if (bt.includes("pickup") || bt.includes("truck")) return "Truck";

  // Fallback: infer from model name (Chinese car naming patterns)
  // SUV patterns
  if (/suv|cross|tang|song|yuan plus|atto|sealion|seal 07|e5|es8|es7|es6|ec7|ec6|g6|g9|x9|u8|n7|009|x|7x|mix|rx|vx|hs|zs|tiggo|h6|h9|tank|poer|wuling|omoda|jaecoo/i.test(name)) return "SUV";
  // MPV/Van patterns
  if (/d9|dreamer|m8|hq9|v class|v-class|spacious|oden|e-mpv|v9|youya|x9/i.test(name)) return "Van";
  // Hatchback patterns
  if (/dolphin|seagull|t03|mg4|hatchback/i.test(name)) return "Hatchback";
  // Coupe patterns
  if (/coupe|gt\b|roadster/i.test(name)) return "Coupe";
  // Wagon patterns
  if (/wagon|touring|avant|et5t/i.test(name)) return "Wagon";
  // Pickup patterns
  if (/pickup|poer|pao|radar/i.test(name)) return "Truck";

  return "Sedan";
}

// Map fuel type from CarNewsChina
function mapFuelType(fuelType: string | null, modelName: string): string {
  const ft = (fuelType || "").toUpperCase();
  const name = modelName.toLowerCase();

  if (ft === "BEV" || ft.includes("BATTERY") || ft.includes("ELECTRIC")) return "Electric";
  if (ft === "PHEV" || ft === "REEV" || ft.includes("PLUG-IN") || ft.includes("EXTENDED RANGE")) return "Hybrid";
  if (ft === "HEV" || ft.includes("HYBRID")) return "Hybrid";
  if (ft.includes("DIESEL")) return "Diesel";
  if (ft.includes("GASOLINE") || ft.includes("PETROL") || ft.includes("ICE")) return "Gasoline";

  // Infer from model name
  if (name.includes("ev") || name.includes("electric") || name.includes("bev")) return "Electric";
  if (name.includes("dm") || name.includes("phev") || name.includes("dm-i") || name.includes("dm-p") || name.includes("em-p") || name.includes("reev") || name.includes("e-p")) return "Hybrid";
  if (name.includes("hybrid") || name.includes("hev")) return "Hybrid";

  return "Electric"; // CarNewsChina is primarily EV-focused
}

// Map drive type from CarNewsChina
function mapDrivetrain(drive: string | null): string | null {
  if (!drive) return null;
  const d = drive.toUpperCase();
  if (d.includes("AWD") || d.includes("4WD") || d.includes("ALL-WHEEL") || d.includes("FOUR-WHEEL")) return "AWD";
  if (d.includes("RWD") || d.includes("REAR")) return "RWD";
  if (d.includes("FWD") || d.includes("FRONT")) return "FWD";
  return d;
}

// Parse price string to USD number (CarNewsChina shows prices in USD with conversion)
function parsePrice(priceRange: string | null): number | null {
  if (!priceRange) return null;
  // Try to extract numbers from price string like "USD 24,400 - 34,110"
  const matches = priceRange.match(/[\d,]+/g);
  if (matches && matches.length > 0) {
    // Take the lowest price
    const prices = matches.map(m => parseInt(m.replace(/,/g, ""), 10)).filter(n => !isNaN(n) && n > 1000);
    if (prices.length > 0) return Math.min(...prices);
  }
  return null;
}

// Parse torque string to number (Nm)
function parseTorque(torqueStr: string | null): number | null {
  if (!torqueStr) return null;
  const match = torqueStr.match(/(\d[\d,]*)\s*Nm/i);
  if (match) return parseInt(match[1].replace(/,/g, ""), 10);
  return null;
}

// Parse acceleration string (e.g., "3.8 sec")
function parseAcceleration(accelStr: string | null): string | null {
  if (!accelStr) return null;
  return accelStr.trim();
}

// Parse top speed (e.g., "240 km/h")
function parseTopSpeed(speedStr: string | null): string | null {
  if (!speedStr) return null;
  return speedStr.trim();
}

// Parse seats number
function parseSeats(seatsStr: string | null): number | null {
  if (!seatsStr) return null;
  const match = seatsStr.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  return null;
}

// Parse consumption (e.g., "14.9 kWh/100km")
function parseConsumption(consumptionStr: string | null): string | null {
  if (!consumptionStr) return null;
  return consumptionStr.trim();
}

// Fetch model list page from CarNewsChina API
async function fetchModelPage(page: number): Promise<CNCModelResponse | null> {
  try {
    const url = `${CNC_BASE}/load-models/all/${page}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AutoCatalog/1.0 (Car Database Project)",
        "Accept": "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.error(`[CNC] Failed to fetch page ${page}: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`[CNC] Error fetching page ${page}:`, err);
    return null;
  }
}

// Fetch models for a specific brand from CarNewsChina
async function fetchBrandModels(brandSlug: string, page: number = 1): Promise<CNCModelResponse | null> {
  try {
    const url = `${CNC_BASE}/load-models/${brandSlug}/${page}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AutoCatalog/1.0 (Car Database Project)",
        "Accept": "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Scrape specs from a model detail page
async function fetchModelSpecs(brandSlug: string, modelSlug: string): Promise<CNCModelSpecs | null> {
  try {
    const url = `${CNC_BASE}/database/${brandSlug}/${modelSlug}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AutoCatalog/1.0 (Car Database Project)",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Parse the "Top Overview" section for specs
    const specs: CNCModelSpecs = {
      bodyType: null,
      fuelType: null,
      batteryCapacity: null,
      batteryType: null,
      drive: null,
      topSpeed: null,
      acceleration: null,
      torque: null,
      seats: null,
      dimensions: null,
      wheelbase: null,
      priceRange: null,
      consumption: null,
      dcCharging: null,
      releaseDate: null,
      chineseName: null,
    };

    // Extract price (appears before overview section)
    const priceMatch = html.match(/USD\s+([\d,]+)\s*-\s*([\d,]+)/);
    if (priceMatch) {
      specs.priceRange = `USD ${priceMatch[1]} - ${priceMatch[2]}`;
    } else {
      const singlePriceMatch = html.match(/USD\s+([\d,]+)/);
      if (singlePriceMatch) {
        specs.priceRange = `USD ${singlePriceMatch[1]}`;
      }
    }

    // Extract released date
    const releaseMatch = html.match(/Released:\s*([^<]+)/i);
    if (releaseMatch) specs.releaseDate = releaseMatch[1].trim();

    // Extract from Top Overview section
    const overviewMatch = html.match(/Top Overview([\s\S]*?)All Specifications/);
    if (overviewMatch) {
      const overviewHtml = overviewMatch.group(1);

      // Clean up HTML to text
      const cleanText = (html: string) => html
        .replace(/<[^>]+>/g, ' | ')
        .replace(/\s+/g, ' ')
        .trim();

      const text = cleanText(overviewHtml);

      // Parse individual specs from the text
      const parseSpec = (label: string, text: string): string | null => {
        const regex = new RegExp(`${label}[^|]*\\|\\s*([^|]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : null;
      };

      specs.batteryCapacity = parseSpec('Battery capacity', text);
      specs.batteryType = parseSpec('Battery type', text);
      specs.drive = parseSpec('Drive', text);
      specs.topSpeed = parseSpec('Top speed', text);
      specs.acceleration = parseSpec('Acceleration 0-100', text) || parseSpec('0-100', text);
      specs.torque = parseSpec('Total torque', text) || parseSpec('Torque', text);
      specs.seats = parseSeats(parseSpec('Number of seats', text) || parseSpec('seats', text));
      specs.dimensions = parseSpec('L/W/H', text);
      specs.wheelbase = parseSpec('Wheelbase', text);
      specs.consumption = parseSpec('Consumption', text);
      specs.dcCharging = parseSpec('DC charging', text);
      specs.bodyType = parseSpec('Body type', text);
      specs.fuelType = parseSpec('Fuel type', text);
      specs.chineseName = parseSpec('Chinese name', text);
    }

    return specs;
  } catch (err) {
    console.error(`[CNC] Error fetching specs for ${brandSlug}/${modelSlug}:`, err);
    return null;
  }
}

// Get current year for default year assignment
function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Main function: Fetch all Chinese car data from CarNewsChina
export async function fetchAndStoreCarNewsChinaData(
  options: {
    maxPages?: number;      // Max pages to fetch (default: 35 = ~840 models)
    fetchSpecs?: boolean;   // Whether to fetch detailed specs (slower)
    specBatchSize?: number; // How many models to fetch specs for per batch
  } = {}
): Promise<{
  totalFetched: number;
  totalAdded: number;
  totalUpdated: number;
  totalSkipped: number;
  brands: string[];
  errors: string[];
}> {
  const { maxPages = 35, fetchSpecs = true, specBatchSize = 50 } = options;

  const errors: string[] = [];
  let totalFetched = 0;
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  const brandsSet = new Set<string>();

  console.log(`[CNC] Starting CarNewsChina data fetch (max ${maxPages} pages)`);

  // Collect all models first
  const allModels: CNCModel[] = [];
  let hasMore = true;

  for (let page = 1; page <= maxPages && hasMore; page++) {
    try {
      const data = await fetchModelPage(page);

      if (!data || !data.models || data.models.length === 0) {
        hasMore = false;
        break;
      }

      allModels.push(...data.models);
      console.log(`[CNC] Page ${page}: fetched ${data.models.length} models, ${data.models_count_remain} remaining`);

      if (data.models_count_remain <= 0) {
        hasMore = false;
      }

      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      errors.push(`Failed to fetch page ${page}: ${err}`);
      hasMore = false;
    }
  }

  console.log(`[CNC] Collected ${allModels.length} models total`);

  // Group models by brand for spec fetching
  const modelsByBrand = new Map<string, CNCModel[]>();
  for (const model of allModels) {
    if (!modelsByBrand.has(model.brand_slug)) {
      modelsByBrand.set(model.brand_slug, []);
    }
    modelsByBrand.get(model.brand_slug)!.push(model);
  }

  // Optionally fetch specs for a batch of models
  const specMap = new Map<string, CNCModelSpecs>();

  if (fetchSpecs) {
    console.log(`[CNC] Fetching specs for up to ${specBatchSize} models...`);
    let specCount = 0;

    // Prioritize major Chinese brands for spec fetching
    const priorityBrands = ["byd", "nio", "xpeng", "zeekr", "geely", "li-auto", "chery", "avatr", "hongqi", "gwm", "mg-motor", "leapmotor", "denza", "changan", "gac", "lynk-co", "arcfox", "aito", "aion", "deepal"];

    // Sort models to prioritize major brands
    const sortedModels = [...allModels].sort((a, b) => {
      const aPriority = priorityBrands.includes(a.brand_slug) ? 0 : 1;
      const bPriority = priorityBrands.includes(b.brand_slug) ? 0 : 1;
      return aPriority - bPriority;
    });

    for (const model of sortedModels) {
      if (specCount >= specBatchSize) break;

      try {
        const specs = await fetchModelSpecs(model.brand_slug, model.model_slug);
        if (specs) {
          specMap.set(model.slug, specs);
          specCount++;
        }

        // Small delay between spec fetches
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch {
        // Skip failed spec fetches
      }
    }

    console.log(`[CNC] Fetched specs for ${specCount} models`);
  }

  // Store all models in the database
  const currentYear = getCurrentYear();

  for (const model of allModels) {
    totalFetched++;
    brandsSet.add(model.brand_name);

    const specs = specMap.get(model.slug);

    // Clean model name - remove brand prefix if present
    let cleanModelName = model.name;
    const brandPrefix = model.brand_name + " ";
    if (cleanModelName.toUpperCase().startsWith(brandPrefix.toUpperCase())) {
      cleanModelName = cleanModelName.substring(brandPrefix.length);
    }

    // Determine the car type
    const carType = mapBodyType(specs?.bodyType || null, cleanModelName);

    // Determine fuel type
    const fuelType = mapFuelType(specs?.fuelType || null, cleanModelName);

    // Determine drivetrain
    const drivetrain = mapDrivetrain(specs?.drive || null);

    // Parse price
    const price = parsePrice(specs?.priceRange || null);

    // Parse torque
    const torque = parseTorque(specs?.torque || null);

    // Parse seats
    const seats = specs?.seats || null;

    // Build engine description
    let engine: string | null = null;
    if (specs?.batteryCapacity && fuelType === "Electric") {
      engine = specs.batteryType
        ? `${specs.batteryCapacity} ${specs.batteryType}`
        : specs.batteryCapacity;
    } else if (fuelType === "Hybrid") {
      engine = cleanModelName.toLowerCase().includes("dm-i") ? "1.5L DM-i PHEV"
        : cleanModelName.toLowerCase().includes("dm-p") ? "1.5T DM-p PHEV"
        : cleanModelName.toLowerCase().includes("em-p") ? "1.5T EM-P PHEV"
        : cleanModelName.toLowerCase().includes("reev") ? "Range Extender"
        : "PHEV";
    }

    // Build image URL - use CarNewsChina's CDN image
    const imageUrl = model.image
      ? (model.image.startsWith("http") ? model.image : `${CNC_BASE}${model.image}`)
      : `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(model.brand_name + " " + model.name)}`;

    // Determine year from specs or default to current
    let year = currentYear;
    if (specs?.releaseDate) {
      const yearMatch = specs.releaseDate.match(/(\d{4})/);
      if (yearMatch) year = parseInt(yearMatch[1], 10);
    }

    // Check if already exists
    const existing = await db.carModel.findFirst({
      where: {
        brand: model.brand_name,
        model: cleanModelName,
        year,
      },
    });

    const carData = {
      brand: model.brand_name,
      model: cleanModelName,
      type: carType,
      year,
      engine,
      fuelType,
      transmission: "Automatic" as const, // Most Chinese EVs are automatic
      horsepower: null,
      torque,
      drivetrain,
      seatingCapacity: seats,
      price,
      priceEstimated: price ? false : null,
      imageUrl,
      color: specs?.chineseName || null,
      bodyStyle: specs?.bodyType || null,
      mpgCity: null,
      mpgHighway: null,
    };

    if (existing) {
      // Merge data: only overwrite with non-null values from new data
      // Preserve existing values for fields that CNC doesn't have specs for
      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(carData)) {
        if (value !== null && value !== undefined) {
          updateData[key] = value;
        }
        // If new value is null, preserve the existing value (don't overwrite)
      }
      await db.carModel.update({
        where: { id: existing.id },
        data: updateData,
      });
      totalUpdated++;
    } else {
      await db.carModel.create({ data: carData });
      totalAdded++;
    }
  }

  const totalCars = await db.carModel.count();
  console.log(
    `[CNC] Done! Fetched: ${totalFetched}, Added: ${totalAdded}, Updated: ${totalUpdated}, Skipped: ${totalSkipped}, Total in DB: ${totalCars}`
  );

  return {
    totalFetched,
    totalAdded,
    totalUpdated,
    totalSkipped,
    brands: Array.from(brandsSet),
    errors,
  };
}

// Quick fetch: Get just top Chinese brand models with specs
export async function quickFetchCarNewsChinaData(): Promise<{
  totalFetched: number;
  totalAdded: number;
  totalUpdated: number;
  brands: string[];
  errors: string[];
}> {
  const errors: string[] = [];
  let totalFetched = 0;
  let totalAdded = 0;
  let totalUpdated = 0;
  const brandsSet = new Set<string>();

  // Focus on top Chinese brands
  const topBrands = [
    "byd", "nio", "xpeng", "zeekr", "geely", "li-auto",
    "chery", "avatr", "hongqi", "gwm", "mg-motor", "leapmotor",
    "denza", "changan", "aion", "lynk-co", "aito", "deepal"
  ];

  console.log(`[CNC Quick] Fetching top ${topBrands.length} Chinese brands`);

  for (const brandSlug of topBrands) {
    try {
      const data = await fetchBrandModels(brandSlug, 1);

      if (!data || !data.models || data.models.length === 0) {
        continue;
      }

      const currentYear = getCurrentYear();

      for (const model of data.models) {
        totalFetched++;
        brandsSet.add(model.brand_name);

        // Clean model name - remove brand prefix if present
        let cleanModelName = model.name;
        const brandPrefix = model.brand_name + " ";
        if (cleanModelName.toUpperCase().startsWith(brandPrefix.toUpperCase())) {
          cleanModelName = cleanModelName.substring(brandPrefix.length);
        }

        const carType = mapBodyType(null, cleanModelName);
        const fuelType = mapFuelType(null, cleanModelName);

        const imageUrl = model.image
          ? (model.image.startsWith("http") ? model.image : `${CNC_BASE}${model.image}`)
          : `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(model.brand_name + " " + cleanModelName)}`;

        const existing = await db.carModel.findFirst({
          where: {
            brand: model.brand_name,
            model: cleanModelName,
            year: currentYear,
          },
        });

        const carData = {
          brand: model.brand_name,
          model: cleanModelName,
          type: carType,
          year: currentYear,
          engine: null,
          fuelType,
          transmission: "Automatic" as const,
          horsepower: null,
          torque: null,
          drivetrain: null,
          seatingCapacity: null,
          price: null,
          imageUrl,
          color: null,
          bodyStyle: null,
          mpgCity: null,
          mpgHighway: null,
        };

        if (existing) {
          // Only update fields that have non-null values
          // Preserve existing price, engine, etc. when quick fetch has no specs
          const updateData: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(carData)) {
            if (value !== null && value !== undefined) {
              updateData[key] = value;
            }
            // If new value is null, preserve the existing value (don't overwrite)
          }
          await db.carModel.update({
            where: { id: existing.id },
            data: updateData,
          });
          totalUpdated++;
        } else {
          await db.carModel.create({ data: carData });
          totalAdded++;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      errors.push(`Failed to fetch brand ${brandSlug}: ${err}`);
    }
  }

  return {
    totalFetched,
    totalAdded,
    totalUpdated,
    brands: Array.from(brandsSet),
    errors,
  };
}
