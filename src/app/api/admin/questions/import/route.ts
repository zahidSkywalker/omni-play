import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString, requireAdmin } from "@/lib/security";

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const format = formData.get("format") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedFormats = ["json", "csv"];
    const detectedFormat = format || (file.name.endsWith(".csv") ? "csv" : "json");

    if (!allowedFormats.includes(detectedFormat)) {
      return NextResponse.json(
        { error: "Only JSON and CSV files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB." },
        { status: 400 }
      );
    }

    const text = await file.text();
    let questions: Array<Record<string, unknown>> = [];

    if (detectedFormat === "json") {
      try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          return NextResponse.json(
            { error: "JSON must be an array of questions" },
            { status: 400 }
          );
        }
        questions = parsed;
      } catch {
        return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
      }
    } else {
      // Parse CSV
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        return NextResponse.json(
          { error: "CSV must have at least a header row and one data row" },
          { status: 400 }
        );
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const fields: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const ch = line[j];
          if (ch === '"') {
            inQuotes = !inQuotes;
          } else if (ch === "," && !inQuotes) {
            fields.push(current.trim());
            current = "";
          } else {
            current += ch;
          }
        }
        fields.push(current.trim());

        if (fields.length < 6) continue;

        const q: Record<string, unknown> = {
          question: fields[0],
          options: [fields[1], fields[2], fields[3], fields[4]],
          correctAnswer: parseInt(fields[5], 10) || 0,
          explanation: fields[6] || "",
          category: fields[7] || "General",
          difficulty: fields[8] || "intermediate",
          tags: fields[9] ? fields[9].split(";").map((t) => t.trim()) : [],
        };
        questions.push(q);
      }
    }

    // Validate and sanitize questions
    const validCategories = [
      "JavaScript", "React", "AI", "Networking", "Database", "Python",
      "TypeScript", "CSS", "Node.js", "DevOps", "General", "Other",
    ];
    const validDifficulties = ["beginner", "intermediate", "advanced"];

    const sanitizedQuestions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      category: string;
      difficulty: "beginner" | "intermediate" | "advanced";
      tags: string[];
      usageCount: number;
      createdAt: string;
    }> = [];

    for (const q of questions) {
      if (!q.question || typeof q.question !== "string") continue;
      const options = Array.isArray(q.options) ? q.options : [q.optionA, q.optionB, q.optionC, q.optionD];
      if (!Array.isArray(options) || options.length !== 4) continue;
      const correctAnswer = typeof q.correctAnswer === "number" ? q.correctAnswer : 0;
      if (correctAnswer < 0 || correctAnswer > 3) continue;

      const cat = String(q.category || "General");
      const diff = String(q.difficulty || "intermediate");

      sanitizedQuestions.push({
        question: sanitizeString(String(q.question), 2000),
        options: options.map((o: unknown) => sanitizeString(String(o), 500)),
        correctAnswer,
        explanation: sanitizeString(String(q.explanation || ""), 2000),
        category: validCategories.includes(cat) ? cat : "General",
        difficulty: (validDifficulties.includes(diff) ? diff : "intermediate") as "beginner" | "intermediate" | "advanced",
        tags: Array.isArray(q.tags) ? q.tags.map((t: unknown) => sanitizeString(String(t), 50)) : [],
        usageCount: 0,
        createdAt: new Date().toISOString(),
      });
    }

    if (sanitizedQuestions.length === 0) {
      return NextResponse.json(
        { error: "No valid questions found in file" },
        { status: 400 }
      );
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { QuestionBank } = await import("@/lib/models/QuestionBank");
      await connectDB();
      await (QuestionBank as any).insertMany(sanitizedQuestions);
    } else {
      await jsonDB.bulkAddQuestionBankQuestions(sanitizedQuestions);
    }

    return NextResponse.json({
      success: true,
      imported: sanitizedQuestions.length,
      total: questions.length,
      skipped: questions.length - sanitizedQuestions.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import questions" }, { status: 500 });
  }
}
