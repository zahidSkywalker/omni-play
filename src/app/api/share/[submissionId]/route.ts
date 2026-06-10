import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";

function generateShareCardSVG(data: {
  examTitle: string;
  username: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  submittedAt: string;
}): string {
  const scoreColor = data.score >= 80 ? "#10b981" : data.score >= 60 ? "#14b8a6" : data.score >= 40 ? "#f59e0b" : "#ef4444";
  const scoreMessage = data.score >= 90 ? "Outstanding!" : data.score >= 80 ? "Excellent!" : data.score >= 70 ? "Great Job!" : data.score >= 60 ? "Good Effort!" : data.score >= 40 ? "Keep Practicing!" : "Don't Give Up!";
  const minutes = Math.floor(data.timeTaken / 60);
  const seconds = data.timeTaken % 60;
  const timeStr = `${minutes}m ${seconds}s`;
  const dateStr = new Date(data.submittedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#14b8a6"/>
    </linearGradient>
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${scoreColor}"/>
      <stop offset="100%" style="stop-color:${scoreColor}cc"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" rx="16"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)" rx="2"/>

  <!-- Brand header -->
  <text x="60" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#10b981" font-weight="700">Learn Tech with Zahid</text>
  <text x="1140" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748b" text-anchor="end">Exam Result Card</text>

  <!-- Divider -->
  <line x1="60" y1="70" x2="1140" y2="70" stroke="#ffffff10" stroke-width="1"/>

  <!-- Score circle -->
  <circle cx="600" cy="260" r="120" fill="none" stroke="#ffffff08" stroke-width="12"/>
  <circle cx="600" cy="260" r="120" fill="none" stroke="url(#scoreGrad)" stroke-width="12"
    stroke-dasharray="${754}" stroke-dashoffset="${754 * (1 - data.score / 100)}"
    stroke-linecap="round" transform="rotate(-90 600 260)"/>
  <text x="600" y="245" font-family="system-ui, -apple-system, sans-serif" font-size="64" fill="${scoreColor}" text-anchor="middle" font-weight="800">${data.score}%</text>
  <text x="600" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle">${scoreMessage}</text>

  <!-- Stats cards -->
  <!-- Correct -->
  <rect x="200" y="420" width="180" height="80" rx="12" fill="#ffffff05" stroke="#ffffff08"/>
  <text x="290" y="455" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#10b981" text-anchor="middle" font-weight="700">${data.correctAnswers}</text>
  <text x="290" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Correct</text>

  <!-- Total -->
  <rect x="420" y="420" width="180" height="80" rx="12" fill="#ffffff05" stroke="#ffffff08"/>
  <text x="510" y="455" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#e2e8f0" text-anchor="middle" font-weight="700">${data.totalQuestions}</text>
  <text x="510" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Total Questions</text>

  <!-- Time -->
  <rect x="640" y="420" width="180" height="80" rx="12" fill="#ffffff05" stroke="#ffffff08"/>
  <text x="730" y="455" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#06b6d4" text-anchor="middle" font-weight="700">${timeStr}</text>
  <text x="730" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Time Taken</text>

  <!-- Date -->
  <rect x="860" y="420" width="180" height="80" rx="12" fill="#ffffff05" stroke="#ffffff08"/>
  <text x="950" y="455" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="#e2e8f0" text-anchor="middle" font-weight="700">${dateStr}</text>
  <text x="950" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">Date</text>

  <!-- Exam title -->
  <text x="600" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#cbd5e1" text-anchor="middle" font-weight="600">${escapeXml(data.examTitle)}</text>

  <!-- User -->
  <text x="600" y="590" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">by ${escapeXml(data.username)}</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;

    let submissionData: {
      examTitle: string;
      username: string;
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      timeTaken: number;
      submittedAt: string;
      token: string;
    } | null = null;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Submission } = await import("@/lib/models/Submission");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();

      const submission = await (Submission as any).findById(submissionId).lean();
      if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

      const exam = await (Exam as any).findById(submission.examId).lean();

      submissionData = {
        examTitle: exam?.title || "Unknown Exam",
        username: submission.username || "Anonymous",
        score: submission.score,
        correctAnswers: submission.correctAnswers,
        totalQuestions: submission.totalQuestions,
        timeTaken: submission.timeTaken,
        submittedAt: submission.submittedAt.toISOString(),
        token: submission.token,
      };
    } else {
      const sub = await jsonDB.getSubmissionById(submissionId);
      if (!sub) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

      const exam = await jsonDB.getExamById(sub.examId);

      submissionData = {
        examTitle: exam?.title || "Unknown Exam",
        username: sub.username || "Anonymous",
        score: sub.score,
        correctAnswers: sub.correctAnswers,
        totalQuestions: sub.totalQuestions,
        timeTaken: sub.timeTaken,
        submittedAt: sub.submittedAt,
        token: sub.token,
      };
    }

    // Generate SVG card
    const svg = generateShareCardSVG(submissionData);

    // Try to convert SVG to PNG using sharp (available in deps)
    try {
      const sharp = (await import("sharp")).default;
      const svgBuffer = Buffer.from(svg);

      const pngBuffer = await sharp(svgBuffer)
        .resize(1200, 630)
        .png()
        .toBuffer();

      return new NextResponse(new Uint8Array(pngBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="result-${submissionId}.png"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      // Fall back to SVG if sharp fails
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `inline; filename="result-${submissionId}.svg"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch (error) {
    console.error("Share card error:", error);
    return NextResponse.json(
      { error: "Failed to generate share card" },
      { status: 500 }
    );
  }
}
