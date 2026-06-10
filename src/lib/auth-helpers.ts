// ─── Learn Tech with Zahid — Shared Auth Helpers ─────────────
// Centralized auth utilities used by all auth API routes.
// Eliminates code duplication and ensures consistent behavior.

import crypto from "crypto";
import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString } from "@/lib/security";

export const SESSION_DURATION_DAYS = 7;
export const COOKIE_NAME = "ltwz_session";

// ─── Extract Session Token from Request ──────────────────────
// Reads the session token from httpOnly cookie (preferred),
// or Bearer header (backward compatible fallback).
// Returns null if no token found.

export function extractSessionToken(request: Request): string | null {
  // Priority 1: httpOnly cookie
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (match) return match[1].trim();
  }

  // Priority 2: Bearer header (backward compat)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

// ─── Authenticate Request & Return User ───────────────────────
// Convenience function: extracts token, validates session,
// and returns the user. Returns null response on failure.
// Usage: const authed = await authenticateRequest(request); if (!authed) return authed.errorResponse;

export type AuthResult =
  | { ok: true; userId: string; token: string }
  | { ok: false; response: NextResponse };

export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const token = extractSessionToken(request);

  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }

  const session = await validateSession(token);
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: "Session expired or invalid" }, { status: 401 }) };
  }

  return { ok: true, userId: session.userId, token };
}

// ─── Session Token Generation ────────────────────────────────
// Cryptographically strong 256-bit random token

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── OAuth State Parameter ───────────────────────────────────
// CSRF protection for OAuth flows — stored temporarily in a cookie
// and verified on callback.

export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString("hex");
}

// ─── Session CRUD ─────────────────────────────────────────────

