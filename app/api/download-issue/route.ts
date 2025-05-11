import { issues } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ErrorResponse } from "@/types";
import { eq } from "drizzle-orm";
import { createReadStream } from "fs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request
): Promise<NextResponse<ReadableStream | ErrorResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const issueId = searchParams.get("issueId");

    if (!issueId) {
      return NextResponse.json(
        { error: "No issue ID provided" },
        { status: 400 }
      );
    }

    // Get the issue from the database
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, parseInt(issueId)),
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    if (!issue.file_path) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Create a readable stream from the file
    const fileStream = createReadStream(issue.file_path);

    // Get the filename from the path
    const filename = issue.title;

    // Return the file as a stream
    return new NextResponse(fileStream as any, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading issue:", error);
    return NextResponse.json(
      { error: "Failed to download issue" },
      { status: 500 }
    );
  }
}
