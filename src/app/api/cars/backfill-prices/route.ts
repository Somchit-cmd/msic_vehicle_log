import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { estimatePriceWithSource } from "@/lib/services/price-estimates";

// POST /api/cars/backfill-prices - Backfill estimated prices for cars with null price
// Uses the tiered price engine: curated dataset → trim-adjusted → brand heuristic.
// Only fills rows where price IS NULL (never overwrites real imported prices).
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
    const bySource = { curated: 0, "trim-adjusted": 0, "brand-heuristic": 0, "unknown-brand": 0 };

    for (const car of carsWithoutPrice) {
      const estimate = estimatePriceWithSource(car.brand, car.model, car.type, car.year);

      if (estimate) {
        await db.carModel.update({
          where: { id: car.id },
          data: {
            price: estimate.price,
            priceEstimated: true,
            priceSource: estimate.source,
          },
        });
        updated++;
        bySource[estimate.source]++;
      } else {
        noEstimate++;
      }
    }

    const totalCars = await db.carModel.count();
    const carsWithPrice = await db.carModel.count({ where: { price: { not: null } } });

    console.log(
      `[PriceBackfill] Done! Updated: ${updated} (curated: ${bySource.curated}, trim: ${bySource["trim-adjusted"]}, heuristic: ${bySource["brand-heuristic"]}), No estimate: ${noEstimate}, Total with price: ${carsWithPrice}/${totalCars}`
    );

    return NextResponse.json({
      success: true,
      totalWithoutPrice: carsWithoutPrice.length,
      updated,
      noEstimate,
      bySource, // { curated, trim-adjusted, brand-heuristic }
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
