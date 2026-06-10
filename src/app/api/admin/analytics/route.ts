import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;
    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Exam } = await import("@/lib/models/Exam");
      const { Submission } = await import("@/lib/models/Submission");
      const { User } = await import("@/lib/models/User");
      await connectDB();

      // Total counts
      const totalUsers = await (User as any).countDocuments();
      const totalExams = await (Exam as any).countDocuments();
      const totalSubmissions = await (Submission as any).countDocuments();

      // Pass/fail rates
      const passCount = await (Submission as any).countDocuments({
        score: { $gte: 60 },
      });
      const failCount = totalSubmissions - passCount;
      const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;
      const failRate = totalSubmissions > 0 ? 100 - passRate : 0;

      // Average score
      const avgScoreResult = await (Submission as any).aggregate([
        { $group: { _id: null, avgScore: { $avg: "$score" } } },
      ]);
      const avgScore = avgScoreResult.length > 0
        ? Math.round(avgScoreResult[0].avgScore * 10) / 10
        : 0;

      // Most popular exam (by submission count)
      const popularExams = await (Submission as any).aggregate([
        { $group: { _id: "$examId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]);
      let mostPopularExam = "N/A";
      if (popularExams.length > 0) {
        const exam = await (Exam as any)
          .findById(popularExams[0]._id)
          .select("title")
          .lean();
        mostPopularExam = exam?.title || "N/A";
      }

      // Submission trend (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const trendData = await (Submission as any).aggregate([
        {
          $match: { submittedAt: { $gte: sevenDaysAgo } },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Fill in missing days
      const trend: { date: string; count: number }[] = [];
      const dayMap = new Map(trendData.map((d: any) => [d._id, d.count]));
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        trend.push({ date: dateStr, count: dayMap.get(dateStr) as number || 0 });
      }

      // Average time taken per exam
      const examTimes = await (Submission as any).aggregate([
        {
          $group: {
            _id: "$examId",
            avgTime: { $avg: "$timeTaken" },
            count: { $sum: 1 },
            avgScore: { $avg: "$score" },
            passCount: { $sum: { $cond: [{ $gte: ["$score", 60] }, 1, 0] } },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const examStats = [];
      for (const et of examTimes) {
        const exam = await (Exam as any).findById(et._id).select("title").lean();
        const examPassRate = et.count > 0 ? Math.round((et.passCount / et.count) * 100) : 0;
        examStats.push({
          examTitle: exam?.title || "Unknown",
          submissions: et.count,
          avgScore: Math.round(et.avgScore * 10) / 10,
          avgTime: Math.round(et.avgTime),
          passRate: examPassRate,
        });
      }

      // Top 10 scorers
      const topScorers = await (Submission as any).aggregate([
        { $sort: { score: -1, submittedAt: 1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "exams",
            localField: "examId",
            foreignField: "_id",
            as: "exam",
          },
        },
        { $unwind: { path: "$exam", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            username: 1,
            score: 1,
            submittedAt: 1,
            examTitle: "$exam.title",
          },
        },
      ]);

      const scorers = topScorers.map((s: any, i: number) => ({
        rank: i + 1,
        username: s.username,
        examTitle: s.examTitle || "Unknown",
        score: s.score,
        date: s.submittedAt
          ? new Date(s.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A",
      }));

      return NextResponse.json({
        totalUsers,
        totalExams,
        totalSubmissions,
        passRate,
        failRate,
        avgScore,
        mostPopularExam,
        trend,
        examStats,
        topScorers: scorers,
      });
    }

    // JSON fallback
    const exams = await jsonDB.getExams();
    const subs = await jsonDB.getSubmissions();
    const users = await jsonDB.getUsers();

    const totalUsers = users.length;
    const totalExams = exams.length;
    const totalSubmissions = subs.length;

    const passCount = subs.filter((s) => s.score >= 60).length;
    const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;
    const failRate = totalSubmissions > 0 ? 100 - passRate : 0;

    const avgScore =
      totalSubmissions > 0
        ? Math.round(
            (subs.reduce((sum, s) => sum + s.score, 0) / totalSubmissions) * 10
          ) / 10
        : 0;

    // Most popular exam
    const examSubCounts = new Map<string, number>();
    subs.forEach((s) => {
      examSubCounts.set(s.examId, (examSubCounts.get(s.examId) || 0) + 1);
    });
    let mostPopularExam = "N/A";
    let maxCount = 0;
    for (const [examId, count] of examSubCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        const exam = exams.find((e) => e._id === examId);
        mostPopularExam = exam?.title || "N/A";
      }
    }

    // Submission trend
    const trend: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = subs.filter(
        (s) => s.submittedAt.split("T")[0] === dateStr
      ).length;
      trend.push({ date: dateStr, count });
    }

    // Per-exam stats
    const examStats = exams.map((exam) => {
      const examSubs = subs.filter((s) => s.examId === exam._id);
      const avgScore =
        examSubs.length > 0
          ? Math.round(
              (examSubs.reduce((sum, s) => sum + s.score, 0) /
                examSubs.length) *
                10
            ) / 10
          : 0;
      const avgTime =
        examSubs.length > 0
          ? Math.round(
              examSubs.reduce((sum, s) => sum + s.timeTaken, 0) /
                examSubs.length
            )
          : 0;
      const passCount =
        examSubs.length > 0
          ? examSubs.filter((s) => s.score >= 60).length
          : 0;
      const examPassRate =
        examSubs.length > 0
          ? Math.round((passCount / examSubs.length) * 100)
          : 0;
      return {
        examTitle: exam.title,
        submissions: examSubs.length,
        avgScore,
        avgTime,
        passRate: examPassRate,
      };
    }).sort((a, b) => b.submissions - a.submissions);

    // Top 10 scorers
    const topScorers = [...subs]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s, i) => ({
        rank: i + 1,
        username: s.username,
        examTitle: exams.find((e) => e._id === s.examId)?.title || "Unknown",
        score: s.score,
        date: new Date(s.submittedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));

    return NextResponse.json({
      totalUsers,
      totalExams,
      totalSubmissions,
      passRate,
      failRate,
      avgScore,
      mostPopularExam,
      trend,
      examStats,
      topScorers,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
