import { issues, reading_progress, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get total volumes count
    const totalVolumes = await db
      .select({ count: sql<number>`count(*)` })
      .from(volumes);

    // Get total issues count
    const totalIssues = await db
      .select({ count: sql<number>`count(*)` })
      .from(issues);

    // Get read issues count
    const readIssues = await db
      .select({ count: sql<number>`count(*)` })
      .from(issues)
      .where(eq(issues.is_read, true));

    // Get total pages read
    const totalPagesRead = await db
      .select({ total: sql<number>`sum(${reading_progress.current_page})` })
      .from(reading_progress)
      .where(eq(reading_progress.is_completed, true));

    // Get reading progress for all issues
    const readingProgress = await db
      .select({
        total: sql<number>`sum(${reading_progress.total_pages})`,
        current: sql<number>`sum(${reading_progress.current_page})`,
      })
      .from(reading_progress);

    // Get favorite volumes count
    const favoriteVolumes = await db
      .select({ count: sql<number>`count(*)` })
      .from(volumes)
      .where(eq(volumes.is_favorite, true));

    // Get recent reading activity (last 5 completed issues)
    const recentActivity = await db
      .select({
        issueId: issues.id,
        issueNumber: issues.issue_number,
        title: issues.title,
        volumeName: volumes.name,
        volumeId: volumes.id,
        completedAt: reading_progress.last_read_at,
      })
      .from(reading_progress)
      .innerJoin(issues, eq(reading_progress.issue_id, issues.id))
      .innerJoin(volumes, eq(issues.volume_id, volumes.id))
      .where(eq(reading_progress.is_completed, true))
      .orderBy(desc(reading_progress.last_read_at))
      .limit(5);

    // Get publisher statistics
    const publisherStats = await db
      .select({
        publisher: volumes.publisher,
        count: sql<number>`count(*)`,
      })
      .from(volumes)
      .where(sql`${volumes.publisher} is not null`)
      .groupBy(volumes.publisher)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    return NextResponse.json({
      totalVolumes: totalVolumes[0].count || 0,
      totalIssues: totalIssues[0].count || 0,
      readIssues: readIssues[0].count || 0,
      totalPagesRead: totalPagesRead[0].total || 0,
      favoriteVolumes: favoriteVolumes[0].count || 0,
      readingProgress: {
        total: readingProgress[0].total || 0,
        current: readingProgress[0].current || 0,
      },
      recentActivity,
      publisherStats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
