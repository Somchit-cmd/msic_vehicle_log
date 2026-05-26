import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { quickFetchNHTSAData } from "@/lib/services/nhtsa-service";
import { quickFetchCarNewsChinaData } from "@/lib/services/carnewschina-service";

// This endpoint refreshes data from NHTSA API + CarNewsChina
export async function POST() {
  try {
    const currentCount = await db.carModel.count();

    // Fetch fresh data from NHTSA (US/international brands)
    const nhtsaResult = await quickFetchNHTSAData([2024, 2025]);

    // Fetch fresh data from CarNewsChina (Chinese EV brands)
    const cncResult = await quickFetchCarNewsChinaData();

    const totalCars = await db.carModel.count();

    return NextResponse.json({
      message: "Data refreshed from NHTSA API + CarNewsChina",
      previousCount: currentCount,
      nhtsaFetched: nhtsaResult.totalFetched,
      cncFetched: cncResult.totalFetched,
      addedCount: nhtsaResult.totalAdded + cncResult.totalAdded,
      updatedCount: nhtsaResult.totalUpdated + cncResult.totalUpdated,
      chineseBrands: cncResult.brands.length,
      totalCars,
      errors: [...nhtsaResult.errors, ...cncResult.errors].slice(0, 5),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error refreshing data:", error);
    return NextResponse.json(
      { error: "Failed to refresh data" },
      { status: 500 }
    );
  }
}
