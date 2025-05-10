import { issues, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import archiver from "archiver";
import { eq } from "drizzle-orm";
import { createReadStream, createWriteStream } from "fs";
import { mkdir, rm } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

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
    });

    if (volumeIssues.length === 0) {
      return NextResponse.json(
        { error: "No issues found for this volume" },
        { status: 404 }
      );
    }

    // Create a temporary directory for the zip file
    const tempDir = path.join(process.cwd(), "temp");
    await mkdir(tempDir, { recursive: true });
    const zipPath = path.join(
      tempDir,
      `${volume.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.zip`
    );

    // Create a write stream for the zip file
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add each issue to the zip file
    for (const issue of volumeIssues) {
      if (issue.file_path) {
        const issueStream = createReadStream(issue.file_path);
        const filename = path.basename(issue.file_path);
        archive.append(issueStream, { name: filename });
      }
    }

    // Finalize the archive
    await archive.finalize();

    // Create a read stream for the zip file
    const zipStream = createReadStream(zipPath);

    // Return the zip file as a stream
    const response = new NextResponse(zipStream as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${path.basename(
          zipPath
        )}"`,
      },
    });

    // Clean up the temporary file after sending
    response.headers.set("Connection", "close");
    response.headers.set("Transfer-Encoding", "chunked");

    // Clean up the temporary file after the response is sent
    output.on("finish", async () => {
      try {
        await rm(zipPath);
      } catch (error) {
        console.error("Error cleaning up temporary file:", error);
      }
    });

    return response;
  } catch (error) {
    console.error("Error downloading volume:", error);
    return NextResponse.json(
      { error: "Failed to download volume" },
      { status: 500 }
    );
  }
}
