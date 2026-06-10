import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString, rateLimit, getClientIp, validateCsrf } from "@/lib/security";
import { extractSessionToken, validateSession, getUserById } from "@/lib/auth-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Comment } = await import("@/lib/models/Comment");
      await connectDB();

      const examFilter: Record<string, unknown> = {
        examId: new (await import("mongoose")).default.Types.ObjectId(id),
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
          username: reply.username,
          content: reply.content,
          likes: reply.likes || 0,
          createdAt: reply.createdAt.toISOString(),
        });
      }

      return NextResponse.json({
        comments: comments.map((c: any) => ({
          _id: c._id.toString(),
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
    const { comments: allComments, total } = await jsonDB.getComments(id, page, limit);
    const topLevel = allComments.filter((c) => !c.parentCommentId);

    // Group replies
    const allFromExam = await jsonDB.getComments(id, 1, 10000);
    const replies: Record<string, any[]> = {};
    for (const c of allFromExam.comments) {
      if (c.parentCommentId) {
        if (!replies[c.parentCommentId]) replies[c.parentCommentId] = [];
        replies[c.parentCommentId].push({
          _id: c._id,
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
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // CSRF check
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Rate limit: 5 comments per minute per IP
    const ip = getClientIp(request);
    const rateLimitError = rateLimit(`comment:${ip}`, 5, 60_000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const { content, username, parentCommentId, sessionToken: bodySessionToken } = body;

    // Read session token: cookie first, then body fallback
    const sessionToken = extractSessionToken(request) || bodySessionToken || null;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const sanitizedContent = sanitizeString(content, 2000);
    if (!sanitizedContent) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    let sanitizedUsername = "Anonymous";
    let userId: any = undefined;

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

    if (username) {
      sanitizedUsername = sanitizeString(username, 100);
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Comment } = await import("@/lib/models/Comment");
      const { Session } = await import("@/lib/models/Session");
      const { User } = await import("@/lib/models/User");
      await connectDB();

      // Resolve username from session if possible
      if (sessionToken) {
        try {
          const validSession = await validateSession(sessionToken);
          if (validSession) {
            userId = validSession.userId;
            const user = await getUserById(validSession.userId);
            if (user) sanitizedUsername = user.username;
          }
        } catch {
          // Ignore
        }
      }

      const mongoose = (await import("mongoose")).default;
      const commentData: Record<string, unknown> = {
        examId: new mongoose.Types.ObjectId(id),
        username: sanitizedUsername,
        content: sanitizedContent,
        likes: 0,
      };
      if (parentCommentId) {
        commentData.parentCommentId = new mongoose.Types.ObjectId(parentCommentId);
      }
      if (userId) {
        commentData.userId = new mongoose.Types.ObjectId(userId);
      }

      const comment = await (Comment as any).create(commentData);

      return NextResponse.json({
        success: true,
        comment: {
          _id: comment._id.toString(),
          username: comment.username,
          content: comment.content,
          likes: 0,
          createdAt: comment.createdAt.toISOString(),
          replies: [],
        },
      });
    }

    // JSON fallback
    const comment = await jsonDB.addComment({
      examId: id,
      username: sanitizedUsername,
      content: sanitizedContent,
      parentCommentId: parentCommentId || undefined,
      likes: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      comment: {
        _id: comment._id,
        username: comment.username,
        content: comment.content,
        likes: 0,
        createdAt: comment.createdAt,
        replies: [],
      },
    });
  } catch (error) {
    console.error("Comment create error:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Comment } = await import("@/lib/models/Comment");
      await connectDB();

      const result = await (Comment as any).findByIdAndUpdate(
        commentId,
        { $inc: { likes: 1 } },
        { new: true }
      ).lean();

      if (!result) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        likes: result.likes,
      });
    }

    const liked = await jsonDB.likeComment(commentId);
    if (!liked) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment like error:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 }
    );
  }
}
