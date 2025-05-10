import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request) {
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

    // Save metadata
    const metadataPath = path.join(volumeDir, `issue-${issueNumber}.json`);
    await writeFile(
      metadataPath,
      JSON.stringify({
        title,
        summary,
        metadata: metadata ? JSON.parse(metadata) : null,
        uploadedAt: new Date().toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      path: filePath,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
