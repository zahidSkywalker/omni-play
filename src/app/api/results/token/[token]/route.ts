import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: tokenValue } = await params;
    const token = tokenValue.toUpperCase();

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Submission } = await import("@/lib/models/Submission");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();

      // Find all submissions for this token
      const submissions = await (Submission as any)
        .find({ token })
        .sort({ submittedAt: -1 })
        .lean();

      if (submissions.length === 0) {
        return NextResponse.json({ error: "No results found for this token" }, { status: 404 });
      }

      const results = await Promise.all(
        submissions.map(async (sub: any) => {
          const exam = await (Exam as any).findById(sub.examId).lean();
          return {
            submissionId: sub._id.toString(),
            examId: sub.examId.toString(),
            examTitle: exam?.title || "Unknown Exam",
            score: sub.score,
            totalQuestions: sub.totalQuestions,
            correctAnswers: sub.correctAnswers,
            timeTaken: sub.timeTaken,
            submittedAt: sub.submittedAt.toISOString(),
            username: sub.username,
          };
        })
      );

      return NextResponse.json({ username: submissions[0].username, token, results });
    }

    // JSON fallback
    const subs = await jsonDB.getSubmissions();
    const matched = subs.filter((s) => s.token && s.token.toUpperCase() === token);

    if (matched.length === 0) {
      return NextResponse.json({ error: "No results found for this token" }, { status: 404 });
    }

    const results = await Promise.all(
      matched.map(async (sub) => {
        const exam = await jsonDB.getExamById(sub.examId);
        return {
          submissionId: sub._id,
          examId: sub.examId,
          examTitle: exam?.title || "Unknown Exam",
          score: sub.score,
          totalQuestions: sub.totalQuestions,
          correctAnswers: sub.correctAnswers,
          timeTaken: sub.timeTaken,
          submittedAt: sub.submittedAt,
          username: sub.username,
        };
      })
    );

    return NextResponse.json({ username: matched[0].username, token, results });
  } catch (error) {
    console.error("Error looking up token:", error);
    return NextResponse.json({ error: "Failed to lookup results" }, { status: 500 });
  }
}
