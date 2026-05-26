// NHTSA vPIC API Integration Service
// Free US Government API - No API key required
// https://vpic.nhtsa.dot.gov/api/

import { db } from "@/lib/db";

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

// Major vehicle types from NHTSA
const VEHICLE_TYPES = [
  { id: 2, name: "Passenger Car", type: "Sedan" },
  { id: 3, name: "Truck", type: "Truck" },
  { id: 7, name: "Multipurpose Passenger Vehicle (MPV)", type: "SUV" },
] as const;

// Popular makes to fetch (top 30+ by sales volume)
const POPULAR_MAKE_IDS = [
  448, // Toyota
  474, // Honda
  460, // Ford
  467, // Chevrolet
  452, // BMW
  449, // Mercedes-Benz
  478, // Nissan
  473, // Mazda
  482, // Volkswagen
  485, // Volvo
  523, // Subaru
  498, // Hyundai
  499, // Kia
  515, // Lexus
  582, // Audi
  584, // Porsche
  441, // Tesla
  476, // Dodge
  477, // Chrysler
  475, // Acura
  480, // Infiniti
  481, // Mitsubishi
  456, // MINI
  5083, // Genesis
  10224, // Polestar
  10919, // Lucid
  442, // Jaguar
  440, // Aston Martin
  464, // Lincoln
  469, // Cadillac
  468, // Buick
  472, // GMC
  11832, // Shelby
  11856, // Fisker
];

// Map NHTSA vehicle type to our car types
function mapVehicleType(
  typeId: number,
  modelName: string
): string {
  const name = modelName.toLowerCase();

  // Specific model name mapping
  if (name.includes("coupe") || name.includes("mustang") || name.includes("camaro") || name.includes("corvette") || name.includes("supra") || name.includes("gt") || name.includes("gr86") || name.includes("911") || name.includes("gr corolla")) {
    return "Coupe";
  }
  if (name.includes("convertible") || name.includes("cabriolet") || name.includes("roadster") || name.includes("miata") || name.includes("spyder")) {
    return "Convertible";
  }
  if (name.includes("wagon") || name.includes("avant") || name.includes("outback") || name.includes("signia")) {
    return "Wagon";
  }
  if (name.includes("van") || name.includes("sienna") || name.includes("odyssey") || name.includes("pacifica") || name.includes("carnival") || name.includes("sienna")) {
    return "Van";
  }
  if (name.includes("hatchback") || name.includes("golf") || name.includes("civic hatch") || name.includes("corolla hatch") || name.includes("mini cooper") || name.includes("mazda3 hatch")) {
    return "Hatchback";
  }

  // By vehicle type ID
  if (typeId === 3) return "Truck";
  if (typeId === 7) return "SUV";

  return "Sedan";
}

// Map brand to common fuel type
function guessFuelType(brand: string, model: string): string {
  const name = `${brand} ${model}`.toLowerCase();
  if (name.includes("electric") || name.includes("ev") || name.includes("tesla") || name.includes("bz4x") || name.includes("ev6") || name.includes("ionic") || name.includes("lucid") || name.includes("ri1s") || name.includes("eq")) {
    return "Electric";
  }
  if (name.includes("hybrid") || name.includes("phev") || name.includes("prime") || name.includes("prius") || name.includes("mirai")) {
    return "Hybrid";
  }
  if (name.includes("diesel") || name.includes("tdi")) {
    return "Diesel";
  }
  return "Gasoline";
}

// Guess transmission based on brand/model patterns
function guessTransmission(brand: string, model: string): string {
  const name = `${brand} ${model}`.toLowerCase();
  if (name.includes("manual") || name.includes("mt")) return "Manual";
  if (name.includes("dct") || name.includes("dual-clutch")) return "Automatic";
  // Most modern cars are automatic/CVT
  if (["honda", "toyota", "nissan", "subaru"].some((b) => brand.toLowerCase().includes(b))) {
    if (name.includes("si") || name.includes("gr") || name.includes("type r") || name.includes("manual")) return "Manual";
    return "CVT";
  }
  return "Automatic";
}

