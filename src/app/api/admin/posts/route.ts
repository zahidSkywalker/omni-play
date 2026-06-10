import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") || "20", 10) || 20;

    const { connectDB } = await import("@/lib/mongodb");
    const { Post } = await import("@/lib/models/Post");
    await connectDB();

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      (Post as any)
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Post as any).countDocuments(),
    ]);

    return NextResponse.json({
      posts: posts.map((p: any) => ({
        _id: p._id.toString(),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        topicSlug: p.topicSlug,
        topicName: p.topicName,
        type: p.type,
        author: p.author,
        tags: p.tags,
        difficulty: p.difficulty,
        readTime: p.readTime,
        isPublished: p.isPublished,
        publishedAt: p.publishedAt?.toISOString(),
        views: p.views,
        likes: p.likes,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
