import { volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { ErrorResponse } from "@/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<
  NextResponse<{ success: boolean; isFavorite: boolean } | ErrorResponse>
> {
  try {
    const volumeId = (await params).id;

    // Get the volume from the database
    const volume = await db.query.volumes.findFirst({
      where: eq(volumes.id, parseInt(volumeId)),
    });

    if (!volume) {
      return NextResponse.json({ error: "Volume not found" }, { status: 404 });
    }

    // Toggle the favorite status
    const newFavoriteStatus = !volume.is_favorite;
    await db
      .update(volumes)
      .set({ is_favorite: newFavoriteStatus })
      .where(eq(volumes.id, parseInt(volumeId)));

    return NextResponse.json({
      success: true,
      isFavorite: newFavoriteStatus,
    });
  } catch (error) {
    console.error("Error toggling favorite status:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite status" },
      { status: 500 }
    );
  }
}
