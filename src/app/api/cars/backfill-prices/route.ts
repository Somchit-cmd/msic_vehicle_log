import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { estimatePrice } from "@/lib/services/price-estimates";

// POST /api/cars/backfill-prices - Backfill estimated prices for cars with null price
export async function POST() {
  try {
    // Find all cars with null price
    const carsWithoutPrice = await db.carModel.findMany({
      where: { price: null },
      select: { id: true, brand: true, model: true, type: true, year: true },
    });

    console.log(`[PriceBackfill] Found ${carsWithoutPrice.length} cars without price`);

    let updated = 0;
    let noEstimate = 0;

    for (const car of carsWithoutPrice) {
      const estimatedPrice = estimatePrice(car.brand, car.model, car.type, car.year);

      if (estimatedPrice) {
        await db.carModel.update({
          where: { id: car.id },
          data: { price: estimatedPrice, priceEstimated: true },
        });
        updated++;
      } else {
        noEstimate++;
      }
    }

    const totalCars = await db.carModel.count();
    const carsWithPrice = await db.carModel.count({ where: { price: { not: null } } });

    console.log(`[PriceBackfill] Done! Updated: ${updated}, No estimate: ${noEstimate}, Total with price: ${carsWithPrice}/${totalCars}`);

    return NextResponse.json({
      success: true,
      totalWithoutPrice: carsWithoutPrice.length,
      updated,
      noEstimate,
      totalCars,
      carsWithPrice,
      coveragePercent: Math.round((carsWithPrice / totalCars) * 100),
    });
  } catch (error) {
    console.error("[PriceBackfill] Error:", error);
    return NextResponse.json(
      { error: "Failed to backfill prices", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET /api/cars/backfill-prices - Check price coverage stats
export async function GET() {
  try {
    const totalCars = await db.carModel.count();
    const carsWithPrice = await db.carModel.count({ where: { price: { not: null } } });
    const carsWithoutPrice = totalCars - carsWithPrice;

    return NextResponse.json({
      totalCars,
      carsWithPrice,
      carsWithoutPrice,
      coveragePercent: totalCars > 0 ? Math.round((carsWithPrice / totalCars) * 100) : 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get price stats" },
      { status: 500 }
    );
  }
}
