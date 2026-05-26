import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { quickFetchNHTSAData } from "@/lib/services/nhtsa-service";
import { SAMPLE_CAR_DATA, getCarImageUrl } from "@/lib/car-data";

// Seed with sample data first, then fetch from NHTSA
export async function POST() {
  try {
    // Clear existing data
    await db.carModel.deleteMany();

    // First, seed with our enriched sample data (has engine, HP, price, etc.)
    const carsWithImages = SAMPLE_CAR_DATA.map((car) => ({
      ...car,
      imageUrl: getCarImageUrl(car.brand, car.model, car.year),
    }));

    const sampleResult = await db.carModel.createMany({
      data: carsWithImages,
    });

    // Then, fetch additional models from NHTSA API in the background
    // We don't await this to avoid timeout - it will run asynchronously
    quickFetchNHTSAData([2024, 2025]).then((result) => {
      console.log(
        `[NHTSA Background] Fetched: ${result.totalFetched}, Added: ${result.totalAdded}, Updated: ${result.totalUpdated}`
      );
      if (result.errors.length > 0) {
        console.error("[NHTSA Background] Errors:", result.errors.slice(0, 5));
      }
    });

    return NextResponse.json({
      message:
        "Database seeded with sample data. NHTSA API fetch running in background for additional models.",
      sampleCount: sampleResult.count,
      nhtsaStatus: "fetching_in_background",
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
