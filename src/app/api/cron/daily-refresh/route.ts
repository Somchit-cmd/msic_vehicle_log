import { NextResponse } from "next/server";
import { quickFetchNHTSAData } from "@/lib/services/nhtsa-service";
import { quickFetchCarNewsChinaData } from "@/lib/services/carnewschina-service";

// This endpoint is designed to be called by a cron job daily
// It refreshes the car data from NHTSA API + CarNewsChina
export async function GET() {
  try {
    // Fetch from NHTSA (US/international brands)
    const nhtsaResult = await quickFetchNHTSAData([2024, 2025]);

    // Fetch from CarNewsChina (Chinese EV brands)
    const cncResult = await quickFetchCarNewsChinaData();

    return NextResponse.json({
      success: true,
      message: "Daily refresh completed (NHTSA + CarNewsChina)",
      nhtsa: {
        totalFetched: nhtsaResult.totalFetched,
        addedCount: nhtsaResult.totalAdded,
        updatedCount: nhtsaResult.totalUpdated,
      },
      carnewschina: {
        totalFetched: cncResult.totalFetched,
        addedCount: cncResult.totalAdded,
        updatedCount: cncResult.totalUpdated,
        brands: cncResult.brands.length,
      },
      errors: [...nhtsaResult.errors, ...cncResult.errors].slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in daily refresh cron:", error);
    return NextResponse.json(
      { success: false, error: "Daily refresh failed" },
      { status: 500 }
    );
  }
}
