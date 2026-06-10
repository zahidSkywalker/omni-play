import type { MetadataRoute } from "next";
import { jsonDB, hasMongoDB } from "@/lib/mongodb";

const BASE_URL = "https://learn-tech-with-zahid.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/topics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/leaderboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/lookup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic pages from DB (JSON fallback or MongoDB)
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const exams = await jsonDB.getExams();
    dynamicPages.push(
      ...exams
        .filter((e) => e.status === "active")
        .map((exam) => ({
          url: `${BASE_URL}/exam/${exam._id}`,
          lastModified: new Date(exam.createdAt),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }))
    );
  } catch {
    // Silently fail — return static pages only
  }

  return [...staticPages, ...dynamicPages];
}
