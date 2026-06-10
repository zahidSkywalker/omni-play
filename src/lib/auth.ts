// ─── Learn Tech with Zahid — NextAuth.js v5 Configuration ─────
// Production-grade auth with Google, Discord, and Credentials (anonymous) providers.
// Uses MongoDB adapter when available, falls back to JWT-only sessions.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import crypto from "crypto";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString } from "@/lib/security";
import type { IUser } from "@/types";

// ─── NextAuth Secret ──────────────────────────────────────────
function getNextAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;
  const secret = crypto.randomBytes(32).toString("hex");
  console.warn(
    "[AUTH] NEXTAUTH_SECRET not set — sessions will not persist across cold starts."
  );
  return secret;
}

// ─── MongoDB Client for NextAuth Adapter ─────────────────────
let mongoClientPromise: Promise<any> | null = null;

async function getMongoClient() {
  if (!hasMongoDB) return null;
  if (mongoClientPromise) return mongoClientPromise;
  const { MongoClient } = await import("mongodb");
  const uri = process.env.MONGODB_URI!;
  mongoClientPromise = MongoClient.connect(uri);
  return mongoClientPromise;
}

// ─── Credentials Provider Authorize ───────────────────────────
async function credentialsAuthorize(credentials: Record<string, unknown>) {
  const username = credentials.username as string | undefined;

  if (!username || typeof username !== "string") {
    throw new Error("Username is required");
  }

  const sanitized = sanitizeString(username, 30).trim();

  if (sanitized.length < 2 || sanitized.length > 30) {
    throw new Error("Username must be between 2 and 30 characters");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    throw new Error("Username can only contain letters, numbers, hyphens, and underscores");
  }

  const lower = sanitized.toLowerCase();
  if (["admin", "system", "root", "moderator"].some((r) => lower === r || lower.startsWith(`${r}_`))) {
    throw new Error("This username is reserved");
  }

  if (hasMongoDB) {
    const { connectDB } = await import("@/lib/mongodb");
    const { User } = await import("@/lib/models/User");
    await connectDB();

    const existing = await (User as any).findOne({ username: sanitized }).lean();
    if (existing) {
      return {
        id: existing._id.toString(),
        name: existing.name,
        email: existing.email,
        image: existing.avatar,
        provider: existing.provider,
        providerId: existing.providerId,
        username: existing.username,
        stats: existing.stats,
        badges: existing.badges,
        bookmarks: existing.bookmarks,
      };
    }

    const user = await (User as any).create({
      provider: "anonymous",
      providerId: `anon_${sanitized}`,
      name: sanitized,
      username: sanitized,
      stats: { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
      badges: [],
      bookmarks: [],
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.avatar,
      provider: user.provider,
      providerId: user.providerId,
      username: user.username,
      stats: user.stats,
      badges: user.badges,
      bookmarks: user.bookmarks,
    };
  }

  // JSON fallback
  const existing = await jsonDB.getUserByUsername(sanitized);
  if (existing) {
    return {
      id: existing._id,
      name: existing.name,
      email: existing.email,
      image: existing.avatar,
      provider: existing.provider,
      providerId: existing.providerId,
      username: existing.username,
      stats: existing.stats,
      badges: existing.badges,
      bookmarks: existing.bookmarks,
    };
  }

  const newUser = await jsonDB.createUser({
    provider: "anonymous",
    providerId: `anon_${sanitized}`,
    name: sanitized,
    username: sanitized,
    stats: { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
    badges: [],
    bookmarks: [],
    createdAt: new Date().toISOString(),
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    image: newUser.avatar,
    provider: newUser.provider,
    providerId: newUser.providerId,
    username: newUser.username,
    stats: newUser.stats,
    badges: newUser.badges,
    bookmarks: newUser.bookmarks,
  };
}

// ─── OAuth Provider User Enrichment ───────────────────────────
async function enrichOAuthUser(profile: {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  provider: string;
}) {
  if (hasMongoDB) {
    const { connectDB } = await import("@/lib/mongodb");
    const { findOrCreateOAuthUser } = await import("@/lib/auth-helpers");
    await connectDB();

    const user = await findOrCreateOAuthUser({
      provider: profile.provider as "google" | "discord",
      providerId: profile.id,
      name: profile.name || "Unknown",
      email: profile.email,
      avatar: profile.image,
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.avatar,
      provider: user.provider,
      providerId: user.providerId,
      username: user.username,
      stats: user.stats,
      badges: user.badges,
      bookmarks: user.bookmarks,
    };
  }

  const existing = await jsonDB.getUserByProvider(profile.provider, profile.id);
  if (existing) {
    return {
      id: existing._id,
      name: existing.name,
      email: existing.email,
      image: existing.avatar,
      provider: existing.provider,
      providerId: existing.providerId,
      username: existing.username,
      stats: existing.stats,
      badges: existing.badges,
      bookmarks: existing.bookmarks,
    };
  }

  const prefix = profile.provider === "google" ? "g_" : "d_";
  const baseUsername = `${prefix}${(profile.name || "user").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const newUser = await jsonDB.createUser({
    provider: profile.provider as "google" | "discord" | "anonymous",
    providerId: profile.id,
    name: profile.name || "Unknown",
    email: profile.email,
    avatar: profile.image,
    username: baseUsername.slice(0, 30),
    stats: { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
    badges: [],
    bookmarks: [],
    createdAt: new Date().toISOString(),
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    image: newUser.avatar,
    provider: newUser.provider,
    providerId: newUser.providerId,
    username: newUser.username,
    stats: newUser.stats,
    badges: newUser.badges,
    bookmarks: newUser.bookmarks,
  };
}

// ─── Build provider list (only include providers with credentials) ─
const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account", access_type: "offline" } },
      async profile(profile) {
        return (await enrichOAuthUser({
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          provider: "google",
        })) as any;
      },
    })
  );
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { prompt: "consent" } },
      async profile(profile) {
        const avatarUrl = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
          : undefined;
        return (await enrichOAuthUser({
          id: profile.id,
          name: profile.username || profile.global_name || "Discord User",
          email: profile.email || undefined,
          image: avatarUrl,
          provider: "discord",
        })) as any;
      },
    })
  );
}

// Credentials provider — always available for anonymous username login
providers.push(
  Credentials({
    name: "Username",
    credentials: {
      username: { label: "Username", type: "text", placeholder: "e.g. zahid_2024" },
    },
    async authorize(credentials) {
      return (await credentialsAuthorize(credentials as Record<string, unknown>)) as any;
    },
  })
);

// ─── NextAuth Instance ────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,

  session: {
    strategy: hasMongoDB ? "database" : "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.provider = (user as any).provider;
        token.providerId = (user as any).providerId;
        token.username = (user as any).username;
        token.stats = (user as any).stats;
        token.badges = (user as any).badges;
        token.bookmarks = (user as any).bookmarks;
      }
      if (trigger === "update" && session) {
        Object.assign(token, session);
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).userId = token.userId;
        (session.user as any).provider = token.provider;
        (session.user as any).providerId = token.providerId;
        (session.user as any).username = token.username;
        (session.user as any).stats = token.stats;
        (session.user as any).badges = token.badges;
        (session.user as any).bookmarks = token.bookmarks;
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
    error: "/?auth_error=failed",
  },

  trustHost: true,
  secret: getNextAuthSecret(),
});

// ─── Export GET and POST for the route handler ─────────────────
export const { GET, POST } = handlers;

// ─── toIUser helper (server-side only) ────────────────────────
export function toIUser(sessionUser: any): IUser {
  return {
    _id: sessionUser?.userId || sessionUser?.id || "",
    provider: sessionUser?.provider || "anonymous",
    providerId: sessionUser?.providerId || "",
    name: sessionUser?.name || "",
    email: sessionUser?.email || undefined,
    avatar: sessionUser?.image || sessionUser?.avatar || undefined,
    username: sessionUser?.username || sessionUser?.name || "",
    stats: sessionUser?.stats || {
      totalExams: 0,
      totalScore: 0,
      bestScore: 0,
      streak: 0,
      lastExamAt: null,
    },
    badges: sessionUser?.badges || [],
    bookmarks: sessionUser?.bookmarks || [],
    groups: [],
    createdAt: new Date().toISOString(),
  };
}
