// CarAPIs.com Integration Service
// API docs: https://api.carapis.com/apix/catalog_api/
// Requires API key (CARAPIS_API_KEY env variable)
// Has ~1800+ vehicles including BYD, Polestar, Tesla, and other global brands with photos

import { db } from "@/lib/db";

const CARAPIS_BASE = "https://api.carapis.com/apix/catalog_api";
const PAGE_SIZE = 50; // Max items per page

// CarAPIs response types
interface CarAPIsVehicle {
  id: string;
  source_code: string | null;
  brand_name: string;
  brand_slug: string;
  model_name: string;
  model_slug: string;
  trim: string;
  year: number;
  price_usd: number | null;
  mileage: number | null;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  seller_type: string;
  region: string;
  source_location: string | null;
  has_accident: boolean | null;
  is_new_vehicle: boolean | null;
  is_verified: boolean | null;
  first_seen_at: string;
  last_seen_at: string;
  thumb: CarAPIsPhoto | null;
  photos: CarAPIsPhoto[];
  photos_count: number;
  has_valuation: boolean;
  has_llm_analysis: boolean;
  analysis: {
    price_status: string;
    is_undervalued: boolean;
    percentile_rank: number;
    market_delta_pct: number;
  } | null;
}

interface CarAPIsPhoto {
  url: string;
  thumb_url: string;
  original_url: string;
  is_main: boolean;
  photo_type: string;
  position: number;
  width: number | null;
  height: number | null;
}

interface CarAPIsResponse {
  count: number;
  page: number;
  pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
  results: CarAPIsVehicle[];
}

// Map body type from CarAPIs to our type system
function mapBodyType(bodyType: string): string {
  const bt = bodyType.toLowerCase().trim();

  if (bt === "sedan") return "Sedan";
  if (bt === "suv") return "SUV";
  if (bt === "hatchback") return "Hatchback";
  if (bt === "coupe") return "Coupe";
  if (bt === "convertible") return "Convertible";
  if (bt === "van" || bt === "minivan") return "Van";
  if (bt === "wagon") return "Wagon";
  if (bt === "pickup" || bt === "truck") return "Truck";
  if (bt === "crossover") return "SUV";
  if (bt === "other") return "Sedan";

  return "Sedan";
}

// Map fuel type from CarAPIs to our type system
function mapFuelType(fuelType: string): string {
  const ft = fuelType.toLowerCase().trim();

  if (ft === "electric" || ft === "ev") return "Electric";
  if (ft === "hybrid" || ft === "plug_hybrid" || ft === "phev" || ft === "hev") return "Hybrid";
  if (ft === "diesel") return "Diesel";
  if (ft === "gasoline" || ft === "petrol" || ft === "gas") return "Gasoline";
  if (ft === "lpg" || ft === "cng") return "Gasoline";

  return "Gasoline";
}

// Map transmission from CarAPIs to our type system
function mapTransmission(transmission: string): string {
  const t = transmission.toLowerCase().trim();

  if (t === "auto" || t === "automatic") return "Automatic";
  if (t === "manual" || t === "mt") return "Manual";
  if (t === "cvt") return "CVT";
  if (t === "dct" || t === "dual-clutch") return "Automatic";
  if (t === "amt") return "Automatic";

  return "Automatic";
}

// Get the best image URL from the vehicle data
function getImageUrl(vehicle: CarAPIsVehicle): string {
  // Try the main thumb first
  if (vehicle.thumb?.original_url) {
    return vehicle.thumb.original_url;
  }

  // Try photos array
  const mainPhoto = vehicle.photos?.find((p) => p.is_main);
  if (mainPhoto?.original_url) {
    return mainPhoto.original_url;
  }

  // Try first photo
  if (vehicle.photos?.length > 0 && vehicle.photos[0].original_url) {
    return vehicle.photos[0].original_url;
  }

  // Fallback placeholder
  return `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(vehicle.brand_name + " " + vehicle.model_name)}`;
}

// Get API key from environment
function getApiKey(): string {
  const key = process.env.CARAPIS_API_KEY;
  if (!key) {
    throw new Error("CARAPIS_API_KEY environment variable is not set");
  }
  return key;
}

// Custom error for throttle/rate-limit
export class CarAPIsThrottleError extends Error {
  retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super(`CarAPIs rate limited. Try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`);
    this.name = "CarAPIsThrottleError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// Check if CarAPIs is available (not rate-limited) - makes 1 lightweight request
export async function checkCarAPIsStatus(): Promise<{
  available: boolean;
  retryAfterSeconds?: number;
  retryAfterMinutes?: number;
  totalVehicles?: number;
  message: string;
}> {
  try {
    const params = new URLSearchParams({
      page: "1",
      page_size: "1",
      available_only: "false",
    });

    const url = `${CARAPIS_BASE}/vehicles/?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    const data = await res.json();

    // Check for throttle response
    if (data.detail && typeof data.detail === "string" && data.detail.includes("throttled")) {
      const match = data.detail.match(/available in (\d+) seconds/);
      const retryAfter = match ? parseInt(match[1]) : 3600;
      return {
        available: false,
        retryAfterSeconds: retryAfter,
        retryAfterMinutes: Math.ceil(retryAfter / 60),
        message: `CarAPIs is rate-limited. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      };
    }

