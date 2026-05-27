import { NextRequest, NextResponse } from "next/server";

// POST /api/cars/smartcar/disconnect - Disconnect Smartcar vehicle
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      disconnected: true,
      message: "Smartcar vehicle disconnected successfully.",
    });

    response.cookies.set("smartcar_access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    response.cookies.set("smartcar_refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("[Smartcar] Disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect", details: String(error) },
      { status: 500 }
    );
  }
}
