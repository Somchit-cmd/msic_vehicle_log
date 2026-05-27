// Smartcar API Integration Service
// Smartcar provides connected vehicle data through OAuth 2.0
// Users connect their vehicles via Smartcar Connect, then we can read live data
// Docs: https://smartcar.com/docs

import Smartcar from "smartcar";

// Types for Smartcar vehicle data
interface SmartcarVehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  odometer?: number;
  odometerUnit?: string;
  fuel?: number; // percent remaining
  battery?: number; // percent remaining
  batteryCapacity?: number; // kWh
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

// Get Smartcar AuthClient
export function getSmartcarClient(): Smartcar.AuthClient {
  const clientId = process.env.SMARTCAR_CLIENT_ID;
  const clientSecret = process.env.SMARTCAR_CLIENT_SECRET;
  const redirectUri = process.env.SMARTCAR_REDIRECT_URI || "http://localhost:3000/api/cars/smartcar/callback";
  const mode = (process.env.SMARTCAR_MODE as "test" | "live") || "test";

  if (!clientId || !clientSecret) {
    throw new Error("SMARTCAR_CLIENT_ID and SMARTCAR_CLIENT_SECRET environment variables are not set");
  }

  return new Smartcar.AuthClient({
    clientId,
    clientSecret,
    redirectUri,
    mode,
  });
}

// Get Smartcar Connect URL - users authorize their vehicles through this
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

// Exchange authorization code for access token
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

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string): Promise<SmartcarTokens> {
  const client = getSmartcarClient();
  const auth = await client.exchangeRefreshToken(refreshToken);

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiration: auth.expiration,
    refreshExpiration: auth.refreshExpiration,
  };
}

// Get all connected vehicle IDs
export async function getConnectedVehicleIds(accessToken: string): Promise<string[]> {
  const vehicles = await Smartcar.getVehicles(accessToken);
  return vehicles.vehicles;
}

// Get vehicle attributes (make, model, year)
export async function getVehicleAttributes(vehicleId: string, accessToken: string): Promise<{
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

// Get full vehicle data from all Smartcar endpoints
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

// Get vehicle VIN
export async function getVehicleVin(vehicleId: string, accessToken: string): Promise<string> {
  const vehicle = new Smartcar.Vehicle(vehicleId, accessToken);
  const vin = await vehicle.vin();
  return vin;
}

// Check if Smartcar is configured
export function isSmartcarConfigured(): boolean {
  return !!(process.env.SMARTCAR_CLIENT_ID && process.env.SMARTCAR_CLIENT_SECRET);
}
