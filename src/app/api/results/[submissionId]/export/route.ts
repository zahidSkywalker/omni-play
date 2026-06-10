import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";

// ─── GET: Generate a print-optimized HTML result sheet ─────────────
// Returns a self-contained HTML page with embedded CSS for print/PDF output.
// The client opens this in a new tab for printing or saving as PDF.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;

    let examTitle = "Unknown Exam";
    let studentName = "";
    let username = "";
    let score = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;
    let timeTaken = 0;
    let submittedAt = "";
    let answers: number[] = [];
    let questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }> = [];

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Submission } = await import("@/lib/models/Submission");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();

      const submission = await (Submission as any).findById(submissionId).lean();
      if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const exam = await (Exam as any).findById(submission.examId).lean();

      examTitle = exam?.title || "Unknown Exam";
      studentName = submission.studentName || "";
      username = submission.username || "";
      score = submission.score;
      totalQuestions = submission.totalQuestions;
      correctAnswers = submission.correctAnswers;
      timeTaken = submission.timeTaken;
      submittedAt = submission.submittedAt.toISOString();
      answers = submission.answers;
      questions = exam?.questions || [];
    } else {
      // JSON fallback
      const sub = await jsonDB.getSubmissionById(submissionId);
      if (!sub) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const exam = await jsonDB.getExamById(sub.examId);
      examTitle = exam?.title || "Unknown Exam";
      studentName = sub.studentName || "";
      username = sub.username || "";
      score = sub.score;
      totalQuestions = sub.totalQuestions;
      correctAnswers = sub.correctAnswers;
      timeTaken = sub.timeTaken;
      submittedAt = sub.submittedAt;
      answers = sub.answers;
      questions = exam?.questions || [];
    }

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s}s`;
    };

    const submittedDate = new Date(submittedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const optionLabels = ["A", "B", "C", "D"];

    // Build questions HTML
    const questionsHtml = questions.map((q, i) => {
      const userAnswer = answers[i];
      const isCorrect = userAnswer === q.correctAnswer;
      const isUnanswered = userAnswer === -1 || userAnswer === undefined || userAnswer === null;

      const optionsHtml = q.options.map((opt, j) => {
        const isCorrectOption = j === q.correctAnswer;
        const isUserAnswer = j === userAnswer;
        let bgColor = "#f9fafb";
        let borderColor = "#e5e7eb";
        let textColor = "#374151";
        let statusIcon = "";

        if (isCorrectOption) {
          bgColor = "#ecfdf5";
          borderColor = "#10b981";
          textColor = "#065f46";
          statusIcon = " ✓";
        }
        if (isUserAnswer && !isCorrectOption) {
          bgColor = "#fef2f2";
          borderColor = "#ef4444";
          textColor = "#991b1b";
          statusIcon = " ✗";
        }

        return `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;border:1px solid ${borderColor};background:${bgColor};margin-bottom:4px;">
            <span style="flex-shrink:0;width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:${isUserAnswer ? (isCorrect ? "#d1fae5" : "#fee2e2") : "#f3f4f6"};color:${textColor};">${optionLabels[j]}</span>
            <span style="font-size:13px;color:${textColor};flex:1;">${escapeHtml(opt)}</span>
            ${statusIcon ? `<span style="font-weight:700;color:${isCorrectOption ? "#10b981" : "#ef4444"};font-size:14px;">${statusIcon}</span>` : ""}
          </div>
        `;
      }).join("");

      return `
        <div style="margin-bottom:24px;page-break-inside:avoid;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <span style="flex-shrink:0;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;background:${isCorrect ? "#d1fae5" : "#fee2e2"};color:${isCorrect ? "#065f46" : "#991b1b"};">${i + 1}</span>
            <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:9999px;font-size:11px;font-weight:600;background:${isCorrect ? "#d1fae5" : "#fee2e2"};color:${isCorrect ? "#065f46" : "#991b1b"};">${isCorrect ? "Correct" : isUnanswered ? "Unanswered" : "Incorrect"}</span>
          </div>
          <p style="font-size:14px;color:#111827;margin:0 0 12px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(q.question)}</p>
          <div>${optionsHtml}</div>
          ${q.explanation ? `<div style="margin-top:8px;padding:10px 12px;border-radius:8px;background:#f9fafb;border:1px solid #e5e7eb;"><span style="font-size:12px;color:#6b7280;"><strong style="color:#374151;">Explanation:</strong> ${escapeHtml(q.explanation)}</span></div>` : ""}
        </div>
      `;
    }).join("");

    const scoreColor = score >= 80 ? "#059669" : score >= 60 ? "#0d9488" : score >= 40 ? "#d97706" : "#dc2626";
    const wrongAnswers = totalQuestions - correctAnswers;

    // Full HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Exam Result — ${escapeHtml(examTitle)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #111827;
      background: #ffffff;
      padding: 40px 24px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.5;
    }

    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    }

    .header .date {
      font-size: 12px;
      color: #6b7280;
    }

    .score-card {
      background: linear-gradient(135deg, #ecfdf5, #f0fdfa);
      border: 2px solid #a7f3d0;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .score-circle {
      flex-shrink: 0;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 4px solid ${scoreColor};
    }

    .score-circle .value {
      font-size: 28px;
      font-weight: 700;
      color: ${scoreColor};
    }

    .score-circle .label {
      font-size: 11px;
      color: #6b7280;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      flex: 1;
    }

    .stat {
      text-align: center;
    }

    .stat .num {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    }

    .stat .lbl {
      font-size: 11px;
      color: #6b7280;
    }

    .student-info {
      margin-bottom: 24px;
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      font-size: 13px;
      color: #374151;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .print-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: #059669;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 24px;
    }

    .print-btn:hover {
      background: #047857;
    }

    .watermark {
      text-align: center;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;">
    <button class="print-btn" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div>
      <h1>📋 ${escapeHtml(examTitle)}</h1>
      <p style="font-size:13px;color:#6b7280;margin-top:4px;">Exam Result Report</p>
    </div>
    <div class="date">
      <div>${submittedDate}</div>
    </div>
  </div>

  ${studentName ? `<div class="student-info"><strong>Student:</strong> ${escapeHtml(studentName)} <span style="margin-left:16px;"><strong>Username:</strong> @${escapeHtml(username)}</span></div>` : `<div class="student-info"><strong>Username:</strong> @${escapeHtml(username)}</div>`}

  <div class="score-card">
    <div class="score-circle">
      <span class="value">${score}%</span>
      <span class="label">Score</span>
    </div>
    <div class="stats-grid">
      <div class="stat">
        <div class="num" style="color:#059669;">${correctAnswers}</div>
        <div class="lbl">Correct</div>
      </div>
      <div class="stat">
        <div class="num" style="color:#dc2626;">${wrongAnswers}</div>
        <div class="lbl">Wrong</div>
      </div>
      <div class="stat">
        <div class="num">${totalQuestions}</div>
        <div class="lbl">Total</div>
      </div>
      <div class="stat">
        <div class="num">${formatTime(timeTaken)}</div>
        <div class="lbl">Time</div>
      </div>
    </div>
  </div>

  <h2 class="section-title">📝 Question Review</h2>

  ${questionsHtml}

  <div class="watermark">
    Generated by Learn Tech with Zahid — ${submittedDate}
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="exam-result-${submissionId}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating result export:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}

// ─── Helper: Escape HTML entities ──────────────────────────────────
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
