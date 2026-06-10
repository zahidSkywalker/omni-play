import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { connectDB } = await import("@/lib/mongodb");
    const { Topic } = await import("@/lib/models/Topic");
    await connectDB();

    const topics = await (Topic as any)
      .find()
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({
      topics: topics.map((t: any) => ({
        _id: t._id.toString(),
        name: t.name,
        slug: t.slug,
        description: t.description,
        icon: t.icon,
        color: t.color,
        order: t.order,
        postCount: t.postCount,
        examCount: t.examCount,
        isActive: t.isActive,
        coverImage: t.coverImage,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin topics error:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}
