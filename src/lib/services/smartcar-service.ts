// Smartcar API Integration Service
// Two features:
// 1. Compatibility API (FREE, no auth) — lists compatible vehicles for catalog data
// 2. Connected Vehicle (OAuth2) — live data from a real connected vehicle
// Docs: https://smartcar.com/docs

import Smartcar from "smartcar";

// ============================================
// Types
// ============================================

interface SmartcarVehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  odometer?: number;
  odometerUnit?: string;
  fuel?: number;
  battery?: number;
  batteryCapacity?: number;
  charging?: boolean;
  chargeLimit?: number;
  engineOil?: { lifeRemaining: number };
  tirePressure?: {
    frontLeft: number | null;
    frontRight: number | null;
    backLeft: number | null;
    backRight: number | null;
  };
  location?: { latitude: number; longitude: number };
  isLocked?: boolean;
}

interface SmartcarTokens {
  accessToken: string;
  refreshToken: string;
  expiration: number;
  refreshExpiration: number;
}

// Compatibility API response types (JSON:API format)
interface CompatibleVehicleAttributes {
  make: string;
  model: string;
  years: { start: number; end: number };
  powertrainType: string; // "ICE", "BEV", "PHEV", "HEV"
  region: string; // "US", "EU", etc.
  capabilities: Array<{
    type: string;
    name: string;
    group: string;
    code: string;
    capability: string;
    permission: string;
  }>;
}

interface CompatibleVehicleEntry {
  id: string;
  type: "vehicle-model-capability";
  attributes: CompatibleVehicleAttributes;
}

interface CompatibilityApiResponse {
  data: CompatibleVehicleEntry[];
  meta: {
    page: number;
    pageSize: number;
    totalCount: number;
  };
  links?: {
    self?: string;
    next?: string;
    prev?: string;
  };
}

// ============================================
// Feature 1: Compatibility API (FREE, No Auth)
// Fetches list of compatible vehicles for catalog data
// ============================================

const COMPATIBILITY_API_BASE = "https://compatibility.api.smartcar.com/v3";

/**
 * Fetch compatible vehicles from Smartcar's Compatibility API.
 * This is a FREE, PUBLIC endpoint — no authentication required.
 * Returns vehicle make, model, year range, powertrain type, and region.
 *
 * The API returns ALL vehicles in one response (default pageSize = totalCount).
 */
export async function fetchCompatibleVehicles(): Promise<CompatibilityApiResponse> {
  const url = `${COMPATIBILITY_API_BASE}/compatible-vehicles`;
  console.log(`[Smartcar] Fetching compatible vehicles from: ${url}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(30000), // 30s timeout
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Smartcar] Compatibility API error: ${response.status}`, errorText);
    throw new Error(`Smartcar Compatibility API returned ${response.status}: ${errorText}`);
  }

  const data: CompatibilityApiResponse = await response.json();
  console.log(`[Smartcar] Got ${data.data?.length || 0} vehicles (total: ${data.meta?.totalCount || 0})`);
  return data;
}

/**
 * Fetch ALL compatible vehicles.
 * The API returns all vehicles in one response, so no pagination needed.
 */
export async function fetchAllCompatibleVehicles(): Promise<CompatibleVehicleEntry[]> {
  const response = await fetchCompatibleVehicles();
  return response.data || [];
}

/**
 * Get the total count of available vehicles in the Compatibility API.
 */
export async function getCompatibilityCount(): Promise<number> {
  try {
    const response = await fetchCompatibleVehicles();
    return response.meta?.totalCount || response.data?.length || 0;
  } catch {
    return 0;
  }
}

// ============================================
// Feature 2: Connected Vehicle (OAuth2)
// Requires vehicle owner to authorize via Smartcar Connect
// ============================================

/**
 * Get Smartcar AuthClient for OAuth2 Connect flow.
 */
export function getSmartcarClient(): Smartcar.AuthClient {
  const clientId = process.env.SMARTCAR_CLIENT_ID;
  const clientSecret = process.env.SMARTCAR_CLIENT_SECRET;
  const redirectUri =
    process.env.SMARTCAR_REDIRECT_URI ||
    "http://localhost:3000/api/cars/smartcar/callback";
  const mode = (process.env.SMARTCAR_MODE as "test" | "live") || "test";

  if (!clientId || !clientSecret) {
    throw new Error(
      "SMARTCAR_CLIENT_ID and SMARTCAR_CLIENT_SECRET environment variables are not set"
    );
  }

  return new Smartcar.AuthClient({
    clientId,
    clientSecret,
    redirectUri,
    mode,
  });
}

/**
 * Get Smartcar Connect URL — users authorize their vehicles through this.
 */
