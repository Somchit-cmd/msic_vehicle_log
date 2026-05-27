import { NextResponse } from "next/server";
import { checkCarAPIsStatus } from "@/lib/services/carapis-service";

// Check if CarAPIs is available (not rate-limited)
export async function GET() {
  try {
    const status = await checkCarAPIsStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      {
        available: false,
        message: `Failed to check CarAPIs status: ${error}`,
      },
      { status: 500 }
    );
  }
}