export async function createSession(userId: string | object): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  if (hasMongoDB) {
    const { connectDB } = await import("@/lib/mongodb");
    const { Session } = await import("@/lib/models/Session");
    await connectDB();
    await (Session as any).create({
      userId,
      token,
      expiresAt,
    });
  } else {
    await jsonDB.createSession({
      userId: typeof userId === "string" ? userId : (userId as any).toString(),
      token,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  return token;
}

export async function validateSession(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
  if (hasMongoDB) {
    const { connectDB } = await import("@/lib/mongodb");
    const { Session } = await import("@/lib/models/Session");
    await connectDB();
    const session = await (Session as any).findOne({
      token,
      expiresAt: { $gt: new Date() },
    }).lean();
    if (!session) return null;
    return { userId: session.userId.toString(), expiresAt: session.expiresAt };
  }
  // JSON fallback
  await jsonDB.cleanExpiredSessions();
  const session = await jsonDB.getSessionByToken(token);
  if (!session) return null;
  const expiresAt = new Date(session.expiresAt);
  if (expiresAt <= new Date()) return null;
  return { userId: session.userId, expiresAt };
}

export async function deleteSession(token: string): Promise<void> {
  if (hasMongoDB) {
    const { connectDB } = await import("@/lib/mongodb");
    const { Session } = await import("@/lib/models/Session");
    await connectDB();
    await (Session as any).deleteOne({ token });
  } else {
    await jsonDB.deleteSession(token);
  }
}

// ─── User Lookup ─────────────────────────────────────────────

export async function getUserById(userId: string): Promise<any | null> {
  if (hasMongoDB) {
    const { connectDB } = await import("@/lib/mongodb");
    const { User } = await import("@/lib/models/User");
    await connectDB();
    return await (User as any).findById(userId).lean();
  }
  return await jsonDB.getUserById(userId);
}

// ─── User Creation / Find-or-Create ───────────────────────────

export async function findOrCreateOAuthUser(params: {
  provider: "google" | "discord";
  providerId: string;
  name: string;
  email?: string;
  avatar?: string;
}): Promise<any> {
  const { provider, providerId, name, email, avatar } = params;
  const prefix = provider === "google" ? "g_" : "d_";
  const baseUsername = `${prefix}${sanitizeString(name, 20).toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  if (hasMongoDB) {
    const { connectDB } = await import("@/lib/mongodb");
    const { User } = await import("@/lib/models/User");
    await connectDB();

    // Check for existing user by provider+providerId
    let user = await (User as any).findOne({ provider, providerId }).lean();

    if (!user) {
      // Also check by email (for account linking)
      if (email) {
        user = await (User as any).findOne({ email }).lean();
        if (user) {
          // Link the OAuth provider to existing account
          await (User as any).updateOne(
            { _id: user._id },
            { $set: { provider, providerId, avatar: avatar || user.avatar } }
          );
          user = await (User as any).findById(user._id).lean();
        }
      }
    }

    if (!user) {
      // Generate a unique username
      let username = baseUsername.slice(0, 30);
      let exists = true;
      let attempts = 0;
      while (exists && attempts < 20) {
        if (attempts > 0) username = `${baseUsername.slice(0, 26)}${attempts}`;
        exists = await (User as any).findOne({ username }).lean();
        attempts++;
      }

      user = await (User as any).create({
        provider,
        providerId,
        name: name.slice(0, 100),
        email: email || undefined,
        avatar: avatar || undefined,
        username,
        stats: { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
        badges: [],
        bookmarks: [],
      });
    }

    return user;
  }

  // ── JSON fallback ────────────────────────────────────────
  let user = await jsonDB.getUserByProvider(provider, providerId);

  if (!user) {
    let username = baseUsername.slice(0, 30);
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 20) {
      if (attempts > 0) username = `${baseUsername.slice(0, 26)}${attempts}`;
      const found = await jsonDB.getUserByUsername(username);
      exists = !!found;
      attempts++;
    }

    user = await jsonDB.createUser({
      provider,
      providerId,
      name: name.slice(0, 100),
      email: email || undefined,
      avatar: avatar || undefined,
      username,
      stats: { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
      badges: [],
      bookmarks: [],
      createdAt: new Date().toISOString(),
    });
  }

  return user;
}

// ─── Session Rotation ─────────────────────────────────────────
// Validates the old session, creates a new one, deletes the old one.
// Returns the new session token, or null if the old session is invalid.
// Useful for post-login rotation and periodic security refreshes.

export async function rotateSession(oldToken: string): Promise<string | null> {
  const session = await validateSession(oldToken);
  if (!session) return null;

  // Create new session for the same user
  const newToken = await createSession(session.userId);

  // Delete old session
  await deleteSession(oldToken);

  return newToken;
}

// ─── User Formatting ─────────────────────────────────────────
// Consistent user object for API responses.

export function formatUser(user: any) {
  return {
    _id: user._id?.toString?.() || user._id,
    provider: user.provider,
    providerId: user.providerId,
    name: user.name,
    email: user.email || undefined,
    avatar: user.avatar || undefined,
    username: user.username,
    stats: user.stats || { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
    badges: user.badges || [],
    bookmarks: user.bookmarks || [],
    createdAt: user.createdAt?.toISOString?.() || user.createdAt || new Date().toISOString(),
  };
}

// ─── Cookie Helpers ───────────────────────────────────────────

export function getSessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
} {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax", // Lax allows OAuth redirect callbacks to work
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  };
}

// ─── App URL Helper ───────────────────────────────────────────

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://learn-tech-with-zahid.vercel.app";
}

// ─── Token Exchange Helpers ───────────────────────────────────

export async function exchangeCodeForGoogleTokens(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return response.json();
}

export async function getGoogleUserInfo(idToken: string) {
  // Verify the ID token locally by fetching Google's public keys
  // Or simply decode and use the userinfo endpoint
  const response = await fetch("https://oauth2.googleapis.com/tokeninfo", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken }),
  });

  if (!response.ok) {
    throw new Error("Google userinfo fetch failed");
  }

  const data = await response.json();
  return {
    providerId: data.sub,
    name: data.name || "Google User",
    email: data.email || undefined,
    avatar: data.picture || undefined,
  };
}

export async function exchangeCodeForDiscordTokens(code: string, redirectUri: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Discord OAuth credentials not configured");
  }

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Discord token exchange failed: ${error}`);
  }

  return response.json();
}

export async function getDiscordUserInfo(accessToken: string) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Discord userinfo fetch failed");
  }

  const data = await response.json();
  const avatarUrl = data.avatar
    ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
    : undefined;
  return {
    providerId: data.id,
    name: data.username || "Discord User",
    email: data.email || undefined,
    avatar: avatarUrl,
  };
}
