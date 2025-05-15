import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
    };

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        password_hash: newPasswordHash,
        password_changed: true,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
