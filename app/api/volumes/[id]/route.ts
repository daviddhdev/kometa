import { issues, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ErrorResponse, VolumeResponse } from "@/types";
import { eq } from "drizzle-orm";
import { rm } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<VolumeResponse | ErrorResponse>> {
  try {
    const volumeId = (await params).id;

    // Get the volume from the database
    const volume = await db.query.volumes.findFirst({
      where: eq(volumes.id, parseInt(volumeId)),
    });

    if (!volume) {
      return NextResponse.json({ error: "Volume not found" }, { status: 404 });
    }

    // Get all issues for this volume
    const volumeIssues = await db.query.issues.findMany({
      where: eq(issues.volume_id, parseInt(volumeId)),
      orderBy: (issues, { asc }) => [asc(issues.issue_number)],
    });

    return NextResponse.json({
      volume,
      issues: volumeIssues,
    });
  } catch (error) {
    console.error("Error fetching volume:", error);
    return NextResponse.json(
      { error: "Failed to fetch volume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean } | ErrorResponse>> {
  try {
    const volumeId = (await params).id;

    // Get the volume from the database
    const volume = await db.query.volumes.findFirst({
      where: eq(volumes.id, parseInt(volumeId)),
    });

    if (!volume) {
      return NextResponse.json({ error: "Volume not found" }, { status: 404 });
    }

    // Get all issues for this volume to get their file paths
    const volumeIssues = await db.query.issues.findMany({
      where: eq(issues.volume_id, parseInt(volumeId)),
    });

    // Delete all issues from the database
    await db.delete(issues).where(eq(issues.volume_id, parseInt(volumeId)));

    // Delete the volume from the database
    await db.delete(volumes).where(eq(volumes.id, parseInt(volumeId)));

    // Delete the volume directory and all its contents
    const isDevelopment = process.env.NODE_ENV === "development";
    const comicsDir = isDevelopment
      ? path.join(process.cwd(), "comics")
      : "/app/comics";
    const volumeDir = path.join(comicsDir, volumeId);

    try {
      await rm(volumeDir, { recursive: true, force: true });
    } catch (error) {
      console.error("Error deleting volume directory:", error);
      // Continue even if directory deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting volume:", error);
    return NextResponse.json(
      { error: "Failed to delete volume" },
      { status: 500 }
    );
  }
}
