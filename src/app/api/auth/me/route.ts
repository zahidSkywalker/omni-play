// ─── Auth: Get Current User ───────────────────────────────────
// Validates the session token from httpOnly cookie (preferred)
// or Bearer header (backward compatible) and returns user data.

import { NextResponse } from "next/server";
import { validateSession, getUserById, formatUser, COOKIE_NAME } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    let token: string | null = null;

    // Priority 1: Read from httpOnly cookie (production, secure)
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      if (match) token = match[1].trim();
    }

    // Priority 2: Read from Bearer header (backward compatible)
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Validate session
    const session = await validateSession(token);
    if (!session) {
      return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
    }

    // Fetch user
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({ user: formatUser(user) });
  } catch (error) {
    console.error("Error in auth/me:", error);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
