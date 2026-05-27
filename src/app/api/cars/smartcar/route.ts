import { NextResponse } from "next/server";
import {
  getConnectUrl,
  isSmartcarConfigured,
} from "@/lib/services/smartcar-service";

// GET /api/cars/smartcar - Initiate Smartcar Connect flow
export async function GET() {
  try {
    if (!isSmartcarConfigured()) {
      return NextResponse.json(
        { error: "Smartcar is not configured. Set SMARTCAR_CLIENT_ID and SMARTCAR_CLIENT_SECRET." },
        { status: 400 }
      );
    }

    const connectUrl = getConnectUrl();

    return NextResponse.json({
      connectUrl,
      message: "Redirect user to connectUrl to authorize their vehicle with Smartcar Connect.",
    });
  } catch (error) {
    console.error("Smartcar auth error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Smartcar Connect", details: String(error) },
      { status: 500 }
    );
  }
}
