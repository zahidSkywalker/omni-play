import { NextResponse } from "next/server";
import { requireAdmin, sanitizeString } from "@/lib/security";

export async function GET() {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const { Topic } = await import("@/lib/models/Topic");
    await connectDB();

    const topics = await (Topic as any)
      .find({ isActive: true })
      .select("slug name description icon color postCount examCount")
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      topics: topics.map((t: any) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
        icon: t.icon,
        color: t.color,
        postCount: t.postCount,
        examCount: t.examCount,
      })),
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, slug, description, icon, color, order } = body;

    if (!name || !slug || !icon || !color) {
      return NextResponse.json({ error: "Missing required fields: name, slug, icon, color" }, { status: 400 });
    }

    const sanitizedName = sanitizeString(name, 100);
    const sanitizedSlug = sanitizeString(slug, 100).toLowerCase().replace(/[^a-z0-9-]/g, "");
    const sanitizedDescription = sanitizeString(description, 500);
    const sanitizedIcon = sanitizeString(icon, 50);
    const sanitizedColor = sanitizeString(color, 20);

    if (!sanitizedName || !sanitizedSlug || !sanitizedIcon || !sanitizedColor) {
      return NextResponse.json({ error: "Invalid topic data" }, { status: 400 });
    }

    const { connectDB } = await import("@/lib/mongodb");
    const { Topic } = await import("@/lib/models/Topic");
    await connectDB();

    const topic = await (Topic as any).create({
      name: sanitizedName,
      slug: sanitizedSlug,
      description: sanitizedDescription || undefined,
      icon: sanitizedIcon,
      color: sanitizedColor,
      order: typeof order === "number" ? order : 0,
      examCount: 0,
      postCount: 0,
      isActive: true,
    });

    return NextResponse.json(
      {
        topic: {
          _id: topic._id.toString(),
          slug: topic.slug,
          name: topic.name,
          description: topic.description,
          icon: topic.icon,
          color: topic.color,
          order: topic.order,
          postCount: topic.postCount,
          examCount: topic.examCount,
          isActive: topic.isActive,
          createdAt: topic.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating topic:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "A topic with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
