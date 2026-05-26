import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { quickFetchNHTSAData } from "@/lib/services/nhtsa-service";

// This endpoint refreshes data from NHTSA API
export async function POST() {
  try {
    const currentCount = await db.carModel.count();

    // Fetch fresh data from NHTSA
    const result = await quickFetchNHTSAData([2024, 2025]);

    const totalCars = await db.carModel.count();

    return NextResponse.json({
      message: "Data refreshed from NHTSA API",
      previousCount: currentCount,
      fetchedFromAPI: result.totalFetched,
      addedCount: result.totalAdded,
      updatedCount: result.totalUpdated,
      totalCars,
      errors: result.errors.slice(0, 5),
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
