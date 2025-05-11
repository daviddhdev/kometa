import { reading_progress } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const progress = await db.query.reading_progress.findFirst({
      where: eq(reading_progress.issue_id, parseInt(id)),
    });

    if (!progress) {
      return NextResponse.json(
        { current_page: 1, total_pages: 0, is_completed: false },
        { status: 200 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching reading progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading progress" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { currentPage, totalPages } = await request.json();

    const existingProgress = await db.query.reading_progress.findFirst({
      where: eq(reading_progress.issue_id, parseInt(id)),
    });

    if (existingProgress) {
      const updated = await db
        .update(reading_progress)
        .set({
          current_page: currentPage,
          total_pages: totalPages,
          is_completed: currentPage === totalPages,
          last_read_at: new Date(),
        })
        .where(eq(reading_progress.issue_id, parseInt(id)))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      const created = await db
        .insert(reading_progress)
        .values({
          issue_id: parseInt(id),
          current_page: currentPage,
          total_pages: totalPages,
          is_completed: currentPage === totalPages,
        })
        .returning();

      return NextResponse.json(created[0]);
    }
  } catch (error) {
    console.error("Error updating reading progress:", error);
    return NextResponse.json(
      { error: "Failed to update reading progress" },
      { status: 500 }
    );
  }
}
