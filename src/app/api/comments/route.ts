import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString, rateLimit, getClientIp, validateCsrf } from "@/lib/security";
import { extractSessionToken, validateSession, getUserById } from "@/lib/auth-helpers";

// ─── GET: List comments for an exam (query param examId) ──────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json({ error: "examId query parameter is required" }, { status: 400 });
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Comment } = await import("@/lib/models/Comment");
      await connectDB();

      const mongoose = (await import("mongoose")).default;
      const examFilter: Record<string, unknown> = {
        examId: new mongoose.Types.ObjectId(examId),
        parentCommentId: null,
      };

      const total = await (Comment as any).countDocuments(examFilter);
      const comments = await (Comment as any)
        .find(examFilter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Fetch replies for these comments
      const commentIds = comments.map((c: any) => c._id);
      const replies = commentIds.length > 0
        ? await (Comment as any)
            .find({ parentCommentId: { $in: commentIds } })
            .sort({ createdAt: 1 })
            .lean()
        : [];

      // Group replies by parent
      const repliesByParent: Record<string, any[]> = {};
      for (const reply of replies) {
        const parentId = reply.parentCommentId.toString();
        if (!repliesByParent[parentId]) repliesByParent[parentId] = [];
        repliesByParent[parentId].push({
          _id: reply._id.toString(),
          userId: reply.userId?.toString() || undefined,
          username: reply.username,
          content: reply.content,
          likes: reply.likes || 0,
          createdAt: reply.createdAt.toISOString(),
        });
      }

      return NextResponse.json({
        comments: comments.map((c: any) => ({
          _id: c._id.toString(),
          userId: c.userId?.toString() || undefined,
          username: c.username,
          content: c.content,
          likes: c.likes || 0,
          createdAt: c.createdAt.toISOString(),
          replies: repliesByParent[c._id.toString()] || [],
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    // JSON fallback
    const { comments: allComments, total } = await jsonDB.getComments(examId, page, limit);
    const topLevel = allComments.filter((c) => !c.parentCommentId);

    // Group replies
    const allFromExam = await jsonDB.getComments(examId, 1, 10000);
    const replies: Record<string, any[]> = {};
    for (const c of allFromExam.comments) {
      if (c.parentCommentId) {
        if (!replies[c.parentCommentId]) replies[c.parentCommentId] = [];
        replies[c.parentCommentId].push({
          _id: c._id,
          userId: c.userId || undefined,
          username: c.username,
          content: c.content,
          likes: c.likes || 0,
          createdAt: c.createdAt,
        });
      }
    }

    return NextResponse.json({
      comments: topLevel.map((c) => ({
        _id: c._id,
        userId: c.userId || undefined,
        username: c.username,
        content: c.content,
        likes: c.likes || 0,
        createdAt: c.createdAt,
        replies: replies[c._id] || [],
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// ─── POST: Create a new comment ──────────────────────────────────
export async function POST(request: Request) {
  try {
    // CSRF check
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Rate limit: 5 comments per minute per IP
    const ip = getClientIp(request);
    const rateLimitError = rateLimit(`comment:${ip}`, 5, 60_000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const { examId, content, sessionToken: bodySessionToken } = body;

    // Read session token: cookie first, then body fallback
    const sessionToken = extractSessionToken(request) || bodySessionToken || null;

    if (!examId || typeof examId !== "string") {
      return NextResponse.json({ error: "examId is required" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const sanitizedContent = sanitizeString(content, 2000);
    if (!sanitizedContent) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    let sanitizedUsername = "Anonymous";
    let userId: string | undefined;

    // Resolve user from session token
    if (sessionToken) {
      try {
        const validSession = await validateSession(sessionToken);
        if (validSession) {
          userId = validSession.userId;
          const user = await getUserById(validSession.userId);
          if (user) sanitizedUsername = user.username;
        }
      } catch {
        // Ignore session lookup failures
      }
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Comment } = await import("@/lib/models/Comment");
      await connectDB();

      const mongoose = (await import("mongoose")).default;
      const commentData: Record<string, unknown> = {
        examId: new mongoose.Types.ObjectId(examId),
        username: sanitizedUsername,
        content: sanitizedContent,
        likes: 0,
      };
      if (userId) {
        commentData.userId = new mongoose.Types.ObjectId(userId);
      }

      const comment = await (Comment as any).create(commentData);

      return NextResponse.json(
        {
          success: true,
          comment: {
            _id: comment._id.toString(),
            userId: userId,
            username: comment.username,
            content: comment.content,
            likes: 0,
            createdAt: comment.createdAt.toISOString(),
            replies: [],
          },
        },
        { status: 201 }
      );
    }

    // JSON fallback
    const comment = await jsonDB.addComment({
      examId,
      username: sanitizedUsername,
      content: sanitizedContent,
      likes: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        comment: {
          _id: comment._id,
          userId: undefined,
          username: comment.username,
          content: comment.content,
          likes: 0,
          createdAt: comment.createdAt,
          replies: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment create error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
