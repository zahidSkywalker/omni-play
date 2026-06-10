import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString, requireAdmin } from "@/lib/security";

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { QuestionBank } = await import("@/lib/models/QuestionBank");
      await connectDB();

      const filter: Record<string, unknown> = {};
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;
      if (search) {
        filter.question = { $regex: search, $options: "i" };
      }

      const total = await (QuestionBank as any).countDocuments(filter);
      const questions = await (QuestionBank as any)
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return NextResponse.json({
        questions: questions.map((q: any) => ({
          _id: q._id.toString(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags || [],
          usageCount: q.usageCount || 0,
          createdAt: q.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    // JSON fallback
    let questions = await jsonDB.getQuestionBank();
    if (category) questions = questions.filter((q) => q.category === category);
    if (difficulty) questions = questions.filter((q) => q.difficulty === difficulty);
    if (search) {
      const lower = search.toLowerCase();
      questions = questions.filter((q) =>
        q.question.toLowerCase().includes(lower)
      );
    }

    const total = questions.length;
    const start = (page - 1) * limit;
    const paged = questions.slice(start, start + limit);

    return NextResponse.json({
      questions: paged,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Question bank list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const {
      question,
      options,
      correctAnswer,
      explanation,
      category,
      difficulty,
      tags,
    } = body;

    // Validate
    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "Question text is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { error: "Exactly 4 options are required" },
        { status: 400 }
      );
    }
    if (typeof correctAnswer !== "number" || correctAnswer < 0 || correctAnswer > 3) {
      return NextResponse.json(
        { error: "correctAnswer must be 0, 1, 2, or 3" },
        { status: 400 }
      );
    }
    if (!category || !category.trim()) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }
    if (!["beginner", "intermediate", "advanced"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be beginner, intermediate, or advanced" },
        { status: 400 }
      );
    }

    const sanitizedQuestion = sanitizeString(question, 2000);
    const sanitizedOptions = options.map((o: unknown) => sanitizeString(o, 500));
    const sanitizedExplanation = sanitizeString(explanation || "", 2000);
    const sanitizedCategory = sanitizeString(category, 100);
    const sanitizedTags = Array.isArray(tags)
      ? tags.map((t: unknown) => sanitizeString(t, 50))
      : [];

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { QuestionBank } = await import("@/lib/models/QuestionBank");
      await connectDB();

      const q = await (QuestionBank as any).create({
        question: sanitizedQuestion,
        options: sanitizedOptions,
        correctAnswer,
        explanation: sanitizedExplanation,
        category: sanitizedCategory,
        difficulty,
        tags: sanitizedTags,
        usageCount: 0,
      });

      return NextResponse.json({
        success: true,
        question: {
          _id: q._id.toString(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags,
          usageCount: q.usageCount,
          createdAt: q.createdAt.toISOString(),
        },
      });
    }

    // JSON fallback
    const q = await jsonDB.addQuestionBankQuestion({
      question: sanitizedQuestion,
      options: sanitizedOptions,
      correctAnswer,
      explanation: sanitizedExplanation,
      category: sanitizedCategory,
      difficulty,
      tags: sanitizedTags,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, question: q });
  } catch (error) {
    console.error("Question bank create error:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Question ID required" }, { status: 400 });
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { QuestionBank } = await import("@/lib/models/QuestionBank");
      await connectDB();

      const result = await (QuestionBank as any).findByIdAndDelete(id);
      if (!result) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    const deleted = await jsonDB.deleteQuestionBankQuestion(id);
    if (!deleted) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Question bank delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
