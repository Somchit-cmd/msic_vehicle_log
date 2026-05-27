import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/services/smartcar-service";

// GET /api/cars/smartcar/callback - OAuth callback from Smartcar Connect
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");

    if (error) {
      const errorDesc = request.nextUrl.searchParams.get("error_description") || error;
      console.error("[Smartcar] OAuth error:", error, errorDesc);
      // Redirect to home with error
      return NextResponse.redirect(
        new URL(`/?smartcar_error=${encodeURIComponent(errorDesc)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/?smartcar_error=No authorization code received", request.url)
      );
    }

    console.log("[Smartcar] Exchanging authorization code for access token...");

    // Exchange code for access token
    const tokens = await exchangeCode(code);

    console.log("[Smartcar] Successfully obtained access token!");

    // Store tokens in a cookie for security (httpOnly, secure)
    const response = NextResponse.redirect(
      new URL("/?smartcar_connected=true", request.url)
    );

    response.cookies.set("smartcar_access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.floor((tokens.expiration - Date.now()) / 1000),
    });

    response.cookies.set("smartcar_refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error("[Smartcar] Callback error:", error);
    return NextResponse.redirect(
      new URL(`/?smartcar_error=${encodeURIComponent(String(error))}`, request.url)
    );
  }
}
