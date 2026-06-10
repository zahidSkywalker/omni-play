import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId") || "";

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Submission } = await import("@/lib/models/Submission");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();

      // Build match filter
      const matchFilter: any = { username: { $ne: "" } };
      if (examId) {
        matchFilter.examId = examId;
      }

      // Aggregate leaderboard data
      const leaderboard = await (Submission as any).aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: "$username",
            avgScore: { $avg: "$score" },
            totalExams: { $sum: 1 },
            bestScore: { $max: "$score" },
            totalTime: { $sum: "$timeTaken" },
            totalCorrect: { $sum: "$correctAnswers" },
            totalQuestions: { $sum: "$totalQuestions" },
            lastSubmission: { $max: "$submittedAt" },
          },
        },
        {
          $project: {
            username: "$_id",
            avgScore: { $round: ["$avgScore", 1] },
            totalExams: 1,
            bestScore: 1,
            avgTime: { $round: [{ $divide: ["$totalTime", "$totalExams"] }, 0] },
            totalCorrect: 1,
            totalQuestions: 1,
            lastSubmission: 1,
          },
        },
        { $sort: { avgScore: -1, totalExams: -1, avgTime: 1 } },
        { $limit: 100 },
      ]);

      return NextResponse.json({ leaderboard });
    }

    // JSON fallback
    const subs = await jsonDB.getSubmissions(examId || undefined);
    const validSubs = subs.filter((s) => s.username && s.username.trim());

    const userMap = new Map<string, { totalScore: number; totalExams: number; bestScore: number; totalTime: number; totalCorrect: number; totalQuestions: number; lastSubmission: string }>();

    for (const sub of validSubs) {
      const existing = userMap.get(sub.username) || { totalScore: 0, totalExams: 0, bestScore: 0, totalTime: 0, totalCorrect: 0, totalQuestions: 0, lastSubmission: "" };
      existing.totalScore += sub.score;
      existing.totalExams += 1;
      existing.bestScore = Math.max(existing.bestScore, sub.score);
      existing.totalTime += sub.timeTaken;
      existing.totalCorrect += sub.correctAnswers;
      existing.totalQuestions += sub.totalQuestions;
      if (sub.submittedAt > existing.lastSubmission) existing.lastSubmission = sub.submittedAt;
      userMap.set(sub.username, existing);
    }

    const leaderboard = Array.from(userMap.entries())
      .map(([username, data]) => ({
        username,
        avgScore: Math.round((data.totalScore / data.totalExams) * 10) / 10,
        totalExams: data.totalExams,
        bestScore: data.bestScore,
        avgTime: Math.round(data.totalTime / data.totalExams),
        totalCorrect: data.totalCorrect,
        totalQuestions: data.totalQuestions,
        lastSubmission: data.lastSubmission,
      }))
      .sort((a, b) => b.avgScore - a.avgScore || b.totalExams - a.totalExams || a.avgTime - b.avgTime)
      .slice(0, 100);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
