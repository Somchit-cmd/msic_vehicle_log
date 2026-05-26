import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SAMPLE_CAR_DATA, getCarImageUrl } from "@/lib/car-data";

// This endpoint simulates a daily auto-update by refreshing data
// In production, this would fetch from an external API
export async function POST() {
  try {
    // Get current car count
    const currentCount = await db.carModel.count();

    // Simulate data refresh - update existing records and add new ones
    const carsWithImages = SAMPLE_CAR_DATA.map((car) => ({
      ...car,
      imageUrl: getCarImageUrl(car.brand, car.model, car.year),
    }));

    // Upsert each car (update if exists based on brand+model+year, insert if not)
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

    // Simulate adding some "new" models that might appear in a daily update
    const newModels = [
      {
        brand: "Rivian",
        model: "R1S",
        type: "SUV",
        year: 2025,
        engine: "Quad Motor Electric",
        fuelType: "Electric",
        transmission: "Automatic",
        horsepower: 835,
        torque: 1050,
        drivetrain: "AWD",
        seatingCapacity: 7,
        price: 89900,
        imageUrl: getCarImageUrl("Rivian", "R1S", 2025),
        color: "Limestone",
        bodyStyle: "5-Door",
        mpgCity: 73,
        mpgHighway: 0,
      },
      {
        brand: "Lucid",
        model: "Air",
        type: "Sedan",
        year: 2025,
        engine: "Dual Motor Electric",
        fuelType: "Electric",
        transmission: "Automatic",
        horsepower: 620,
        torque: 738,
        drivetrain: "AWD",
        seatingCapacity: 5,
        price: 77400,
        imageUrl: getCarImageUrl("Lucid", "Air", 2025),
        color: "Infinite Black",
        bodyStyle: "4-Door",
        mpgCity: 140,
        mpgHighway: 0,
      },
    ];

    for (const newCar of newModels) {
      const exists = await db.carModel.findFirst({
        where: {
          brand: newCar.brand,
          model: newCar.model,
          year: newCar.year,
        },
      });
      if (!exists) {
        await db.carModel.create({ data: newCar });
        addedCount++;
      }
    }

    return NextResponse.json({
      message: "Data refreshed successfully",
      previousCount: currentCount,
      updatedCount,
      addedCount,
      totalCars: await db.carModel.count(),
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