    return {
      available: true,
      totalVehicles: data.count || 0,
      message: `CarAPIs is available. ~${data.count || 0} vehicles in database.`,
    };
  } catch (err) {
    return {
      available: false,
      message: `Failed to check CarAPIs status: ${err}`,
    };
  }
}

// Fetch a single page of vehicles from CarAPIs
async function fetchVehiclePage(
  page: number,
  options: {
    fuelType?: string;
    bodyType?: string;
    brandName?: string;
  } = {}
): Promise<CarAPIsResponse | null> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: PAGE_SIZE.toString(),
      available_only: "false",
    });

    if (options.fuelType) params.set("fuel_type", options.fuelType);
    if (options.bodyType) params.set("body_type", options.bodyType);
    if (options.brandName) params.set("brand_name", options.brandName);

    const url = `${CARAPIS_BASE}/vehicles/?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.error(`[CarAPIs] Failed to fetch page ${page}: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();

    // Check for throttle/rate-limit response
    if (data.detail && typeof data.detail === "string" && data.detail.includes("throttled")) {
      const match = data.detail.match(/available in (\d+) seconds/);
      const retryAfter = match ? parseInt(match[1]) : 3600;
      console.error(`[CarAPIs] Rate limited! Retry after ${retryAfter} seconds.`);
      throw new CarAPIsThrottleError(retryAfter);
    }

    return data;
  } catch (err) {
    if (err instanceof CarAPIsThrottleError) throw err;
    console.error(`[CarAPIs] Error fetching page ${page}:`, err);
    return null;
  }
}

// Fetch all vehicles by paginating through all pages
async function fetchAllVehicles(
  options: {
    fuelType?: string;
    bodyType?: string;
    brandName?: string;
    maxPages?: number;
  } = {}
): Promise<CarAPIsVehicle[]> {
  const allVehicles: CarAPIsVehicle[] = [];
  const seenIds = new Set<string>();
  let page = 1;
  let hasMore = true;
  const maxPages = options.maxPages || 100;

  while (hasMore && page <= maxPages) {
    const data = await fetchVehiclePage(page, {
      fuelType: options.fuelType,
      bodyType: options.bodyType,
      brandName: options.brandName,
    });

    if (!data || !data.results || data.results.length === 0) {
      hasMore = false;
      break;
    }

    for (const vehicle of data.results) {
      if (!seenIds.has(vehicle.id)) {
        seenIds.add(vehicle.id);
        allVehicles.push(vehicle);
      }
    }

    console.log(
      `[CarAPIs] Page ${page}/${data.pages}: fetched ${data.results.length} vehicles, total unique: ${allVehicles.length}`
    );

    hasMore = data.has_next;
    page++;

    // Rate limiting: wait between requests (1 second to avoid throttling)
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return allVehicles;
}

// Store a single vehicle in the database
async function storeVehicle(
  vehicle: CarAPIsVehicle
): Promise<{ added: boolean; updated: boolean }> {
  const carType = mapBodyType(vehicle.body_type);
  const fuelType = mapFuelType(vehicle.fuel_type);
  const transmission = mapTransmission(vehicle.transmission);
  const imageUrl = getImageUrl(vehicle);

  // Build the model name including trim for uniqueness
  const modelName = vehicle.trim
    ? `${vehicle.model_name} - ${vehicle.trim}`
    : vehicle.model_name;

  // Check if already exists by externalId
  let existing = null;
  if (vehicle.id) {
    existing = await db.carModel.findFirst({
      where: { externalId: vehicle.id },
    });
  }

  // Also check by brand+model+year combination
  if (!existing) {
    existing = await db.carModel.findFirst({
      where: {
        brand: vehicle.brand_name,
        model: modelName,
        year: vehicle.year,
      },
    });
  }

  const carData = {
    brand: vehicle.brand_name,
    model: modelName,
    type: carType,
    year: vehicle.year,
    engine: null,
    fuelType,
    transmission,
    horsepower: null,
    torque: null,
    drivetrain: null,
    seatingCapacity: null,
    price: vehicle.price_usd ? parseFloat(vehicle.price_usd.toString()) : null,
    priceEstimated: false, // CarAPIs provides actual prices
    imageUrl,
    color: vehicle.color && vehicle.color !== "unknown" && vehicle.color !== "other"
      ? vehicle.color.charAt(0).toUpperCase() + vehicle.color.slice(1)
      : null,
    bodyStyle: vehicle.body_type,
    mpgCity: null,
    mpgHighway: null,
    source: "carapis",
    externalId: vehicle.id,
    trim: vehicle.trim || null,
    region: vehicle.region || null,
    sellerType: vehicle.seller_type || null,
    mileage: vehicle.mileage || null,
    isNewVehicle: vehicle.is_new_vehicle,
    hasAccident: vehicle.has_accident,
  };

  if (existing) {
    // Build update data that preserves existing non-null values
    // Only overwrite with new data when the source actually has it
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(carData)) {
      if (value !== null && value !== undefined) {
        updateData[key] = value;
      } else if (existing[key as keyof typeof existing] === null || existing[key as keyof typeof existing] === undefined) {
        // Both old and new are null, keep as-is
      }
      // If new is null but existing has a value, don't overwrite (skip this key)
    }
    await db.carModel.update({
      where: { id: existing.id },
      data: updateData,
    });
    return { added: false, updated: true };
  } else {
    await db.carModel.create({ data: carData });
    return { added: true, updated: false };
  }
}

