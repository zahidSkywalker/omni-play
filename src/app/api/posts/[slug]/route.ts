import { NextResponse } from "next/server";
import { requireAdmin, sanitizeString } from "@/lib/security";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { connectDB } = await import("@/lib/mongodb");
    const { Post } = await import("@/lib/models/Post");
    await connectDB();

    const post = await (Post as any)
      .findOne({ slug })
      .lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment views for published posts
    if (post.isPublished) {
      await (Post as any).updateOne({ slug }, { $inc: { views: 1 } });
      post.views = (post.views || 0) + 1;
    }

    return NextResponse.json({
      _id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      topicSlug: post.topicSlug,
      topicName: post.topicName,
      type: post.type,
      author: post.author,
      authorRole: post.authorRole,
      tags: post.tags,
      difficulty: post.difficulty,
      readTime: post.readTime,
      isPublished: post.isPublished,
      publishedAt: post.publishedAt?.toISOString(),
      views: post.views,
      likes: post.likes,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { slug } = await params;
    const body = await request.json();

    const { connectDB } = await import("@/lib/mongodb");
    const { Post } = await import("@/lib/models/Post");
    await connectDB();

    const existing = await (Post as any).findOne({ slug }).lean();
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updates: any = { updatedAt: new Date() };

    if (body.title !== undefined) {
      updates.title = sanitizeString(body.title, 200);
      if (!updates.title) return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    if (body.content !== undefined) {
      updates.content = sanitizeString(body.content, 100000);
      if (!updates.content) return NextResponse.json({ error: "Invalid content" }, { status: 400 });
      // Auto-update readTime when content changes
      updates.readTime = Math.max(1, Math.ceil(updates.content.split(/\s+/).length / 200));
    }
    if (body.excerpt !== undefined) {
      updates.excerpt = sanitizeString(body.excerpt, 300);
    }
    if (body.topicSlug !== undefined) {
      updates.topicSlug = sanitizeString(body.topicSlug, 100);
    }
    if (body.topicName !== undefined) {
      updates.topicName = sanitizeString(body.topicName, 100);
    }
    if (body.type !== undefined) {
      const validTypes = ["article", "guide", "tip", "lecture", "news", "tutorial"];
      if (!validTypes.includes(body.type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
      updates.type = body.type;
    }
    if (body.author !== undefined) {
      updates.author = sanitizeString(body.author, 100);
    }
    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) return NextResponse.json({ error: "Tags must be an array" }, { status: 400 });
      updates.tags = body.tags.map((t: string) => sanitizeString(t, 50)).filter(Boolean);
    }
    if (body.difficulty !== undefined) {
      const validDifficulties = ["beginner", "intermediate", "advanced"];
      if (!validDifficulties.includes(body.difficulty)) return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
      updates.difficulty = body.difficulty;
    }
    if (body.readTime !== undefined) {
      if (typeof body.readTime !== "number" || body.readTime < 1) return NextResponse.json({ error: "Invalid readTime" }, { status: 400 });
      updates.readTime = body.readTime;
    }
    if (body.isPublished !== undefined) {
      updates.isPublished = !!body.isPublished;
      // Auto-set publishedAt if publishing and not already set
      if (updates.isPublished && !existing.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    const post = await (Post as any)
      .findOneAndUpdate({ slug }, updates, { new: true })
      .lean();

    return NextResponse.json({
      post: {
        _id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        topicSlug: post.topicSlug,
        topicName: post.topicName,
        type: post.type,
        author: post.author,
        authorRole: post.authorRole,
        tags: post.tags,
        difficulty: post.difficulty,
        readTime: post.readTime,
        isPublished: post.isPublished,
        publishedAt: post.publishedAt?.toISOString(),
        views: post.views,
        likes: post.likes,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { slug } = await params;

    const { connectDB } = await import("@/lib/mongodb");
    const { Post } = await import("@/lib/models/Post");
    await connectDB();

    const post = await (Post as any).findOneAndDelete({ slug }).lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
