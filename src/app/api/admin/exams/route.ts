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
      await connectDB();
      const exams = await (Exam as any).find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({
        exams: exams.map((e: any) => ({
          _id: e._id.toString(),
          title: e.title,
          slug: e.slug,
          status: e.status,
          duration: e.duration,
          questionCount: e.questions.length,
          totalSubmissions: e.totalSubmissions,
          createdAt: e.createdAt.toISOString(),
        })),
      });
    }

    const exams = await jsonDB.getExams();
    return NextResponse.json({
      exams: exams.map((e) => ({
        _id: e._id,
        title: e.title,
        slug: e.slug,
        status: e.status,
        duration: e.duration,
        questionCount: e.questions.length,
        totalSubmissions: e.totalSubmissions,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin exams error:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}
