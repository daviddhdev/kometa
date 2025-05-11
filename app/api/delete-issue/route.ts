import { issues } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const issueId = searchParams.get("issueId");

    if (!issueId) {
      return NextResponse.json(
        { error: "No issue ID provided" },
        { status: 400 }
      );
    }

    // Get the issue from the database first to get the file path
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, parseInt(issueId)),
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Delete the file if it exists
    if (issue.file_path) {
      try {
        await unlink(issue.file_path);
      } catch (error) {
        console.error("Error deleting file:", error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await db.delete(issues).where(eq(issues.id, parseInt(issueId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}
