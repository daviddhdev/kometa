import { issues } from "@/drizzle/schema";
import { db } from "@/lib/db";
import AdmZip from "adm-zip";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id, filename } = await params;
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
      const entry = zip.getEntry(filename);

      if (!entry) {
        return NextResponse.json(
          { error: "Page not found in comic file" },
          { status: 404 }
        );
      }

      const fileBuffer = entry.getData();
      const contentType = getContentType(filename);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch (error) {
      console.error("Error reading file from CBZ:", error);
      return NextResponse.json(
        { error: "Failed to read file from comic" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error serving comic page:", error);
    return NextResponse.json(
      { error: "Failed to serve comic page" },
      { status: 500 }
    );
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
