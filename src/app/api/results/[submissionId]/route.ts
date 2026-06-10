import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Submission } = await import("@/lib/models/Submission");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();

      const submission = await (Submission as any).findById(submissionId).lean();
      if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

      const exam = await (Exam as any).findById(submission.examId).lean();

      return NextResponse.json({
        submissionId: submission._id.toString(),
        examId: submission.examId.toString(),
        examTitle: exam?.title || "Unknown Exam",
        answers: submission.answers,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        correctAnswers: submission.correctAnswers,
        timeTaken: submission.timeTaken,
        submittedAt: submission.submittedAt.toISOString(),
        studentName: submission.studentName,
        username: submission.username || "",
        token: submission.token || "",
        questions: (exam?.questions || []).map((q: any) => ({ ...q, correctAnswer: undefined })),
      });
    }

    // JSON fallback
    const sub = await jsonDB.getSubmissionById(submissionId);
    if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    const exam = await jsonDB.getExamById(sub.examId);

    return NextResponse.json({
      submissionId: sub._id,
      examId: sub.examId,
      examTitle: exam?.title || "Unknown Exam",
      answers: sub.answers,
      score: sub.score,
      totalQuestions: sub.totalQuestions,
      correctAnswers: sub.correctAnswers,
      timeTaken: sub.timeTaken,
      submittedAt: sub.submittedAt,
      studentName: sub.studentName,
      username: sub.username || "",
      token: sub.token || "",
      questions: (exam?.questions || []).map((q: any) => ({ ...q, correctAnswer: undefined })),
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 });
  }
}
