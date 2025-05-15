import { db } from "@/drizzle/db";
import { users } from "@/drizzle/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signToken(payload: any): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours
  };

  const encoder = new TextEncoder();
  const headerB64 = base64ToBase64Url(btoa(JSON.stringify(header)));
  const payloadB64 = base64ToBase64Url(btoa(JSON.stringify(tokenPayload)));
  const signatureInput = `${headerB64}.${payloadB64}`;

  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = base64ToBase64Url(
    btoa(String.fromCharCode(...new Uint8Array(signature)))
  );
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    await db
      .update(users)
      .set({ last_login: new Date() })
      .where(eq(users.id, user.id));

    // Create JWT token
    const token = await signToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.is_admin,
    });

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin,
        passwordChanged: user.password_changed,
      },
    });

    // Set cookie in response headers
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
