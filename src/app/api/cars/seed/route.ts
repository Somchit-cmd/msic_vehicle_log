import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SAMPLE_CAR_DATA, getCarImageUrl } from "@/lib/car-data";

export async function POST() {
  try {
    // Clear existing data
    await db.carModel.deleteMany();

    // Insert sample data with image URLs
    const carsWithImages = SAMPLE_CAR_DATA.map((car) => ({
      ...car,
      imageUrl: getCarImageUrl(car.brand, car.model, car.year),
    }));

    const result = await db.carModel.createMany({
      data: carsWithImages,
    });

    return NextResponse.json({
      message: "Database seeded successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
