import { NextResponse } from "next/server";
import { requireAdmin, sanitizeString } from "@/lib/security";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { connectDB } = await import("@/lib/mongodb");
    const { Topic } = await import("@/lib/models/Topic");
    const { Post } = await import("@/lib/models/Post");
    await connectDB();

    const topic = await (Topic as any)
      .findOne({ slug, isActive: true })
      .lean();

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const posts = await (Post as any)
      .find({ topicSlug: slug, isPublished: true })
      .select("title slug excerpt type readTime publishedAt views")
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      _id: topic._id.toString(),
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      icon: topic.icon,
      color: topic.color,
      order: topic.order,
      postCount: topic.postCount,
      examCount: topic.examCount,
      coverImage: topic.coverImage,
      createdAt: topic.createdAt.toISOString(),
      posts: posts.map((p: any) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        type: p.type,
        readTime: p.readTime,
        publishedAt: p.publishedAt?.toISOString(),
        views: p.views,
      })),
    });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 });
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
    const { name, description, icon, color, order } = body;

    const { connectDB } = await import("@/lib/mongodb");
    const { Topic } = await import("@/lib/models/Topic");
    await connectDB();

    const updates: any = {};
    if (name !== undefined) {
      updates.name = sanitizeString(name, 100);
      if (!updates.name) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (description !== undefined) updates.description = sanitizeString(description, 500);
    if (icon !== undefined) {
      updates.icon = sanitizeString(icon, 50);
      if (!updates.icon) return NextResponse.json({ error: "Invalid icon" }, { status: 400 });
    }
    if (color !== undefined) {
      updates.color = sanitizeString(color, 20);
      if (!updates.color) return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }
    if (order !== undefined) {
      if (typeof order !== "number") return NextResponse.json({ error: "Order must be a number" }, { status: 400 });
      updates.order = order;
    }

    const topic = await (Topic as any)
      .findOneAndUpdate({ slug }, updates, { new: true })
      .lean();

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({
      topic: {
        _id: topic._id.toString(),
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        icon: topic.icon,
        color: topic.color,
        order: topic.order,
        postCount: topic.postCount,
        examCount: topic.examCount,
        isActive: topic.isActive,
        createdAt: topic.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
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
    const { Topic } = await import("@/lib/models/Topic");
    await connectDB();

    const topic = await (Topic as any)
      .findOneAndUpdate({ slug }, { isActive: false }, { new: true })
      .lean();

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Topic deactivated" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}
