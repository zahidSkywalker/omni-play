import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * GET /api/auth/admin-status
 *
 * Checks if the admin httpOnly cookie is present and valid.
 * Used by the admin page to determine auth state on load
 * without exposing the token to client-side JavaScript.
 */
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    let adminCookie: string | null = null;

    if (cookieHeader) {
      const match = cookieHeader.match(/ltwz_admin_auth=([^;]+)/);
      if (match) adminCookie = match[1].trim();
    }

    if (!adminCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Timing-safe comparison
    const a = Buffer.from(adminCookie, "utf-8");
    const b = Buffer.from(adminToken, "utf-8");
    if (a.length !== b.length) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const valid = timingSafeEqual(a, b);
    if (!valid) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
