import { NotificationService } from "@/app/lib/notifications";
import { upcoming_releases, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const COMICVINE_API_KEY = process.env.COMIC_VINE_API_KEY;
const COMICVINE_BASE_URL = "https://comicvine.gamespot.com/api";

export async function POST() {
  try {
    if (!COMICVINE_API_KEY) {
      return NextResponse.json(
        { error: "ComicVine API key not configured" },
        { status: 500 }
      );
    }

    // Get all volumes from the user's library
    const userVolumes = await db.select().from(volumes);

    if (userVolumes.length === 0) {
      return NextResponse.json({ message: "No volumes in library" });
    }

    // Get current date and date 30 days from now
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Format dates for ComicVine API
    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    // Create a map of volume IDs to their ComicVine IDs
    const volumeIdMap = new Map(
      userVolumes.map((volume) => [volume.id, volume.id])
    );

    // Fetch upcoming releases for all volumes in the user's library
    const response = await fetch(
      `${COMICVINE_BASE_URL}/issues/?api_key=${COMICVINE_API_KEY}&format=json&field_list=id,issue_number,name,store_date,volume,image&filter=store_date:${formatDate(
        today
      )}|${formatDate(thirtyDaysFromNow)}&sort=store_date:asc&limit=100`,
      {
        headers: {
          "User-Agent": "ComicReader/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from ComicVine API");
    }

    const data = await response.json();

    // Log the first result to debug the response structure
    if (data.results && data.results.length > 0) {
      console.log(
        "Sample ComicVine API response:",
        JSON.stringify(data.results[0], null, 2)
      );
    }

    // Filter releases to only include those from volumes in the user's library
    const filteredResults = data.results.filter((release: any) =>
      volumeIdMap.has(release.volume.id)
    );

    // Get existing comicvine_issue_ids to avoid duplicates
    const existingIds = await db
      .select({ comicvine_issue_id: upcoming_releases.comicvine_issue_id })
      .from(upcoming_releases)
      .then((results) => new Set(results.map((r) => r.comicvine_issue_id)));

    // Filter out releases that already exist
    const newReleases = filteredResults.filter(
      (release: any) => !existingIds.has(release.id)
    );

    // Insert new upcoming releases
    const releasesToInsert = newReleases.map((release: any) => ({
      comicvine_issue_id: release.id,
      volume_id: release.volume.id,
      issue_number: release.issue_number,
      name: release.name || null,
      store_date: new Date(release.store_date),
      last_updated: new Date(),
      cover_image:
        release.image?.thumb_url || release.image?.original_url || null,
    }));

    if (releasesToInsert.length > 0) {
      await db.insert(upcoming_releases).values(releasesToInsert);

      // Send notifications for new releases
      for (const release of newReleases) {
        await NotificationService.sendNotification(
          "New Comic Release",
          `${release.volume.name} #${release.issue_number} is now available!`
        );
      }
    }

    return NextResponse.json({
      message: "Upcoming releases updated successfully",
      count: releasesToInsert.length,
    });
  } catch (error) {
    console.error("Error updating upcoming releases:", error);
    return NextResponse.json(
      { error: "Failed to update upcoming releases" },
      { status: 500 }
    );
  }
}
