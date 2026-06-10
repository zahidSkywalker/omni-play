import { NextResponse } from "next/server";

/**
 * GET /api/admin/status
 *
 * Checks if the httpOnly admin cookie is valid.
 * Used by the admin page on mount to determine auth state.
 */
export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/ltwz_admin_auth=([^;]+)/);

  if (!match) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const token = decodeURIComponent(match[1]);
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const valid = timingSafeStringEqual(token, adminToken);
  return NextResponse.json({ authenticated: valid }, { status: 200 });
}

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
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
