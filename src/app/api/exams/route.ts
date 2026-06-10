import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { requireAdmin, validateCsrf, sanitizeString } from "@/lib/security";

export async function GET() {
  try {
    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();
      const exams = await Exam.find({ status: "active" })
        .select("title slug description duration questions status createdAt totalSubmissions")
        .sort({ createdAt: -1 })
        .lean();
      const summaries = exams.map((exam: any) => ({
        _id: exam._id.toString(),
        title: exam.title,
        slug: exam.slug,
        description: exam.description,
        duration: exam.duration,
        questionCount: exam.questions.length,
        status: exam.status,
        createdAt: exam.createdAt.toISOString(),
        totalSubmissions: exam.totalSubmissions,
      }));
      return NextResponse.json({ exams: summaries });
    }

    // JSON fallback
    const exams = await jsonDB.getExams();
    const active = exams.filter((e) => e.status === "active");
    return NextResponse.json({
      exams: active.map((e) => ({
        _id: e._id,
        title: e.title,
        slug: e.slug,
        description: e.description,
        duration: e.duration,
        questionCount: e.questions.length,
        status: e.status,
        createdAt: e.createdAt,
        totalSubmissions: e.totalSubmissions,
      })),
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Verify admin auth (no hardcoded fallback)
    const authError = requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { title, description, duration, questions } = body;

    if (!title || !description || !duration || !questions || !questions.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title, 200);
    const sanitizedDescription = sanitizeString(description, 2000);

    if (!sanitizedTitle || !sanitizedDescription) {
      return NextResponse.json({ error: "Invalid title or description" }, { status: 400 });
    }

    if (typeof duration !== "number" || duration < 1 || duration > 300) {
      return NextResponse.json(
        { error: "Duration must be between 1 and 300 minutes" },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0 || questions.length > 200) {
      return NextResponse.json(
        { error: "Questions array must have 1-200 questions" },
        { status: 400 }
      );
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (
        !q.question ||
        !q.options ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        return NextResponse.json(
          { error: `Invalid question at index ${i}: must have a question text, exactly 4 options, and a valid correctAnswer (0-3)` },
          { status: 400 }
        );
      }
      // Sanitize question text
      questions[i].question = sanitizeString(q.question, 2000);
      questions[i].options = q.options.map((opt: string) => sanitizeString(opt, 500));
      if (q.explanation) {
        questions[i].explanation = sanitizeString(q.explanation, 2000);
      }
    }

    const slug = sanitizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();
      const exam = await (Exam as any).create({
        title: sanitizedTitle,
        slug,
        description: sanitizedDescription,
        duration,
        questions,
        status: "active",
        totalSubmissions: 0,
      });

      // Non-blocking email notification
      import("@/lib/email").then(({ notifyNewExam }) => {
        notifyNewExam(sanitizedTitle, slug).catch((err) => {
          console.error("Email notification error:", err);
        });
      }).catch(() => {});

      return NextResponse.json(
        {
          exam: {
            _id: exam._id.toString(),
            title: exam.title,
            slug: exam.slug,
            description: exam.description,
            duration: exam.duration,
            questionCount: exam.questions.length,
            status: exam.status,
            createdAt: exam.createdAt.toISOString(),
            totalSubmissions: exam.totalSubmissions,
          },
        },
        { status: 201 }
      );
    }

    // JSON fallback
    const exam = await jsonDB.createExam({
      title: sanitizedTitle,
      slug,
      description: sanitizedDescription,
      duration,
      questions,
      status: "active",
      createdAt: new Date().toISOString(),
      totalSubmissions: 0,
    });

    // Non-blocking email notification
    import("@/lib/email").then(({ notifyNewExam }) => {
      notifyNewExam(sanitizedTitle, slug).catch((err) => {
        console.error("Email notification error:", err);
      });
    }).catch(() => {});

    return NextResponse.json(
      {
        exam: {
          _id: exam._id,
          title: exam.title,
          slug: exam.slug,
          description: exam.description,
          duration: exam.duration,
          questionCount: exam.questions.length,
          status: exam.status,
          createdAt: exam.createdAt,
          totalSubmissions: exam.totalSubmissions,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
