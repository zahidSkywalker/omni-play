import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";

/**
 * Helper to strip correctAnswer from questions before sending to client.
 * Prevents students from fetching all answers via the API.
 */
function stripCorrectAnswers(questions: any[]) {
  return questions.map((q) => ({
    question: q.question,
    options: q.options,
    explanation: q.explanation || undefined,
    // correctAnswer is intentionally omitted
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();
      const exam = await (Exam as any).findById(id).lean();
      if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
      return NextResponse.json({
        _id: exam._id.toString(),
        title: exam.title,
        slug: exam.slug,
        description: exam.description,
        duration: exam.duration,
        questions: stripCorrectAnswers(exam.questions),
        status: exam.status,
        createdAt: exam.createdAt.toISOString(),
        totalSubmissions: exam.totalSubmissions,
      });
    }

    // JSON fallback
    const exam = await jsonDB.getExamById(id);
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    return NextResponse.json({
      ...exam,
      questions: stripCorrectAnswers(exam.questions),
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}
