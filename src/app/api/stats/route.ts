import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";

// Simple in-memory cache with 60-second TTL to avoid hammering the DB on every page load
let cached: { data: Record<string, number> | null; timestamp: number } = { data: null, timestamp: 0 };
const CACHE_TTL = 60_000; // 60 seconds

export async function GET() {
  try {
    // Return cached data if still fresh
    const now = Date.now();
    if (cached.data && now - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ stats: cached.data });
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Exam } = await import("@/lib/models/Exam");
      const { Submission } = await import("@/lib/models/Submission");
      const { User } = await import("@/lib/models/User");
      const { Topic } = await import("@/lib/models/Topic");
      const { Post } = await import("@/lib/models/Post");
      await connectDB();

      // Run counts in parallel
      const [
        examResult,
        submissionResult,
        userResult,
        topicResult,
        postResult,
        questionAgg,
      ] = await Promise.all([
        Exam.countDocuments({ status: "active" }),
        Submission.countDocuments(),
        User.countDocuments(),
        Topic.countDocuments({ isActive: true }),
        Post.countDocuments({ isPublished: true }),
        // Sum total questions across all active exams
        Exam.aggregate([
          { $match: { status: "active" } },
          { $group: { _id: null, total: { $sum: { $size: "$questions" } } } },
        ]),
      ]);

      const stats: Record<string, number> = {
        totalQuestions: questionAgg[0]?.total || 0,
        totalExams: examResult,
        totalSubmissions: submissionResult,
        totalUsers: userResult,
        totalTopics: topicResult,
        totalPosts: postResult,
      };

      // Cache the result
      cached = { data: stats, timestamp: now };

      return NextResponse.json({ stats });
    }

    // JSON fallback
    const [exams, submissions, users] = await Promise.all([
      jsonDB.getExams(),
      jsonDB.getSubmissions(),
      jsonDB.getUsers(),
    ]);

    const activeExams = exams.filter((e) => e.status === "active");
    const totalQuestions = activeExams.reduce((sum, e) => sum + e.questions.length, 0);

    const stats: Record<string, number> = {
      totalQuestions,
      totalExams: activeExams.length,
      totalSubmissions: submissions.length,
      totalUsers: users.length,
      totalTopics: 0,
      totalPosts: 0,
    };

    cached = { data: stats, timestamp: now };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return cached data even if stale, rather than failing
    if (cached.data) {
      return NextResponse.json({ stats: cached.data });
    }
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
