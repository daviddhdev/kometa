import { issues } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { issueId, issueNumber } = await request.json();

    if (!issueId || !issueNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the issue exists
    const existingIssue = await db.query.issues.findFirst({
      where: eq(issues.id, issueId),
    });

    if (!existingIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    if (!existingIssue.volume_id) {
      return NextResponse.json(
        { error: "Issue has no associated volume" },
        { status: 400 }
      );
    }

    // Check if the new issue number is already taken
    const conflictingIssue = await db.query.issues.findFirst({
      where: and(
        eq(issues.volume_id, existingIssue.volume_id),
        eq(issues.issue_number, issueNumber)
      ),
    });

    if (conflictingIssue && conflictingIssue.id !== issueId) {
      return NextResponse.json(
        { error: "Issue number already exists for this volume" },
        { status: 409 }
      );
    }

    // Update the issue number
    await db
      .update(issues)
      .set({ issue_number: issueNumber })
      .where(eq(issues.id, issueId));

    // Revalidate the volume page
    revalidatePath(`/comics/${existingIssue.volume_id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}
