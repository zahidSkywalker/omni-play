import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/security";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Submission } = await import("@/lib/models/Submission");
      await connectDB();
      const subs = await (Submission as any).find({ examId: id }).sort({ submittedAt: -1 }).lean();
      return NextResponse.json({
        submissions: subs.map((s: any) => ({
          _id: s._id.toString(),
          examId: s.examId.toString(),
          answers: s.answers,
          score: s.score,
          totalQuestions: s.totalQuestions,
          correctAnswers: s.correctAnswers,
          timeTaken: s.timeTaken,
          submittedAt: s.submittedAt.toISOString(),
          studentName: s.studentName,
          username: s.username || "",
          token: s.token || "",
        })),
      });
    }

    const subs = await jsonDB.getSubmissions(id);
    return NextResponse.json({
      submissions: subs.map((s) => ({
        _id: s._id,
        examId: s.examId,
        answers: s.answers,
        score: s.score,
        totalQuestions: s.totalQuestions,
        correctAnswers: s.correctAnswers,
        timeTaken: s.timeTaken,
        submittedAt: s.submittedAt,
        studentName: s.studentName,
        username: s.username || "",
        token: s.token || "",
      })),
    });
  } catch (error) {
    console.error("Admin submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
