import { issues, reading_progress } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ErrorResponse } from "@/types";
import { eq } from "drizzle-orm";
import { rm } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function DELETE(
  req: Request
): Promise<NextResponse<{ success: boolean } | ErrorResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const issueId = searchParams.get("issueId");

    if (!issueId) {
      return NextResponse.json(
        { error: "Issue ID is required" },
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

    // Delete reading progress records first
    await db
      .delete(reading_progress)
      .where(eq(reading_progress.issue_id, parseInt(issueId)));

    // Delete from database
    await db.delete(issues).where(eq(issues.id, parseInt(issueId)));

    // Delete the file if it exists
    if (issue.file_path) {
      const isDevelopment = process.env.NODE_ENV === "development";
      const comicsDir = isDevelopment
        ? path.join(process.cwd(), "comics")
        : "/app/comics";
      const issuePath = path.join(comicsDir, issue.file_path);

      try {
        await rm(issuePath, { force: true });
      } catch (error) {
        console.error("Error deleting issue file:", error);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}
