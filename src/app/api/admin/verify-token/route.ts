import { NextResponse } from "next/server";
import { validateCsrf } from "@/lib/security";

const ADMIN_COOKIE_NAME = "ltwz_admin_auth";

/**
 * POST /api/admin/verify-token
 *
 * Allows the client-side admin page to verify a token without
 * the token being hardcoded in client JS. The token is only
 * checked against the server-side ADMIN_TOKEN env var.
 */
export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    const adminToken = process.env.ADMIN_TOKEN;

    // If ADMIN_TOKEN env var is not set, deny all (fail-closed)
    if (!adminToken) {
      console.error("[AUTH] ADMIN_TOKEN environment variable is not set!");
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    // Time-constant comparison to prevent timing attacks
    const valid = timingSafeEqual(token, adminToken);

    const response = NextResponse.json({ valid }, { status: 200 });

    if (valid) {
      // Set httpOnly cookie so client doesn't need to store the token in localStorage
      response.cookies.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }

    return response;
  } catch {
    return NextResponse.json({ valid: false }, { status: 200 });
  }
}

/**
 * Simple timing-safe string comparison.
 * Prevents timing attacks where an attacker can determine the correct
 * token character by character based on response time.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do the comparison to avoid timing leak on length difference
    const maxLen = Math.max(a.length, b.length);
    let result = 0;
    for (let i = 0; i < maxLen; i++) {
      result |= (i < a.length ? a.charCodeAt(i) : 0) ^ (i < b.length ? b.charCodeAt(i) : 0);
    }
    return result === 0;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
