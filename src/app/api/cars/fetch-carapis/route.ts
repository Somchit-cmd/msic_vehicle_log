import { NextRequest, NextResponse } from "next/server";
import {
  fetchAndStoreCarAPIsData,
  quickFetchCarAPIsData,
} from "@/lib/services/carapis-service";

// Full CarAPIs fetch - fetches vehicles across all categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const fullFetch = body.fullFetch !== false; // default to full
    const maxPages = body.maxPages || 2;

    const result = fullFetch
      ? await fetchAndStoreCarAPIsData({ maxPages, fetchByCategory: true })
      : await quickFetchCarAPIsData();

    return NextResponse.json({
      message: "CarAPIs fetch completed",
      totalFetched: result.totalFetched,
      totalAdded: result.totalAdded,
      totalUpdated: result.totalUpdated,
      brandCount: result.brands.length,
      brands: result.brands,
      errors: result.errors.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in CarAPIs fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch from CarAPIs", details: String(error) },
      { status: 500 }
    );
  }
}

// Quick fetch - just electric + mixed vehicles
export async function GET() {
  try {
    const result = await quickFetchCarAPIsData();

    return NextResponse.json({
      message: "CarAPIs quick fetch completed",
      totalFetched: result.totalFetched,
      totalAdded: result.totalAdded,
      totalUpdated: result.totalUpdated,
      brandCount: result.brands.length,
      brands: result.brands,
      errors: result.errors.slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in CarAPIs quick fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch from CarAPIs", details: String(error) },
      { status: 500 }
    );
  }
}
