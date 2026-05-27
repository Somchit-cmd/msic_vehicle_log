import { NextResponse } from "next/server";
import {
  fetchAndStoreCarNewsChinaData,
  quickFetchCarNewsChinaData,
} from "@/lib/services/carnewschina-service";

// Quick fetch - top Chinese brands only, faster
export async function GET() {
  try {
    const result = await quickFetchCarNewsChinaData();

    return NextResponse.json({
      message: "CarNewsChina quick fetch completed",
      source: "data.carnewschina.com",
      totalFetched: result.totalFetched,
      totalAdded: result.totalAdded,
      totalUpdated: result.totalUpdated,
      brands: result.brands,
      errors: result.errors.slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in CarNewsChina quick fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch from CarNewsChina" },
      { status: 500 }
    );
  }
}

// Full fetch - all models with specs (slower, more comprehensive)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const maxPages = body.maxPages || 35;
    const fetchSpecs = body.fetchSpecs !== false; // Default true
    const specBatchSize = body.specBatchSize || 100;

    const result = await fetchAndStoreCarNewsChinaData({
      maxPages,
      fetchSpecs,
      specBatchSize,
    });

    return NextResponse.json({
      message: "CarNewsChina full fetch completed",
      source: "data.carnewschina.com",
      totalFetched: result.totalFetched,
      totalAdded: result.totalAdded,
      totalUpdated: result.totalUpdated,
      totalSkipped: result.totalSkipped,
      brands: result.brands,
      brandCount: result.brands.length,
      errors: result.errors.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in CarNewsChina full fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch from CarNewsChina" },
      { status: 500 }
    );
  }
}
