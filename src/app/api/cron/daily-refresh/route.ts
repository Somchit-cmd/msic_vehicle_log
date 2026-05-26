import { NextResponse } from "next/server";
import { quickFetchNHTSAData } from "@/lib/services/nhtsa-service";

// This endpoint is designed to be called by a cron job daily
// It refreshes the car data from NHTSA API
export async function GET() {
  try {
    const result = await quickFetchNHTSAData([2024, 2025]);

    return NextResponse.json({
      success: true,
      message: "Daily NHTSA refresh completed",
      totalFetched: result.totalFetched,
      addedCount: result.totalAdded,
      updatedCount: result.totalUpdated,
      errors: result.errors.slice(0, 5),
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
