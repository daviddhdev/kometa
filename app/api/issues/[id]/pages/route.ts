import { issues } from "@/drizzle/schema";
import { db } from "@/lib/db";
import AdmZip, { IZipEntry } from "adm-zip";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, parseInt(id)),
    });

    if (!issue || !issue.file_path) {
      return NextResponse.json(
        { error: "Issue not found or no file path" },
        { status: 404 }
      );
    }

    // Ensure the file path is relative to the project root
    const cbzPath = path.resolve(process.cwd(), issue.file_path);

    try {
      const zip = new AdmZip(cbzPath);
      const zipEntries = zip.getEntries();

      // Filter for image files and sort them
      const imageFiles = zipEntries
        .filter((entry: IZipEntry) =>
          /\.(jpg|jpeg|png|gif)$/i.test(entry.entryName)
        )
        .sort((a: IZipEntry, b: IZipEntry) => {
          const numA = parseInt(a.entryName.match(/\d+/)?.[0] || "0");
          const numB = parseInt(b.entryName.match(/\d+/)?.[0] || "0");
          return numA - numB;
        });

      // Create URLs for each page
      const pageUrls = imageFiles.map(
        (file: IZipEntry) =>
          `/api/issues/${id}/page/${encodeURIComponent(file.entryName)}`
      );

      return NextResponse.json(pageUrls);
    } catch (error) {
      console.error("Error reading CBZ file:", error);
      return NextResponse.json(
        { error: "Failed to read comic file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching comic pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch comic pages" },
      { status: 500 }
    );
  }
}
