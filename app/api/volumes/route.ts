import { volumes } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const allVolumes = await db.select().from(volumes);
  return NextResponse.json(allVolumes);
}
