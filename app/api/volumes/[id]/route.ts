import { issues, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
