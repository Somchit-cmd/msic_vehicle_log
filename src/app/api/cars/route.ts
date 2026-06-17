import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get("brand");
    const type = searchParams.get("type");
    const year = searchParams.get("year");
    const search = searchParams.get("search");
    const fuelType = searchParams.get("fuelType");
    const transmission = searchParams.get("transmission");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sort = searchParams.get("sort"); // brand, model, type, year, fuelType, horsepower, price
    const order = searchParams.get("order") === "desc" ? "desc" : "asc";

    // Allowed sort columns (mapped to DB fields). Unknown → default ordering.
    const SORTABLE: Record<string, string> = {
      brand: "brand",
      model: "model",
      type: "type",
      year: "year",
      fuelType: "fuelType",
      horsepower: "horsepower",
      price: "price",
    };
    // Sort by the chosen column, always pushing NULLs to the end so rows with
    // real data stay visible at the top of every page.
    const orderBy =
      sort && SORTABLE[sort]
        ? [{ [SORTABLE[sort]]: { sort: order, nulls: "last" as const } }]
        : [{ brand: "asc" }, { model: "asc" }];

    // Build where clause
    const where: Record<string, unknown> = {};

    if (brand && brand !== "all") {
      where.brand = brand;
    }

    if (type && type !== "all") {
      where.type = type;
    }

    if (year && year !== "all") {
      where.year = parseInt(year);
    }

    if (fuelType && fuelType !== "all") {
      where.fuelType = fuelType;
    }

    if (transmission && transmission !== "all") {
      where.transmission = transmission;
    }

    if (search) {
      where.OR = [
        { brand: { contains: search } },
        { model: { contains: search } },
        { type: { contains: search } },
        { engine: { contains: search } },
        { color: { contains: search } },
      ];
    }

    const [cars, total] = await Promise.all([
      db.carModel.findMany({
        where,
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.carModel.count({ where }),
    ]);

    return NextResponse.json({
      cars,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}
