// ─── Auth: Logout ──────────────────────────────────────────────
// Destroys the server-side session and clears the httpOnly cookie.
// Supports both cookie-based and Bearer header-based sessions.

import { NextResponse } from "next/server";
import { deleteSession, COOKIE_NAME } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    let token: string | null = null;

    // Try to read from cookie first
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      if (match) token = match[1].trim();
    }

    // Fallback: Bearer header
    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    // Delete server-side session if token exists
    if (token) {
      await deleteSession(token);
    }

    // Always clear the cookie (idempotent)
    const response = NextResponse.json({ success: true });

    // Clear session cookie
    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Delete immediately
    });

    return response;
  } catch (error) {
    console.error("Error in auth/logout:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
