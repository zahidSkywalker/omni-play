import { NextResponse } from "next/server";
import { requireAdmin, sanitizeString } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || "";
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") || "12", 10) || 12;

    const { connectDB } = await import("@/lib/mongodb");
    const { Post } = await import("@/lib/models/Post");
    await connectDB();

    const filter: any = { isPublished: true };
    if (topic) filter.topicSlug = topic;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      (Post as any)
        .find(filter)
        .select("title slug excerpt topicSlug topicName type author tags difficulty readTime publishedAt views likes")
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Post as any).countDocuments(filter),
    ]);

    return NextResponse.json({
      posts: posts.map((p: any) => ({
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
        publishedAt: p.publishedAt?.toISOString(),
        views: p.views,
        likes: p.likes,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { title, slug, content, excerpt, topicSlug, topicName, type, author, tags, difficulty, readTime, isPublished } = body;

    if (!title || !content || !topicSlug || !topicName) {
      return NextResponse.json({ error: "Missing required fields: title, content, topicSlug, topicName" }, { status: 400 });
    }

    const sanitizedTitle = sanitizeString(title, 200);
    const sanitizedContent = sanitizeString(content, 100000);
    const sanitizedTopicSlug = sanitizeString(topicSlug, 100);
    const sanitizedTopicName = sanitizeString(topicName, 100);
    const sanitizedExcerpt = excerpt ? sanitizeString(excerpt, 300) : undefined;
    const sanitizedAuthor = author ? sanitizeString(author, 100) : "Diana AI";
    const sanitizedSlug = slug
      ? sanitizeString(slug, 200).toLowerCase().replace(/[^a-z0-9-]/g, "")
      : sanitizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

    if (!sanitizedTitle || !sanitizedContent || !sanitizedTopicSlug || !sanitizedTopicName) {
      return NextResponse.json({ error: "Invalid post data" }, { status: 400 });
    }

    const validTypes = ["article", "guide", "tip", "lecture", "news", "tutorial"];
    const postType = validTypes.includes(type) ? type : "article";

    const validDifficulties = ["beginner", "intermediate", "advanced"];
    const postDifficulty = validDifficulties.includes(difficulty) ? difficulty : "beginner";

    const sanitizedTags = Array.isArray(tags)
      ? tags.map((t: string) => sanitizeString(t, 50)).filter(Boolean)
      : [];

    const autoReadTime = readTime || Math.max(1, Math.ceil(sanitizedContent.split(/\s+/).length / 200));
    const autoExcerpt = sanitizedExcerpt || sanitizedContent.slice(0, 150).trim() + (sanitizedContent.length > 150 ? "..." : "");

    const { connectDB } = await import("@/lib/mongodb");
    const { Post } = await import("@/lib/models/Post");
    await connectDB();

    const postData: any = {
      title: sanitizedTitle,
      slug: sanitizedSlug,
      content: sanitizedContent,
      excerpt: autoExcerpt,
      topicSlug: sanitizedTopicSlug,
      topicName: sanitizedTopicName,
      type: postType,
      author: sanitizedAuthor,
      tags: sanitizedTags,
      difficulty: postDifficulty,
      readTime: autoReadTime,
      isPublished: !!isPublished,
      views: 0,
      likes: 0,
    };

    if (isPublished) {
      postData.publishedAt = new Date();
    }

    const post = await (Post as any).create(postData);

    return NextResponse.json(
      {
        post: {
          _id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          topicSlug: post.topicSlug,
          topicName: post.topicName,
          type: post.type,
          author: post.author,
          tags: post.tags,
          difficulty: post.difficulty,
          readTime: post.readTime,
          isPublished: post.isPublished,
          publishedAt: post.publishedAt?.toISOString(),
          views: post.views,
          likes: post.likes,
          createdAt: post.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating post:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