// Main function: Fetch and store all vehicles from CarAPIs
// Conservative strategy: only fetch a few key categories to avoid rate-limiting
export async function fetchAndStoreCarAPIsData(
  options: {
    maxPages?: number;
    fetchByCategory?: boolean;
  } = {}
): Promise<{
  totalFetched: number;
  totalAdded: number;
  totalUpdated: number;
  brands: string[];
  errors: string[];
}> {
  const { maxPages = 2 } = options;

  const errors: string[] = [];
  let totalFetched = 0;
  let totalAdded = 0;
  let totalUpdated = 0;
  const brandsSet = new Set<string>();
  const allVehicles = new Map<string, CarAPIsVehicle>();

  console.log("[CarAPIs] Starting data fetch (conservative mode to avoid rate limits)...");

  // Step 1: Fetch default list (mixed vehicles) - 1 page only
  try {
    const defaultVehicles = await fetchAllVehicles({ maxPages: 1 });
    for (const v of defaultVehicles) {
      allVehicles.set(v.id, v);
    }
    console.log(`[CarAPIs] Default fetch: ${defaultVehicles.length} vehicles`);
  } catch (err) {
    if (err instanceof CarAPIsThrottleError) throw err;
    errors.push(`Default fetch failed: ${err}`);
  }

  // Step 2: Fetch electric vehicles (includes BYD, Tesla, NIO, etc.) - most important
  try {
    const electricVehicles = await fetchAllVehicles({ fuelType: "electric", maxPages });
    for (const v of electricVehicles) {
      if (!allVehicles.has(v.id)) allVehicles.set(v.id, v);
    }
    console.log(`[CarAPIs] Electric: ${electricVehicles.length} vehicles`);
  } catch (err) {
    if (err instanceof CarAPIsThrottleError) throw err;
    errors.push(`Electric fetch failed: ${err}`);
  }

  // Step 3: Fetch SUVs - popular category
  try {
    const suvVehicles = await fetchAllVehicles({ bodyType: "suv", maxPages: 1 });
    for (const v of suvVehicles) {
      if (!allVehicles.has(v.id)) allVehicles.set(v.id, v);
    }
    console.log(`[CarAPIs] SUV: ${suvVehicles.length} vehicles`);
  } catch (err) {
    if (err instanceof CarAPIsThrottleError) throw err;
    errors.push(`SUV fetch failed: ${err}`);
  }

  console.log(`[CarAPIs] Total unique vehicles: ${allVehicles.size}`);

  // Store all vehicles
  for (const vehicle of allVehicles.values()) {
    try {
      totalFetched++;
      brandsSet.add(vehicle.brand_name);
      const result = await storeVehicle(vehicle);
      if (result.added) totalAdded++;
      if (result.updated) totalUpdated++;
    } catch (err) {
      errors.push(`Failed to store vehicle ${vehicle.id}: ${err}`);
    }
  }

  const totalCars = await db.carModel.count();
  console.log(
    `[CarAPIs] Done! Fetched: ${totalFetched}, Added: ${totalAdded}, Updated: ${totalUpdated}, Total in DB: ${totalCars}`
  );

  return {
    totalFetched,
    totalAdded,
    totalUpdated,
    brands: Array.from(brandsSet),
    errors,
  };
}

// Quick fetch: Just fetch a few pages of the most interesting vehicles
export async function quickFetchCarAPIsData(): Promise<{
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

  console.log("[CarAPIs Quick] Starting quick fetch...");

  // Fetch electric vehicles first (most interesting, includes BYD)
  const electricVehicles = await fetchAllVehicles({ fuelType: "electric", maxPages: 2 });
  console.log(`[CarAPIs Quick] Electric: ${electricVehicles.length} vehicles`);

  // Fetch a page of default (mixed)
  const mixedVehicles = await fetchAllVehicles({ maxPages: 1 });
  console.log(`[CarAPIs Quick] Mixed: ${mixedVehicles.length} vehicles`);

  const allVehicles = new Map<string, CarAPIsVehicle>();
  for (const v of [...electricVehicles, ...mixedVehicles]) {
    allVehicles.set(v.id, v);
  }

  console.log(`[CarAPIs Quick] Total unique vehicles: ${allVehicles.size}`);

  for (const vehicle of allVehicles.values()) {
    try {
      totalFetched++;
      brandsSet.add(vehicle.brand_name);
      const result = await storeVehicle(vehicle);
      if (result.added) totalAdded++;
      if (result.updated) totalUpdated++;
    } catch (err) {
      errors.push(`Failed to store vehicle ${vehicle.id}: ${err}`);
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
