import { volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ErrorResponse, VolumeExistsResponse } from "@/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request
): Promise<NextResponse<VolumeExistsResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const volumeId = searchParams.get("volumeId");

    if (!volumeId) {
      return NextResponse.json(
        { error: "No volume ID provided" },
        { status: 400 }
      );
    }

    // Check if volume exists in database
    const volume = await db.query.volumes.findFirst({
      where: eq(volumes.id, parseInt(volumeId)),
    });

    return NextResponse.json({ exists: !!volume });
  } catch (error) {
    console.error("Error checking volume existence:", error);
    return NextResponse.json(
      { error: "Failed to check volume existence" },
      { status: 500 }
    );
  }
}
