import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { fetchAllCompatibleVehicles } from "@/lib/services/smartcar-service";

const prisma = new PrismaClient();

// POST /api/cars/fetch-smartcar - Fetch compatible vehicles from Smartcar Compatibility API (FREE, no auth)
export async function POST(request: NextRequest) {
  try {
    console.log("[Smartcar] Starting Compatibility API fetch...");

    // Fetch all compatible vehicles
    const vehicles = await fetchAllCompatibleVehicles();

    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({
        error: "no_data",
        message: "No compatible vehicles found from Smartcar Compatibility API.",
      });
    }

    console.log(`[Smartcar] Got ${vehicles.length} compatible vehicle entries, processing...`);

    // First, get all existing cars to do in-memory duplicate checking (much faster)
    const existingCars = await prisma.carModel.findMany({
      select: { id: true, brand: true, model: true, year: true, externalId: true, fuelType: true, region: true },
    });

    // Build lookup maps for fast duplicate checking
    const externalIdMap = new Map(existingCars.map(c => [c.externalId, c]));
    const brandModelYearMap = new Map(existingCars.map(c => [`${c.brand}|${c.model}|${c.year}`, c]));

    const brandSet = new Set<string>();
    let totalAdded = 0;
    let totalUpdated = 0;
    const toCreate: Array<{
      brand: string;
      model: string;
      type: string;
      year: number;
      fuelType: string | null;
      region: string;
      source: string;
      externalId: string;
    }> = [];

    // Process all vehicles in memory first
    for (const v of vehicles) {
      try {
        const attrs = v.attributes;
        brandSet.add(attrs.make);

        // Map powertrain type to fuel type
        let fuelType: string | null = null;
        switch (attrs.powertrainType) {
          case "BEV":
            fuelType = "Electric";
            break;
          case "PHEV":
            fuelType = "Hybrid";
            break;
          case "ICE":
            fuelType = "Gasoline";
            break;
          case "HEV":
            fuelType = "Hybrid";
            break;
          default:
            fuelType = attrs.powertrainType || null;
        }

        // Determine body type from model name
        const modelName = attrs.model.toLowerCase();
        let carType = "Sedan";
        if (modelName.includes("suv") || modelName.includes("sport utility")) {
          carType = "SUV";
        } else if (modelName.includes("truck") || modelName.includes("pickup")) {
          carType = "Truck";
        } else if (modelName.includes("coupe")) {
          carType = "Coupe";
        } else if (modelName.includes("convertible") || modelName.includes("cabriolet")) {
          carType = "Convertible";
        } else if (modelName.includes("hatchback") || modelName.includes("hatch")) {
          carType = "Hatchback";
        } else if (modelName.includes("van") || modelName.includes("minivan")) {
          carType = "Van";
        } else if (modelName.includes("wagon") || modelName.includes("estate")) {
          carType = "Wagon";
        }

        // Smartcar returns year ranges (e.g., 2023-2026)
        const startYear = attrs.years.start;
        const endYear = attrs.years.end;

        for (let year = startYear; year <= endYear; year++) {
          const externalId = `smartcar_${v.id}_${year}`;

          // Check by externalId first
          if (externalIdMap.has(externalId)) {
            totalUpdated++;
            continue;
          }

          // Check for duplicate by brand+model+year
          const key = `${attrs.make}|${attrs.model}|${year}`;
          if (brandModelYearMap.has(key)) {
            // Will update this existing record
            totalUpdated++;
            continue;
          }

          // Add to batch create list
          toCreate.push({
            brand: attrs.make,
            model: attrs.model,
            type: carType,
            year,
            fuelType,
            region: attrs.region,
            source: "smartcar",
            externalId,
          });

          // Add to maps so subsequent entries know about it
          externalIdMap.set(externalId, { id: "new", brand: attrs.make, model: attrs.model, year, externalId, fuelType, region: attrs.region });
          brandModelYearMap.set(key, { id: "new", brand: attrs.make, model: attrs.model, year, externalId, fuelType, region: attrs.region });
          totalAdded++;
        }
      } catch (err) {
        console.error(`[Smartcar] Error processing ${v.attributes.make} ${v.attributes.model}:`, err);
      }
    }

    // Batch insert using createMany (much faster than individual creates)
    if (toCreate.length > 0) {
      console.log(`[Smartcar] Batch creating ${toCreate.length} new records...`);
      // Insert in chunks of 100 to avoid SQLite limits
      for (let i = 0; i < toCreate.length; i += 100) {
        const chunk = toCreate.slice(i, i + 100);
        await prisma.carModel.createMany({
          data: chunk,
        });
      }
    }

    const brandCount = brandSet.size;
    console.log(`[Smartcar] Done: Added ${totalAdded}, Updated/Skipped ${totalUpdated}`);

    return NextResponse.json({
      success: true,
      totalFetched: vehicles.length,
      totalAdded,
      totalUpdated,
      brandCount,
      message: `Fetched ${vehicles.length} vehicle entries from ${brandCount} brands via Smartcar Compatibility API. Added ${totalAdded} new models (year ranges expanded).`,
    });
  } catch (error) {
    console.error("[Smartcar] Fetch error:", error);
    return NextResponse.json(
      {
        error: "fetch_failed",
        message: `Failed to fetch from Smartcar Compatibility API: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}

// GET /api/cars/fetch-smartcar - Check Smartcar Compatibility API availability
export async function GET() {
  try {
    // The Compatibility API is always available (free, no auth required)
    // Do a quick test fetch to verify it's working and get the count
    const response = await fetch(
      "https://compatibility.api.smartcar.com/v3/compatible-vehicles",
      {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const totalCount = data.meta?.totalCount || data.data?.length || 0;
      return NextResponse.json({
        available: true,
        totalVehicles: totalCount,
        message: `Smartcar Compatibility API is available — ${totalCount} vehicles (FREE, no auth required).`,
      });
    } else {
      return NextResponse.json({
        available: false,
        totalVehicles: 0,
        message: `Smartcar Compatibility API returned status ${response.status}`,
      });
    }
  } catch (error) {
    return NextResponse.json({
      available: false,
      totalVehicles: 0,
      message: `Failed to reach Smartcar Compatibility API: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
