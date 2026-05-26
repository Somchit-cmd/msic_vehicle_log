import { NextResponse } from "next/server";
import { fetchAndStoreNHTSAData } from "@/lib/services/nhtsa-service";

// Full NHTSA fetch - this can take a while, meant for daily cron
export async function POST() {
  try {
    const result = await fetchAndStoreNHTSAData([2024, 2025]);

    return NextResponse.json({
      message: "NHTSA full fetch completed",
      totalFetched: result.totalFetched,
      totalAdded: result.totalAdded,
      totalUpdated: result.totalUpdated,
      errors: result.errors.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in NHTSA full fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch from NHTSA" },
      { status: 500 }
    );
  }
}

// Quick fetch - top 20 makes, faster
export async function GET() {
  try {
    const { quickFetchNHTSAData } = await import("@/lib/services/nhtsa-service");
    const result = await quickFetchNHTSAData([2024, 2025]);

    return NextResponse.json({
      message: "NHTSA quick fetch completed",
      totalFetched: result.totalFetched,
      totalAdded: result.totalAdded,
      totalUpdated: result.totalUpdated,
      errors: result.errors.slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in NHTSA quick fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch from NHTSA" },
      { status: 500 }
    );
  }
}
