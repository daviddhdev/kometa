import { issues, upcoming_releases, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ErrorResponse, Issue } from "@/types";
import { eq } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

const COMICVINE_API_KEY = process.env.COMIC_VINE_API_KEY;
const COMICVINE_BASE_URL = "https://comicvine.gamespot.com/api";

export async function POST(
  req: Request
): Promise<NextResponse<{ issue: Issue } | ErrorResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const volumeId = formData.get("volumeId") as string;
    const issueNumber = formData.get("issueNumber") as string;
    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const metadata = formData.get("metadata") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine the comics directory based on environment
    const isDevelopment = process.env.NODE_ENV === "development";
    const comicsDir = isDevelopment
      ? path.join(process.cwd(), "comics")
      : "/app/comics";

    const volumeDir = path.join(comicsDir, volumeId);

    // Create the directory if it doesn't exist
    try {
      await mkdir(volumeDir, { recursive: true });
    } catch (error) {
      console.error("Error creating directory:", error);
      return NextResponse.json(
        { error: "Failed to create directory" },
        { status: 500 }
      );
    }

    // Generate a safe filename
    const fileExtension = path.extname(file.name);
    const safeFilename = `issue-${issueNumber}${fileExtension}`;
    const filePath = path.join(volumeDir, safeFilename);

    // Convert the file to a buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Parse metadata
    let parsedMetadata: any = null;
    try {
      parsedMetadata = metadata ? JSON.parse(metadata) : null;
    } catch (e) {
      parsedMetadata = null;
    }

    // Upsert volume in the database
    if (parsedMetadata?.volume) {
      const vol = parsedMetadata.volume;
      const existing = await db.query.volumes.findFirst({
        where: (v, { eq }) => eq(v.id, Number(vol.id)),
      });

      if (!existing) {
        await db.insert(volumes).values({
          id: Number(vol.id),
          name: vol.name,
          publisher: vol.publisher,
          start_year: vol.start_year,
          count_of_issues: vol.count_of_issues,
          description: vol.description,
          image: vol.image,
          site_detail_url: vol.site_detail_url,
          aliases: vol.aliases,
          deck: vol.deck,
          date_added: vol.date_added,
          date_last_updated: vol.date_last_updated,
        });

        // If this is a new volume, update upcoming releases
        if (COMICVINE_API_KEY) {
          // Get current date and date 30 days from now
          const today = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(today.getDate() + 30);

          // Format dates for ComicVine API
          const formatDate = (date: Date) => {
            return date.toISOString().split("T")[0];
          };

          // Fetch upcoming releases for the new volume
          const response = await fetch(
            `${COMICVINE_BASE_URL}/issues/?api_key=${COMICVINE_API_KEY}&format=json&field_list=id,issue_number,name,store_date,volume&filter=store_date:${formatDate(
              today
            )}|${formatDate(thirtyDaysFromNow)}&sort=store_date:asc&limit=100`,
            {
              headers: {
                "User-Agent": "ComicReader/1.0",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();

            // Filter releases to only include those from the new volume
            const filteredResults = data.results.filter(
              (release: any) => release.volume.id === Number(vol.id)
            );

            // Insert new upcoming releases
            const releasesToInsert = filteredResults.map((release: any) => ({
              comicvine_issue_id: release.id,
              volume_id: release.volume.id,
              issue_number: release.issue_number,
              name: release.name,
              store_date: new Date(release.store_date),
              last_updated: new Date(),
            }));

            if (releasesToInsert.length > 0) {
              await db.insert(upcoming_releases).values(releasesToInsert);
            }
          }
        }
      } else {
        // Optionally update missing fields
        await db
          .update(volumes)
          .set({
            name: existing.name || vol.name,
            publisher: existing.publisher || vol.publisher,
            start_year: existing.start_year || vol.start_year,
            count_of_issues: existing.count_of_issues || vol.count_of_issues,
            description: existing.description || vol.description,
            image: existing.image || vol.image,
            site_detail_url: existing.site_detail_url || vol.site_detail_url,
            aliases: existing.aliases || vol.aliases,
            deck: existing.deck || vol.deck,
            date_added: existing.date_added || vol.date_added,
            date_last_updated:
              existing.date_last_updated || vol.date_last_updated,
          })
          .where(eq(volumes.id, Number(vol.id)));
      }
    }

    // Insert issue in the database
    const [inserted] = await db
      .insert(issues)
      .values({
        volume_id: Number(volumeId),
        issue_number: Number(issueNumber),
        title,
        summary,
        file_path: filePath,
        uploaded_at: new Date(),
      })
      .returning();

    // Save metadata as file (optional, for legacy or backup)
    const metadataPath = path.join(volumeDir, `issue-${issueNumber}.json`);
    await writeFile(
      metadataPath,
      JSON.stringify({
        title,
        summary,
        metadata: parsedMetadata,
        uploadedAt: new Date().toISOString(),
      })
    );

    return NextResponse.json({ issue: inserted });
  } catch (error) {
    console.error("Error uploading issue:", error);
    return NextResponse.json(
      { error: "Failed to upload issue" },
      { status: 500 }
    );
  }
}
