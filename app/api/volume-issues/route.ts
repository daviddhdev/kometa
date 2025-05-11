import { issues } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const volumeId = searchParams.get("volumeId");

    if (!volumeId) {
      return NextResponse.json(
        { error: "No volume ID provided" },
        { status: 400 }
      );
    }

    // Get all issues for this volume
    const volumeIssues = await db.query.issues.findMany({
      where: eq(issues.volume_id, parseInt(volumeId)),
      orderBy: (issues, { asc }) => [asc(issues.issue_number)],
    });

    return NextResponse.json(volumeIssues);
  } catch (error) {
    console.error("Error fetching volume issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch volume issues" },
      { status: 500 }
    );
  }
}
