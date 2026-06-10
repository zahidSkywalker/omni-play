import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";

const DEFAULT_TOPICS = [
  {
    name: "Technology",
    slug: "technology",
    description: "General technology news, trends, and innovations shaping the future.",
    icon: "💻",
    color: "#3B82F6",
    order: 0,
  },
  {
    name: "Science",
    slug: "science",
    description: "Exploring discoveries, research, and breakthroughs across all scientific fields.",
    icon: "🔬",
    color: "#8B5CF6",
    order: 1,
  },
  {
    name: "History",
    slug: "history",
    description: "Lessons from the past — events, figures, and civilizations that shaped our world.",
    icon: "📜",
    color: "#D97706",
    order: 2,
  },
  {
    name: "Politics",
    slug: "politics",
    description: "Analysis of political systems, policies, governance, and civic engagement.",
    icon: "🏛️",
    color: "#EF4444",
    order: 3,
  },
  {
    name: "Mathematics",
    slug: "mathematics",
    description: "From algebra to advanced calculus — concepts, problem-solving, and mathematical thinking.",
    icon: "🔢",
    color: "#059669",
    order: 4,
  },
  {
    name: "Programming",
    slug: "programming",
    description: "Coding concepts, algorithms, best practices, and software development fundamentals.",
    icon: "⌨️",
    color: "#2563EB",
    order: 5,
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Security principles, threat analysis, ethical hacking, and digital protection strategies.",
    icon: "🔒",
    color: "#DC2626",
    order: 6,
  },
  {
    name: "AI & Machine Learning",
    slug: "ai-machine-learning",
    description: "Artificial intelligence, deep learning, neural networks, and intelligent systems.",
    icon: "🤖",
    color: "#7C3AED",
    order: 7,
  },
  {
    name: "Web Development",
    slug: "web-development",
    description: "Frontend, backend, full-stack development, frameworks, and modern web technologies.",
    icon: "🌐",
    color: "#0EA5E9",
    order: 8,
  },
  {
    name: "DevOps",
    slug: "devops",
    description: "CI/CD pipelines, containerization, cloud infrastructure, and automation practices.",
    icon: "⚙️",
    color: "#F59E0B",
    order: 9,
  },
];

export async function POST(request: Request) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { connectDB } = await import("@/lib/mongodb");
    const { Topic } = await import("@/lib/models/Topic");
    await connectDB();

    let createdCount = 0;

    for (const topicData of DEFAULT_TOPICS) {
      const existing = await (Topic as any).findOne({ slug: topicData.slug }).lean();
      if (!existing) {
        await (Topic as any).create({
          ...topicData,
          examCount: 0,
          postCount: 0,
          isActive: true,
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      created: createdCount,
      total: DEFAULT_TOPICS.length,
      message: createdCount > 0
        ? `Created ${createdCount} new topic(s). ${DEFAULT_TOPICS.length - createdCount} already existed.`
        : "All topics already exist. No new topics created.",
    });
  } catch (error: any) {
    console.error("Error seeding topics:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Duplicate topic slug detected during seed" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to seed topics" }, { status: 500 });
  }
}
