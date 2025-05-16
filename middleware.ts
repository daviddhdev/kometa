import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Add paths that should be public
const publicPaths = ["/api/auth", "/login"];

function base64UrlToBase64(base64Url: string): string {
  return base64Url.replace(/-/g, "+").replace(/_/g, "/");
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    // Split the token into parts
    const [headerB64, payloadB64, signatureB64] = token.split(".");

    // Convert the secret to a Uint8Array
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Create the signature input
    const signatureInput = `${headerB64}.${payloadB64}`;

    // Convert base64url to base64 and then to Uint8Array
    const base64Signature = base64UrlToBase64(signatureB64);
    const signature = Uint8Array.from(atob(base64Signature), (c) =>
      c.charCodeAt(0)
    );

    // Verify the signature
    const isValid = await crypto.subtle.verify(
      "HMAC",
      secretKey,
      signature,
      encoder.encode(signatureInput)
    );

    if (!isValid) {
      return false;
    }

    // Verify expiration
    const payload = JSON.parse(atob(base64UrlToBase64(payloadB64)));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isValid = await verifyToken(token);
  if (!isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
