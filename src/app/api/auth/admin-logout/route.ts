import { NextResponse } from "next/server";

/**
 * POST /api/auth/admin-logout
 *
 * Clears the admin httpOnly cookie to log out the admin.
 * No request body needed — the cookie itself is cleared.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("ltwz_admin_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