// Estimate drivetrain based on model name
function guessDrivetrain(brand: string, model: string, type: string): string {
  const name = `${brand} ${model}`.toLowerCase();
  if (name.includes("4wd") || name.includes("4x4") || type === "Truck") return "4WD";
  if (name.includes("awd") || name.includes("quattro") || name.includes("xdrive") || name.includes("4motion")) return "AWD";
  if (name.includes("rwd") || name.includes("rear-wheel") || type === "Coupe" || brand.toLowerCase() === "porsche" || brand.toLowerCase() === "bmw") return "RWD";
  if (type === "SUV") return "AWD";
  return "FWD";
}

interface NHTSAModelResult {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

interface NHTSAMakeResult {
  MakeId: number;
  MakeName: string;
  VehicleTypeId: number;
  VehicleTypeName: string;
}

// Fetch models for a specific make and year from NHTSA
async function fetchModelsForMakeAndYear(
  makeId: number,
  year: number
): Promise<NHTSAModelResult[]> {
  const url = `${NHTSA_BASE}/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}?format=json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.Results || [];
}

// Fetch vehicle types for a make from NHTSA
async function fetchVehicleTypesForMake(
  makeId: number
): Promise<NHTSAMakeResult[]> {
  const url = `${NHTSA_BASE}/GetVehicleTypesForMakeId/${makeId}?format=json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.Results || [];
}

// Get the primary vehicle type ID for a make
async function getMakeTypeIds(makeId: number): Promise<number[]> {
  const types = await fetchVehicleTypesForMake(makeId);
  return types.map((t) => t.VehicleTypeId);
}

// Fetch all makes for a vehicle type
async function fetchMakesForType(
  vehicleType: string
): Promise<NHTSAMakeResult[]> {
  const url = `${NHTSA_BASE}/GetMakesForVehicleType/${vehicleType}?format=json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.Results || [];
}

// Generate image URL for a car
function getCarImageUrl(brand: string, model: string, year: number): string {
  return `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(brand + " " + model)}`;
}

// Main function: Fetch and store all car data from NHTSA
export async function fetchAndStoreNHTSAData(
  years: number[] = [2024, 2025]
): Promise<{
  totalFetched: number;
  totalAdded: number;
  totalUpdated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let totalFetched = 0;
  let totalAdded = 0;
  let totalUpdated = 0;

  console.log(`[NHTSA] Starting data fetch for years: ${years.join(", ")}`);

  // Get all makes across all vehicle types
  const allMakesMap = new Map<number, string>();

  for (const vt of ["car", "truck", "mpv"]) {
    try {
      const makes = await fetchMakesForType(vt);
      for (const make of makes) {
        if (!allMakesMap.has(make.MakeId)) {
          allMakesMap.set(make.MakeId, make.MakeName);
        }
      }
    } catch (err) {
      errors.push(`Failed to fetch makes for type ${vt}: ${err}`);
    }
  }

  console.log(`[NHTSA] Found ${allMakesMap.size} unique makes`);

  // Filter to popular makes (or all if we want)
  // For performance, we'll use the popular list but also include any makes in the DB
  const targetMakeIds = new Set(POPULAR_MAKE_IDS);

  // Also add any makes that already exist in our database
  const existingCars = await db.carModel.findMany({
    select: { brand: true },
    distinct: ["brand"],
  });

  // Process each make and year combination
  const makeEntries = Array.from(allMakesMap.entries()).filter(([id]) =>
    targetMakeIds.has(id)
  );

  console.log(`[NHTSA] Processing ${makeEntries.length} popular makes`);

  for (const [makeId, makeName] of makeEntries) {
    for (const year of years) {
      try {
        const models = await fetchModelsForMakeAndYear(makeId, year);

        if (!models || models.length === 0) continue;

        // Get type IDs for this make
        const typeIds = await getMakeTypeIds(makeId);
        const primaryTypeId = typeIds[0] || 2;

        for (const model of models) {
          totalFetched++;
          const carType = mapVehicleType(primaryTypeId, model.Model_Name);
          const fuelType = guessFuelType(makeName, model.Model_Name);
          const transmission = guessTransmission(makeName, model.Model_Name);
          const drivetrain = guessDrivetrain(makeName, model.Model_Name, carType);

          // Check if already exists
          const existing = await db.carModel.findFirst({
            where: {
              brand: makeName,
              model: model.Model_Name,
              year,
            },
          });

          const carData = {
            brand: makeName,
            model: model.Model_Name,
            type: carType,
            year,
            fuelType,
            transmission,
            drivetrain,
            imageUrl: getCarImageUrl(makeName, model.Model_Name, year),
            // These fields aren't available from NHTSA basic API
            engine: null,
            horsepower: null,
            torque: null,
            seatingCapacity: null,
            price: null,
            color: null,
            bodyStyle: null,
            mpgCity: null,
            mpgHighway: null,
          };

          if (existing) {
            // Update with any new info
            await db.carModel.update({
              where: { id: existing.id },
              data: carData,
            });
            totalUpdated++;
          } else {
            await db.carModel.create({ data: carData });
            totalAdded++;
          }
        }

        // Small delay to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        errors.push(`Failed to process ${makeName} ${year}: ${err}`);
      }
    }
  }

  const totalCars = await db.carModel.count();
  console.log(
    `[NHTSA] Done! Fetched: ${totalFetched}, Added: ${totalAdded}, Updated: ${totalUpdated}, Total in DB: ${totalCars}`
  );

  return { totalFetched, totalAdded, totalUpdated, errors };
}

// Quick fetch: Get just a few top makes for faster seeding
export async function quickFetchNHTSAData(
  years: number[] = [2025]
): Promise<{
  totalFetched: number;
  totalAdded: number;
  totalUpdated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let totalFetched = 0;
  let totalAdded = 0;
  let totalUpdated = 0;

  // Top 20 makes for quick fetch
  const topMakes = [
    { id: 448, name: "TOYOTA" },
    { id: 474, name: "HONDA" },
    { id: 460, name: "FORD" },
    { id: 467, name: "CHEVROLET" },
    { id: 452, name: "BMW" },
    { id: 449, name: "MERCEDES-BENZ" },
    { id: 478, name: "NISSAN" },
    { id: 473, name: "MAZDA" },
    { id: 482, name: "VOLKSWAGEN" },
    { id: 485, name: "VOLVO" },
    { id: 523, name: "SUBARU" },
    { id: 498, name: "HYUNDAI" },
    { id: 499, name: "KIA" },
    { id: 515, name: "LEXUS" },
    { id: 582, name: "AUDI" },
    { id: 584, name: "PORSCHE" },
    { id: 441, name: "TESLA" },
    { id: 476, name: "DODGE" },
    { id: 477, name: "CHRYSLER" },
    { id: 5083, name: "GENESIS" },
  ];

  for (const make of topMakes) {
    for (const year of years) {
      try {
        const models = await fetchModelsForMakeAndYear(make.id, year);
        if (!models || models.length === 0) continue;

        const typeIds = await getMakeTypeIds(make.id);
        const primaryTypeId = typeIds[0] || 2;

        for (const model of models) {
          totalFetched++;
          const carType = mapVehicleType(primaryTypeId, model.Model_Name);
          const fuelType = guessFuelType(make.name, model.Model_Name);
          const transmission = guessTransmission(make.name, model.Model_Name);
          const drivetrain = guessDrivetrain(make.name, model.Model_Name, carType);

          const existing = await db.carModel.findFirst({
            where: {
              brand: make.name,
              model: model.Model_Name,
              year,
            },
          });

          const carData = {
            brand: make.name,
            model: model.Model_Name,
            type: carType,
            year,
            fuelType,
            transmission,
            drivetrain,
            imageUrl: getCarImageUrl(make.name, model.Model_Name, year),
            engine: null,
            horsepower: null,
            torque: null,
            seatingCapacity: null,
            price: null,
            color: null,
            bodyStyle: null,
            mpgCity: null,
            mpgHighway: null,
          };

          if (existing) {
            await db.carModel.update({
              where: { id: existing.id },
              data: carData,
            });
            totalUpdated++;
          } else {
            await db.carModel.create({ data: carData });
            totalAdded++;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        errors.push(`Failed to process ${make.name} ${year}: ${err}`);
      }
    }
  }

  return { totalFetched, totalAdded, totalUpdated, errors };
}
