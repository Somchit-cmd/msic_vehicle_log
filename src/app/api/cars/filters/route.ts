import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Get unique filter options for the UI
export async function GET() {
  try {
    const [brands, types, years, fuelTypes, transmissions] = await Promise.all([
      db.carModel.findMany({
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),
      db.carModel.findMany({
        select: { type: true },
        distinct: ["type"],
        orderBy: { type: "asc" },
      }),
      db.carModel.findMany({
        select: { year: true },
        distinct: ["year"],
        orderBy: { year: "desc" },
      }),
      db.carModel.findMany({
        select: { fuelType: true },
        distinct: ["fuelType"],
        orderBy: { fuelType: "asc" },
      }),
      db.carModel.findMany({
        select: { transmission: true },
        distinct: ["transmission"],
        orderBy: { transmission: "asc" },
      }),
    ]);

    return NextResponse.json({
      brands: brands.map((b) => b.brand),
      types: types.map((t) => t.type),
      years: years.map((y) => y.year),
      fuelTypes: fuelTypes.map((f) => f.fuelType).filter(Boolean),
      transmissions: transmissions.map((t) => t.transmission).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
