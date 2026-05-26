import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { quickFetchNHTSAData } from "@/lib/services/nhtsa-service";
import { SAMPLE_CAR_DATA, getCarImageUrl } from "@/lib/car-data";
import { CHINESE_CAR_DATA } from "@/lib/chinese-car-data";

// Seed with sample data + Chinese brands, then fetch from NHTSA in background
export async function POST() {
  try {
    // Clear existing data
    await db.carModel.deleteMany();

    // 1. Seed with enriched sample data (has engine, HP, price, etc.)
    const sampleCarsWithImages = SAMPLE_CAR_DATA.map((car) => ({
      ...car,
      imageUrl: getCarImageUrl(car.brand, car.model, car.year),
    }));
    const sampleResult = await db.carModel.createMany({
      data: sampleCarsWithImages,
    });

    // 2. Seed Chinese car brands
    let chineseAdded = 0;
    for (const car of CHINESE_CAR_DATA) {
      const imageUrl = `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(car.brand + " " + car.model)}`;
      await db.carModel.create({
        data: {
          brand: car.brand,
          model: car.model,
          type: car.type,
          year: car.year,
          engine: car.engine || null,
          fuelType: car.fuelType || null,
          transmission: car.transmission || null,
          horsepower: car.horsepower || null,
          torque: car.torque || null,
          drivetrain: car.drivetrain || null,
          seatingCapacity: car.seatingCapacity || null,
          price: car.price || null,
          imageUrl,
          color: car.color || null,
          bodyStyle: car.bodyStyle || null,
          mpgCity: car.mpgCity || null,
          mpgHighway: car.mpgHighway || null,
        },
      });
      chineseAdded++;
    }

    // 3. Fetch additional models from NHTSA API in the background
    quickFetchNHTSAData([2024, 2025]).then((result) => {
      console.log(
        `[NHTSA Background] Fetched: ${result.totalFetched}, Added: ${result.totalAdded}, Updated: ${result.totalUpdated}`
      );
    });

    return NextResponse.json({
      message:
        "Database seeded with sample data + Chinese brands. NHTSA API fetch running in background.",
      sampleCount: sampleResult.count,
      chineseCount: chineseAdded,
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
