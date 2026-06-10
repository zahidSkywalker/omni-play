import type { Metadata } from "next";
import { connectDB, hasMongoDB, jsonDB } from "@/lib/mongodb";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const SITE_URL = "https://learn-tech-with-zahid.vercel.app";

  try {
    if (hasMongoDB) {
      await connectDB();
      const { Topic } = await import("@/lib/models/Topic");
      const topic = await (Topic as any).findOne({ slug, isActive: true }).lean();
      if (topic) {
        return {
          title: `${topic.name} — Learn Tech with Zahid`,
          description: topic.description || `Explore ${topic.name} articles, guides, and tutorials.`,
          openGraph: {
            title: `${topic.name} — Learn Tech with Zahid`,
            description: topic.description || `Explore ${topic.name} articles, guides, and tutorials.`,
            url: `${SITE_URL}/topics/${slug}`,
            type: "website",
          },
          twitter: {
            card: "summary",
            title: `${topic.name} — Learn Tech with Zahid`,
            description: topic.description || `Explore ${topic.name} articles, guides, and tutorials.`,
          },
        };
      }
    } else {
      const topics = await jsonDB.getGroups(); // topics not in jsonDB, fallback
    }
  } catch {
    // Silent — fall through to default
  }

  return {
    title: "Topic — Learn Tech with Zahid",
    description: "Explore articles, guides, and tutorials on this topic.",
  };
}

export default function TopicDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
