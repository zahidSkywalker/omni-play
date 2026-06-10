// ─── Account Deletion Endpoint ──────────────────────────────────
// POST /api/auth/delete-account
// Requires authentication via the custom session cookie or Bearer token.
// Deletes ALL user data:
//   1. All sessions for the user
//   2. All exam submissions
//   3. All bookmarks (cleared from user doc)
//   4. All comments by the user
//   5. The user document itself
//
// This is irreversible. Returns success response on completion.

import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import {
  authenticateRequest,
  COOKIE_NAME,
} from "@/lib/auth-helpers";
import { validateCsrf } from "@/lib/security";

export async function POST(request: Request) {
  try {
    // CSRF validation on mutation
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Authenticate the request
    const authed = await authenticateRequest(request);
    if (!authed.ok) return authed.response;

    const { userId } = authed;

    // ─── Delete Sessions ─────────────────────────────────────
    // Delete all sessions for this user (not just the current one)
    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Session } = await import("@/lib/models/Session");
      await connectDB();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (Session as any).deleteMany({ userId });
    } else {
      // JSON fallback — delete all sessions belonging to this user
      const sessions = await jsonDB.getSessions();
      for (const s of sessions) {
        if (s.userId === userId) {
          await jsonDB.deleteSession(s.token);
        }
      }
    }

    // ─── Delete Submissions ──────────────────────────────────
    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Submission } = await import("@/lib/models/Submission");
      try {
        await connectDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (Submission as any).deleteMany({ userId });
      } catch {
        // Submission model might not exist — skip gracefully
      }
    } else {
      // JSON fallback — filter out the user's submissions
      const { promises: fs } = await import("fs");
      const pathMod = await import("path");
      const subsFile = pathMod.join("/tmp/.learn-tech-data", "submissions.json");
      const remaining = (await jsonDB.getSubmissions()).filter((s) => s.userId !== userId);
      await fs.writeFile(subsFile, JSON.stringify(remaining, null, 2));
    }

    // ─── Delete Comments ────────────────────────────────────
    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Comment } = await import("@/lib/models/Comment");
      try {
        await connectDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (Comment as any).deleteMany({ userId });
      } catch {
        // Comment model might not exist — skip gracefully
      }
    } else {
      const { promises: fs } = await import("fs");
      const pathMod = await import("path");
      const commentsFile = pathMod.join("/tmp/.learn-tech-data", "comments.json");
      try {
        const data = await fs.readFile(commentsFile, "utf-8");
        const comments = JSON.parse(data);
        const remaining = comments.filter((c: Record<string, unknown>) => c.userId !== userId);
        await fs.writeFile(commentsFile, JSON.stringify(remaining, null, 2));
      } catch {
        // Comments file might not exist
      }
    }

    // ─── Delete User ─────────────────────────────────────────
    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { User } = await import("@/lib/models/User");
      await connectDB();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (User as any).findByIdAndDelete(userId);
    } else {
      const { promises: fs } = await import("fs");
      const pathMod = await import("path");
      const usersFile = pathMod.join("/tmp/.learn-tech-data", "users.json");
      const data = await fs.readFile(usersFile, "utf-8");
      const users = JSON.parse(data);
      const remaining = users.filter((u: Record<string, unknown>) => u._id !== userId);
      await fs.writeFile(usersFile, JSON.stringify(remaining, null, 2));
    }

    // ─── Build Response ──────────────────────────────────────
    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    // Clear the session cookie
    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    // Clear any stale cookies from previous auth systems
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");

    return response;
  } catch (error) {
    console.error("[Account Deletion] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
