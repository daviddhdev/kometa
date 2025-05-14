import { upcoming_releases, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const COMICVINE_API_KEY = process.env.COMIC_VINE_API_KEY;

export async function GET() {
  try {
    // Get current date and date 30 days from now
    const todayMinusOneWeek = new Date();
    todayMinusOneWeek.setDate(todayMinusOneWeek.getDate() - 7);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(todayMinusOneWeek.getDate() + 30);

    // Check if we need to refresh the data (if last_updated is more than a week old)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const needsRefresh = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(upcoming_releases)
      .where(
        and(
          gt(upcoming_releases.store_date, todayMinusOneWeek),
          lt(upcoming_releases.store_date, thirtyDaysFromNow),
          lt(upcoming_releases.last_updated, oneWeekAgo)
        )
      )
      .then((result) => result[0].count > 0);

    // If we need to refresh, call the update endpoint
    if (needsRefresh && COMICVINE_API_KEY) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/upcoming-releases/update`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        console.error("Failed to update upcoming releases");
      }
    }

    // Get upcoming releases from the database with volume information
    const releases = await db
      .select({
        id: upcoming_releases.id,
        comicvine_issue_id: upcoming_releases.comicvine_issue_id,
        volume_id: upcoming_releases.volume_id,
        issue_number: upcoming_releases.issue_number,
        name: upcoming_releases.name,
        store_date: upcoming_releases.store_date,
        last_updated: upcoming_releases.last_updated,
        cover_image: upcoming_releases.cover_image,
        volume: {
          id: volumes.id,
          name: volumes.name,
        },
      })
      .from(upcoming_releases)
      .leftJoin(volumes, eq(upcoming_releases.volume_id, volumes.id))
      .where(
        and(
          gt(upcoming_releases.store_date, todayMinusOneWeek),
          lt(upcoming_releases.store_date, thirtyDaysFromNow)
        )
      )
      .orderBy(upcoming_releases.store_date);

    // Format the dates to match the expected format
    const formattedReleases = releases.map((release) => ({
      ...release,
      store_date: release.store_date.toISOString().split("T")[0],
    }));

    return NextResponse.json({ results: formattedReleases });
  } catch (error) {
    console.error("Error fetching upcoming releases:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming releases" },
      { status: 500 }
    );
  }
}
