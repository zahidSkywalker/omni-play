import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/security";

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";

    const filter: Record<string, string> = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { QuestionBank } = await import("@/lib/models/QuestionBank");
      await connectDB();

      const mongoFilter: Record<string, unknown> = {};
      if (category) mongoFilter.category = category;
      if (difficulty) mongoFilter.difficulty = difficulty;

      const questions = await (QuestionBank as any)
        .find(mongoFilter)
        .sort({ createdAt: -1 })
        .lean();

      const exportData = questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty,
        tags: q.tags || [],
      }));

      if (format === "csv") {
        const csvRows = [
          "question,optionA,optionB,optionC,optionD,correctAnswer,explanation,category,difficulty,tags",
          ...exportData.map((q: any) =>
            [
              `"${(q.question || "").replace(/"/g, '""')}"`,
              `"${(q.options[0] || "").replace(/"/g, '""')}"`,
              `"${(q.options[1] || "").replace(/"/g, '""')}"`,
              `"${(q.options[2] || "").replace(/"/g, '""')}"`,
              `"${(q.options[3] || "").replace(/"/g, '""')}"`,
              q.correctAnswer,
              `"${(q.explanation || "").replace(/"/g, '""')}"`,
              q.category,
              q.difficulty,
              `"${(q.tags || []).join(";")}"`,
            ].join(",")
          ),
        ];

        return new NextResponse(csvRows.join("\n"), {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="question-bank-${Date.now()}.csv"`,
          },
        });
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="question-bank-${Date.now()}.json"`,
        },
      });
    }

    // JSON fallback
    let questions = await jsonDB.getQuestionBank();
    if (category) questions = questions.filter((q) => q.category === category);
    if (difficulty) questions = questions.filter((q) => q.difficulty === difficulty);

    const exportData = questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty,
      tags: q.tags || [],
    }));

    if (format === "csv") {
      const csvRows = [
        "question,optionA,optionB,optionC,optionD,correctAnswer,explanation,category,difficulty,tags",
        ...exportData.map((q) =>
          [
            `"${(q.question || "").replace(/"/g, '""')}"`,
            `"${(q.options[0] || "").replace(/"/g, '""')}"`,
            `"${(q.options[1] || "").replace(/"/g, '""')}"`,
            `"${(q.options[2] || "").replace(/"/g, '""')}"`,
            `"${(q.options[3] || "").replace(/"/g, '""')}"`,
            q.correctAnswer,
            `"${(q.explanation || "").replace(/"/g, '""')}"`,
            q.category,
            q.difficulty,
            `"${(q.tags || []).join(";")}"`,
          ].join(",")
        ),
      ];

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="question-bank-${Date.now()}.csv"`,
        },
      });
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="question-bank-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export questions" },
      { status: 500 }
    );
  }
}
