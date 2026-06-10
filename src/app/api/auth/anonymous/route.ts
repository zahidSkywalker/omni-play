// ─── Anonymous/Username Auth ─────────────────────────────────
// Real username-based authentication. Creates a session and
// sets an httpOnly secure cookie (instead of returning token for localStorage).

import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString, getClientIp, rateLimit, validateCsrf } from "@/lib/security";
import { createSession, formatUser, getSessionCookieOptions, COOKIE_NAME } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    // CSRF validation
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Rate limiting (10 attempts per minute per IP)
    const ip = getClientIp(request);
    const rateLimitError = rateLimit(`auth:anon:${ip}`, 10, 60_000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const { username } = body;

    // Validate username
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const sanitized = sanitizeString(username, 30).trim();

    if (sanitized.length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
    }

    if (sanitized.length > 30) {
      return NextResponse.json({ error: "Username must be 30 characters or fewer" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    // Disallow reserved prefixes
    const lower = sanitized.toLowerCase();
    if (["admin", "system", "root", "moderator"].some((r) => lower === r || lower.startsWith(`${r}_`))) {
      return NextResponse.json({ error: "This username is reserved" }, { status: 400 });
    }

    let user: any;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { User } = await import("@/lib/models/User");
      await connectDB();

      // Check if username is taken
      const existing = await (User as any).findOne({ username: sanitized }).lean();
      if (existing) {
        return NextResponse.json({ error: "This username is already taken" }, { status: 409 });
      }

      user = await (User as any).create({
        provider: "anonymous",
        providerId: `anon_${sanitized}`,
        name: sanitized,
        username: sanitized,
        stats: { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
        badges: [],
        bookmarks: [],
      });
    } else {
      // ── JSON fallback ──────────────────────────────────────
      const existing = await jsonDB.getUserByUsername(sanitized);
      if (existing) {
        return NextResponse.json({ error: "This username is already taken" }, { status: 409 });
      }

      user = await jsonDB.createUser({
        provider: "anonymous",
        providerId: `anon_${sanitized}`,
        name: sanitized,
        username: sanitized,
        stats: { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
        badges: [],
        bookmarks: [],
        createdAt: new Date().toISOString(),
      });
    }

    // Create session and set httpOnly cookie
    const sessionToken = await createSession(user._id);

    const response = NextResponse.json({
      user: formatUser(user),
      // No sessionToken in response — cookie is set automatically
    });

    response.cookies.set(COOKIE_NAME, sessionToken, getSessionCookieOptions());

    return response;
  } catch (error) {
    console.error("Error in anonymous auth:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
