import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { validateCsrf, sanitizeString } from "@/lib/security";
import { extractSessionToken, validateSession, getUserById } from "@/lib/auth-helpers";

// Helper to authenticate the session token (reads from cookie first, then Bearer header)
async function authenticateSession(request: Request) {
  const token = extractSessionToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: "No session token provided" }, { status: 401 }) };
  }

  const session = await validateSession(token);
  if (!session) {
    return { error: NextResponse.json({ error: "Session expired or invalid" }, { status: 401 }) };
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 401 }) };
  }

  return { user };
}

export async function GET(request: Request) {
  try {
    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const bookmarks = (user as any).bookmarks || [];
    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const body = await request.json();
    const { examId } = body;

    if (!examId || typeof examId !== "string") {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    const sanitizedExamId = sanitizeString(examId, 100);
    if (!sanitizedExamId) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { User } = await import("@/lib/models/User");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();

      // Verify exam exists
      const exam = await (Exam as any).findById(sanitizedExamId).lean();
      if (!exam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      }

      // Add to bookmarks if not already present
      const updatedUser = await (User as any).findByIdAndUpdate(
        user._id,
        { $addToSet: { bookmarks: sanitizedExamId } },
        { new: true }
      ).lean();

      return NextResponse.json({
        bookmarks: updatedUser.bookmarks || [],
      });
    }

    // JSON fallback
    const updatedUser = await jsonDB.updateUser(user._id, {
      bookmarks: [...((user as any).bookmarks || []), sanitizedExamId].filter(
        (v: string, i: number, a: string[]) => a.indexOf(v) === i
      ),
    });

    return NextResponse.json({
      bookmarks: updatedUser?.bookmarks || [],
    });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // CSRF protection
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const body = await request.json();
    const { examId } = body;

    if (!examId || typeof examId !== "string") {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    const sanitizedExamId = sanitizeString(examId, 100);
    if (!sanitizedExamId) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { User } = await import("@/lib/models/User");
      await connectDB();

      // Remove from bookmarks
      const updatedUser = await (User as any).findByIdAndUpdate(
        user._id,
        { $pull: { bookmarks: sanitizedExamId } },
        { new: true }
      ).lean();

      return NextResponse.json({
        bookmarks: updatedUser.bookmarks || [],
      });
    }

    // JSON fallback
    const currentBookmarks = (user as any).bookmarks || [];
    const updatedUser = await jsonDB.updateUser(user._id, {
      bookmarks: currentBookmarks.filter((id: string) => id !== sanitizedExamId),
    });

    return NextResponse.json({
      bookmarks: updatedUser?.bookmarks || [],
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 });
  }
}
