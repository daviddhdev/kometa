import { issues, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all volumes
    const allVolumes = await db.select().from(volumes);

    // Get all issues
    const allIssues = await db.select().from(issues);

    // Create a map of volume IDs to their issues
    const volumeIssuesMap = allIssues.reduce((acc, issue) => {
      if (issue.volume_id) {
        if (!acc[issue.volume_id]) {
          acc[issue.volume_id] = [];
        }
        acc[issue.volume_id].push(issue);
      }
      return acc;
    }, {} as Record<number, typeof allIssues>);

    // Add is_fully_read property to each volume
    const volumesWithReadStatus = allVolumes.map((volume) => ({
      ...volume,
      is_fully_read:
        volumeIssuesMap[volume.id]?.length > 0 &&
        volumeIssuesMap[volume.id].every((issue) => issue.is_read),
    }));

    return NextResponse.json(volumesWithReadStatus);
  } catch (error) {
    console.error("Error fetching volumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch volumes" },
      { status: 500 }
    );
  }
}
