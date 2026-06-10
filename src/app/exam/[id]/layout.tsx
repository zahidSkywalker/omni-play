import type { Metadata } from "next";
import { connectDB, hasMongoDB } from "@/lib/mongodb";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const SITE_URL = "https://learn-tech-with-zahid.vercel.app";

  try {
    if (hasMongoDB) {
      await connectDB();
      const { Exam } = await import("@/lib/models/Exam");
      const exam = await (Exam as any).findById(id).select("title description status").lean();
      if (exam && exam.status === "active") {
        return {
          title: `${exam.title} — Online MCQ Exam`,
          description: exam.description
            ? `${exam.description} Take this free online exam and test your knowledge.`
            : `Take this free online MCQ exam on Learn Tech with Zahid.`,
          openGraph: {
            title: `${exam.title} — MCQ Exam`,
            description: exam.description || "Free online MCQ examination.",
            url: `${SITE_URL}/exam/${id}`,
            type: "article",
          },
          twitter: {
            card: "summary",
            title: `${exam.title} — MCQ Exam`,
            description: exam.description || "Free online MCQ examination.",
          },
        };
      }
    }
  } catch {
    // Silent — fall through to default
  }

  return {
    title: "Online Examination — Learn Tech with Zahid",
    description: "Take a free online MCQ examination and test your knowledge.",
  };
}

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
