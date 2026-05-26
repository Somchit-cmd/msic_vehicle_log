import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SAMPLE_CAR_DATA, getCarImageUrl } from "@/lib/car-data";

// This endpoint is designed to be called by a cron job daily
// It refreshes the car data in the database
export async function GET() {
  try {
    // Verify this is a legitimate cron request (simple token check)
    const authHeader = process.env.CRON_SECRET;
    // In production, you would validate the auth header from the request

    const carsWithImages = SAMPLE_CAR_DATA.map((car) => ({
      ...car,
      imageUrl: getCarImageUrl(car.brand, car.model, car.year),
    }));

    let updatedCount = 0;
    let addedCount = 0;

    for (const carData of carsWithImages) {
      const existing = await db.carModel.findFirst({
        where: {
          brand: carData.brand,
          model: carData.model,
          year: carData.year,
        },
      });

      if (existing) {
        await db.carModel.update({
          where: { id: existing.id },
          data: carData,
        });
        updatedCount++;
      } else {
        await db.carModel.create({ data: carData });
        addedCount++;
      }
    }

    const totalCars = await db.carModel.count();

    return NextResponse.json({
      success: true,
      message: "Daily refresh completed",
      updatedCount,
      addedCount,
      totalCars,
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