export function getConnectUrl(scope?: string[]): string {
  const client = getSmartcarClient();
  const defaultScope = [
    "read_vehicle_info",
    "read_odometer",
    "read_battery",
    "read_fuel",
    "read_tire_pressure",
    "read_engine_oil",
    "read_location",
    "control_security",
  ];

  return client.getAuthUrl({
    scope: scope || defaultScope,
  });
}

/**
 * Exchange authorization code for access token.
 */
export async function exchangeCode(code: string): Promise<SmartcarTokens> {
  const client = getSmartcarClient();
  const auth = await client.exchangeCode(code);

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiration: auth.expiration,
    refreshExpiration: auth.refreshExpiration,
  };
}

/**
 * Refresh an expired access token.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<SmartcarTokens> {
  const client = getSmartcarClient();
  const auth = await client.exchangeRefreshToken(refreshToken);

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiration: auth.expiration,
    refreshExpiration: auth.refreshExpiration,
  };
}

/**
 * Get all connected vehicle IDs.
 */
export async function getConnectedVehicleIds(
  accessToken: string
): Promise<string[]> {
  const vehicles = await Smartcar.getVehicles(accessToken);
  return vehicles.vehicles;
}

/**
 * Get vehicle attributes (make, model, year).
 */
export async function getVehicleAttributes(
  vehicleId: string,
  accessToken: string
): Promise<{
  id: string;
  make: string;
  model: string;
  year: number;
}> {
  const vehicle = new Smartcar.Vehicle(vehicleId, accessToken);
  const attributes = await vehicle.attributes();
  return {
    id: vehicleId,
    make: attributes.make,
    model: attributes.model,
    year: attributes.year,
  };
}

/**
 * Get full vehicle data from all Smartcar endpoints.
 */
export async function getFullVehicleData(
  vehicleId: string,
  accessToken: string
): Promise<SmartcarVehicleData> {
  const vehicle = new Smartcar.Vehicle(vehicleId, accessToken);

  // Get attributes first
  const attributes = await vehicle.attributes();

  const data: SmartcarVehicleData = {
    id: vehicleId,
    make: attributes.make,
    model: attributes.model,
    year: attributes.year,
  };

  // Fetch all data points in parallel, catching errors individually
  const [odometer, fuel, battery, batteryCapacity, engineOil, tirePressure, location, lockStatus] =
    await Promise.allSettled([
      vehicle.odometer().catch(() => null),
      vehicle.fuel().catch(() => null),
      vehicle.battery().catch(() => null),
      vehicle.batteryCapacity().catch(() => null),
      vehicle.engineOil().catch(() => null),
      vehicle.tirePressure().catch(() => null),
      vehicle.location().catch(() => null),
      vehicle.lockStatus().catch(() => null),
    ]);

  if (odometer.status === "fulfilled" && odometer.value) {
    data.odometer = odometer.value.distance;
    data.odometerUnit = odometer.value.distanceUnit || "km";
  }

  if (fuel.status === "fulfilled" && fuel.value) {
    data.fuel = fuel.value.range ?? fuel.value.percentRemaining;
  }

  if (battery.status === "fulfilled" && battery.value) {
    data.battery = battery.value.percentRemaining;
    data.charging = battery.value.state === "CHARGING";
  }

  if (batteryCapacity.status === "fulfilled" && batteryCapacity.value) {
    data.batteryCapacity = batteryCapacity.value.capacity;
  }

  if (engineOil.status === "fulfilled" && engineOil.value) {
    data.engineOil = { lifeRemaining: engineOil.value.lifeRemaining };
  }

  if (tirePressure.status === "fulfilled" && tirePressure.value) {
    data.tirePressure = {
      frontLeft: tirePressure.value.frontLeft ?? null,
      frontRight: tirePressure.value.frontRight ?? null,
      backLeft: tirePressure.value.backLeft ?? null,
      backRight: tirePressure.value.backRight ?? null,
    };
  }

  if (location.status === "fulfilled" && location.value) {
    data.location = {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
    };
  }

  if (lockStatus.status === "fulfilled" && lockStatus.value) {
    data.isLocked = lockStatus.value.isLocked;
  }

  return data;
}

/**
 * Get vehicle VIN.
 */
export async function getVehicleVin(
  vehicleId: string,
  accessToken: string
): Promise<string> {
  const vehicle = new Smartcar.Vehicle(vehicleId, accessToken);
  const vin = await vehicle.vin();
  return vin;
}

/**
 * Check if Smartcar OAuth is configured.
 */
export function isSmartcarConfigured(): boolean {
  return !!(
    process.env.SMARTCAR_CLIENT_ID &&
    process.env.SMARTCAR_CLIENT_SECRET
  );
}
