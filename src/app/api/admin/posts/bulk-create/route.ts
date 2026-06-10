import { NextResponse } from "next/server";
import { requireAdmin, sanitizeString } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { posts } = body;

    if (!Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: "posts array is required and must not be empty" }, { status: 400 });
    }

    if (posts.length > 100) {
      return NextResponse.json({ error: "Maximum 100 posts per bulk create" }, { status: 400 });
    }

    const validTypes = ["article", "guide", "tip", "lecture", "news", "tutorial"];
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    const now = new Date();

    const { connectDB } = await import("@/lib/mongodb");
    const { Post } = await import("@/lib/models/Post");
    await connectDB();

    const docsToInsert: any[] = [];

    for (const item of posts) {
      if (!item.title || !item.content || !item.topicSlug || !item.topicName) {
        continue; // Skip invalid entries
      }

      const sanitizedTitle = sanitizeString(item.title, 200);
      const sanitizedContent = sanitizeString(item.content, 100000);
      const sanitizedTopicSlug = sanitizeString(item.topicSlug, 100);
      const sanitizedTopicName = sanitizeString(item.topicName, 100);

      if (!sanitizedTitle || !sanitizedContent || !sanitizedTopicSlug || !sanitizedTopicName) {
        continue;
      }

      const autoSlug = sanitizedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);

      const autoExcerpt = sanitizedContent.slice(0, 150).trim() + (sanitizedContent.length > 150 ? "..." : "");
      const autoReadTime = Math.max(1, Math.ceil(sanitizedContent.split(/\s+/).length / 200));

      const sanitizedTags = Array.isArray(item.tags)
        ? item.tags.map((t: string) => sanitizeString(t, 50)).filter(Boolean)
        : [];

      docsToInsert.push({
        title: sanitizedTitle,
        slug: autoSlug,
        content: sanitizedContent,
        excerpt: autoExcerpt,
        topicSlug: sanitizedTopicSlug,
        topicName: sanitizedTopicName,
        type: validTypes.includes(item.type) ? item.type : "article",
        author: "Diana AI",
        authorRole: "ai-assistant",
        tags: sanitizedTags,
        difficulty: validDifficulties.includes(item.difficulty) ? item.difficulty : "beginner",
        readTime: autoReadTime,
        isPublished: true,
        publishedAt: now,
        views: 0,
        likes: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (docsToInsert.length === 0) {
      return NextResponse.json({ error: "No valid posts to create" }, { status: 400 });
    }

    const result = await (Post as any).insertMany(docsToInsert);

    return NextResponse.json({
      success: true,
      created: result.length,
    });
  } catch (error: any) {
    console.error("Error bulk creating posts:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Duplicate slug detected in bulk create" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to bulk create posts" }, { status: 500 });
  }
}
