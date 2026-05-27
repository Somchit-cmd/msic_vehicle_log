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
        {
          error: "Smartcar is not configured",
          details: "Set SMARTCAR_CLIENT_ID and SMARTCAR_CLIENT_SECRET environment variables. The Smartcar Connect feature requires a valid Smartcar application with OAuth2 configured. Note: Smartcar is a connected vehicle API — you need to register your app at smartcar.com/dashboard and ensure the redirect URI matches your deployment URL.",
          hint: "The Smartcar Compatibility API (catalog data) works without any credentials — use the Smartcar Catalog button instead.",
        },
        { status: 400 }
      );
    }

    const connectUrl = getConnectUrl();

    return NextResponse.json({
      connectUrl,
      message: "Redirect user to connectUrl to authorize their vehicle with Smartcar Connect.",
      warning: "Smartcar Connect requires a valid OAuth2 application. If you get a 400 error, check that your client_id is correct and the redirect URI matches your Smartcar dashboard settings.",
    });
  } catch (error) {
    console.error("Smartcar auth error:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate Smartcar Connect",
        details: String(error),
        hint: "If you see 'Invalid parameter client_id', your Smartcar credentials may not be properly configured. Check your Smartcar dashboard at smartcar.com/dashboard.",
      },
      { status: 500 }
    );
  }
}
