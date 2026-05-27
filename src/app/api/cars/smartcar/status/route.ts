import { NextRequest, NextResponse } from "next/server";
import { isSmartcarConfigured } from "@/lib/services/smartcar-service";

// GET /api/cars/smartcar/status - Check Smartcar connection status
export async function GET(request: NextRequest) {
  try {
    const configured = isSmartcarConfigured();
    const accessToken = request.cookies.get("smartcar_access_token")?.value;
    const refreshToken = request.cookies.get("smartcar_refresh_token")?.value;
    const connected = !!(accessToken || refreshToken);

    return NextResponse.json({
      configured,
      connected,
      mode: process.env.SMARTCAR_MODE || "test",
      message: !configured
        ? "Smartcar is not configured. Set SMARTCAR_CLIENT_ID and SMARTCAR_CLIENT_SECRET."
        : connected
        ? "Vehicle is connected via Smartcar."
        : "Smartcar is configured but no vehicle is connected. Use Smartcar Connect to link a vehicle.",
    });
  } catch (error) {
    return NextResponse.json(
      { configured: false, connected: false, message: `Error checking status: ${error}` },
      { status: 500 }
    );
  }
}
