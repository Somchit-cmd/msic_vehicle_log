import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { CHINESE_CAR_DATA } from "@/lib/chinese-car-data";

// Seed Chinese car brands into the database
export async function POST() {
  try {
    let addedCount = 0;
    let updatedCount = 0;

    for (const car of CHINESE_CAR_DATA) {
      const imageUrl = `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(car.brand + " " + car.model)}`;

      const existing = await db.carModel.findFirst({
        where: {
          brand: car.brand,
          model: car.model,
          year: car.year,
        },
      });

      const carData = {
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
      };

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
      message: "Chinese car brands seeded successfully",
      chineseModels: CHINESE_CAR_DATA.length,
      addedCount,
      updatedCount,
      totalCars,
    });
  } catch (error) {
    console.error("Error seeding Chinese cars:", error);
    return NextResponse.json(
      { error: "Failed to seed Chinese car brands" },
      { status: 500 }
    );
  }
}
