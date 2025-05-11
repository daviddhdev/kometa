import { issues } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isRead } = await request.json();
    const issueId = parseInt(id);

    await db
      .update(issues)
      .set({ is_read: isRead })
      .where(eq(issues.id, issueId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating issue read status:", error);
    return NextResponse.json(
      { error: "Failed to update issue read status" },
      { status: 500 }
    );
  }
}
