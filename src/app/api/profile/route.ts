import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { extractSessionToken, validateSession, getUserById } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    const token = extractSessionToken(request);
    if (!token) {
      return NextResponse.json({ error: "No session token provided" }, { status: 401 });
    }

    const session = await validateSession(token);
    if (!session) {
      return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { User } = await import("@/lib/models/User");
      const { Submission } = await import("@/lib/models/Submission");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();

      // Fetch submissions with exam titles
      const submissions = await (Submission as any)
        .find({ userId: session.userId })
        .sort({ submittedAt: -1 })
        .lean();

      // Enrich with exam titles
      const enrichedSubmissions = await Promise.all(
        submissions.map(async (sub: any) => {
          const exam = await (Exam as any).findById(sub.examId).lean();
          return {
            _id: sub._id.toString(),
            examId: sub.examId.toString(),
            examTitle: exam?.title || "Unknown Exam",
            score: sub.score,
            totalQuestions: sub.totalQuestions,
            correctAnswers: sub.correctAnswers,
            timeTaken: sub.timeTaken,
            submittedAt: sub.submittedAt?.toISOString?.() || new Date().toISOString(),
            username: sub.username,
            token: sub.token,
          };
        })
      );

      return NextResponse.json({
        user: {
          _id: user._id.toString(),
          provider: user.provider,
          name: user.name,
          email: user.email || undefined,
          avatar: user.avatar || undefined,
          username: user.username,
          stats: user.stats || { totalExams: 0, totalScore: 0, bestScore: 0, streak: 0, lastExamAt: null },
          badges: user.badges || [],
          bookmarks: user.bookmarks || [],
          createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
        },
        submissions: enrichedSubmissions,
      });
    }

    // ── JSON fallback ──────────────────────────────────────
    const submissions = await jsonDB.getSubmissionsByUserId(user._id);

    // Enrich with exam titles
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (sub) => {
        const exam = await jsonDB.getExamById(sub.examId);
        return {
          ...sub,
          examTitle: exam?.title || "Unknown Exam",
        };
      })
    );

    return NextResponse.json({
      user,
      submissions: enrichedSubmissions,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
