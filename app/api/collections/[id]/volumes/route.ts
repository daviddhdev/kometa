import { collection_volumes, volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collectionId = parseInt(id);
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    const collectionVolumes = await db
      .select({
        volume: volumes,
      })
      .from(collection_volumes)
      .innerJoin(volumes, eq(collection_volumes.volume_id, volumes.id))
      .where(eq(collection_volumes.collection_id, collectionId));

    return NextResponse.json(collectionVolumes.map((cv) => cv.volume));
  } catch (error) {
    console.error("Error fetching collection volumes:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection volumes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collectionId = parseInt(id);
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { volumeId } = body;

    if (!volumeId) {
      return NextResponse.json(
        { error: "Volume ID is required" },
        { status: 400 }
      );
    }

    const [newCollectionVolume] = await db
      .insert(collection_volumes)
      .values({
        collection_id: collectionId,
        volume_id: volumeId,
      })
      .returning();

    return NextResponse.json(newCollectionVolume);
  } catch (error) {
    console.error("Error adding volume to collection:", error);
    return NextResponse.json(
      { error: "Failed to add volume to collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collectionId = parseInt(id);
    if (isNaN(collectionId)) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const volumeId = searchParams.get("volumeId");

    if (!volumeId) {
      return NextResponse.json(
        { error: "Volume ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(collection_volumes)
      .where(
        eq(collection_volumes.collection_id, collectionId) &&
          eq(collection_volumes.volume_id, parseInt(volumeId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing volume from collection:", error);
    return NextResponse.json(
      { error: "Failed to remove volume from collection" },
      { status: 500 }
    );
  }
}
