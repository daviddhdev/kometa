import { db } from "@/drizzle/db";
import { push_subscriptions, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// Helper to extract user from auth_token cookie
async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    console.log("No auth token found in cookies");
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    console.log("JWT payload:", payload);

    if (!payload.userId) {
      console.log("No user ID in JWT payload");
      return null;
    }

    // Verify user exists in database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user.length) {
      console.log("User not found in database:", payload.userId);
      return null;
    }

    return { id: user[0].id };
  } catch (e) {
    console.error("JWT verification error:", e);
    return null;
  }
}

// POST: Save a new push subscription
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    console.log("Unauthorized: No user found from request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { endpoint, keys } = await req.json();
  console.log("Received subscription data:", {
    userId: user.id,
    endpoint,
    hasKeys: !!keys,
    p256dh: keys?.p256dh ? "present" : "missing",
    auth: keys?.auth ? "present" : "missing",
  });

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    console.log("Invalid payload:", { endpoint, keys });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    // Upsert subscription for this endpoint
    await db
      .insert(push_subscriptions)
      .values({
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      })
      .onConflictDoUpdate({
        target: [push_subscriptions.user_id, push_subscriptions.endpoint],
        set: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          updated_at: new Date(),
        },
      });

    console.log("Successfully stored subscription for user:", user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error storing subscription:", error);
    return NextResponse.json(
      { error: "Failed to store subscription" },
      { status: 500 }
    );
  }
}

// GET: List all subscriptions for the user
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await db
    .select()
    .from(push_subscriptions)
    .where(eq(push_subscriptions.user_id, user.id));

  return NextResponse.json(subs);
}

// DELETE: Remove a subscription for the user
export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await req.json();
  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
  }

  await db
    .delete(push_subscriptions)
    .where(
      and(
        eq(push_subscriptions.user_id, user.id),
        eq(push_subscriptions.endpoint, endpoint)
      )
    );

  return NextResponse.json({ success: true });
}
