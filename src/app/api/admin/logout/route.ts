import { NextResponse } from "next/server";

/**
 * POST /api/admin/logout
 *
 * Clears the httpOnly admin cookie.
 */
export async function POST() {
  const response = NextResponse.json({ loggedOut: true }, { status: 200 });
  response.cookies.set("ltwz_admin_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Delete cookie
  });
  return response;
}
