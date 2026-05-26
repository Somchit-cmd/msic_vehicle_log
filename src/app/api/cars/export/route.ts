import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "csv";
    const brand = searchParams.get("brand");
    const type = searchParams.get("type");
    const year = searchParams.get("year");
    const fuelType = searchParams.get("fuelType");
    const transmission = searchParams.get("transmission");
    const search = searchParams.get("search");

    // Build where clause (same as GET /api/cars)
    const where: Record<string, unknown> = {};

    if (brand && brand !== "all") where.brand = brand;
    if (type && type !== "all") where.type = type;
    if (year && year !== "all") where.year = parseInt(year);
    if (fuelType && fuelType !== "all") where.fuelType = fuelType;
    if (transmission && transmission !== "all") where.transmission = transmission;

    if (search) {
      where.OR = [
        { brand: { contains: search } },
        { model: { contains: search } },
        { type: { contains: search } },
        { engine: { contains: search } },
        { color: { contains: search } },
      ];
    }

    const cars = await db.carModel.findMany({
      where,
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    });

    if (format === "csv") {
      const headers = [
        "Brand",
        "Model",
        "Type",
        "Year",
        "Engine",
        "Fuel Type",
        "Transmission",
        "Horsepower",
        "Torque",
        "Drivetrain",
        "Seating Capacity",
        "Price",
        "Color",
        "Body Style",
        "MPG City",
        "MPG Highway",
      ];

      const csvRows = [headers.join(",")];

      for (const car of cars) {
        const row = [
          `"${car.brand}"`,
          `"${car.model}"`,
          `"${car.type}"`,
          car.year,
          car.engine ? `"${car.engine}"` : "",
          car.fuelType ? `"${car.fuelType}"` : "",
          car.transmission ? `"${car.transmission}"` : "",
          car.horsepower || "",
          car.torque || "",
          car.drivetrain ? `"${car.drivetrain}"` : "",
          car.seatingCapacity || "",
          car.price || "",
          car.color ? `"${car.color}"` : "",
          car.bodyStyle ? `"${car.bodyStyle}"` : "",
          car.mpgCity || "",
          car.mpgHighway || "",
        ];
        csvRows.push(row.join(","));
      }

      const csvContent = csvRows.join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="car-models-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Excel format - return as tab-separated values with BOM for Excel
    if (format === "excel") {
      const headers = [
        "Brand",
        "Model",
        "Type",
        "Year",
        "Engine",
        "Fuel Type",
        "Transmission",
        "Horsepower",
        "Torque",
        "Drivetrain",
        "Seating Capacity",
        "Price",
        "Color",
        "Body Style",
        "MPG City",
        "MPG Highway",
      ];

      const excelRows = [headers.join("\t")];

      for (const car of cars) {
        const row = [
          car.brand,
          car.model,
          car.type,
          car.year,
          car.engine || "",
          car.fuelType || "",
          car.transmission || "",
          car.horsepower || "",
          car.torque || "",
          car.drivetrain || "",
          car.seatingCapacity || "",
          car.price || "",
          car.color || "",
          car.bodyStyle || "",
          car.mpgCity || "",
          car.mpgHighway || "",
        ];
        excelRows.push(row.join("\t"));
      }

      // Add BOM for proper Excel UTF-8 encoding
      const BOM = "\uFEFF";
      const excelContent = BOM + excelRows.join("\n");

      return new NextResponse(excelContent, {
        headers: {
          "Content-Type": "application/vnd.ms-excel; charset=utf-8",
          "Content-Disposition": `attachment; filename="car-models-${new Date().toISOString().split("T")[0]}.xls"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format. Use 'csv' or 'excel'" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting cars:", error);
    return NextResponse.json(
      { error: "Failed to export cars" },
      { status: 500 }
    );
  }
}
