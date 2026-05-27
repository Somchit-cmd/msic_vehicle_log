import { NextRequest, NextResponse } from "next/server";
import {
  getConnectedVehicleIds,
  getFullVehicleData,
  refreshAccessToken,
} from "@/lib/services/smartcar-service";

// GET /api/cars/smartcar/vehicles - Get all connected vehicle data
export async function GET(request: NextRequest) {
  try {
    let accessToken = request.cookies.get("smartcar_access_token")?.value;
    const refreshToken = request.cookies.get("smartcar_refresh_token")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: "not_connected", message: "No Smartcar connection found. Connect your vehicle first." },
        { status: 401 }
      );
    }

    // Try to refresh if access token might be expired
    if (refreshToken && !accessToken) {
      try {
        console.log("[Smartcar] Refreshing access token...");
        const newTokens = await refreshAccessToken(refreshToken);
        accessToken = newTokens.accessToken;
      } catch {
        return NextResponse.json(
          { error: "token_expired", message: "Smartcar session expired. Please reconnect your vehicle." },
          { status: 401 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "not_connected", message: "No Smartcar access token available." },
        { status: 401 }
      );
    }

    // Get all connected vehicle IDs
    const vehicleIds = await getConnectedVehicleIds(accessToken);
    console.log(`[Smartcar] Found ${vehicleIds.length} connected vehicles`);

    // Get data for each vehicle
    const vehicles = [];
    for (const vehicleId of vehicleIds) {
      try {
        const data = await getFullVehicleData(vehicleId, accessToken);
        vehicles.push(data);
        console.log(`[Smartcar] Got data for ${data.make} ${data.model} (${data.year})`);
      } catch (err) {
        console.error(`[Smartcar] Failed to get data for vehicle ${vehicleId}:`, err);
        vehicles.push({
          id: vehicleId,
          error: "Failed to fetch vehicle data",
        });
      }
    }

    return NextResponse.json({
      connected: true,
      vehicleCount: vehicles.length,
      vehicles,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Smartcar] Vehicle data error:", error);
    return NextResponse.json(
      { error: "Failed to get vehicle data", details: String(error) },
      { status: 500 }
    );
  }
}
