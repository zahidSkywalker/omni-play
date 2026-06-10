import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";

function generateCertificateSvg(data: {
  userName: string;
  examTitle: string;
  score: number;
  date: string;
  token: string;
}): string {
  const escapedName = data.userName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const escapedExam = data.examTitle
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#14b8a6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="850" fill="url(#bgGrad)" rx="12" ry="12"/>

  <!-- Decorative border -->
  <rect x="20" y="20" width="1160" height="810" rx="8" ry="8" fill="none" stroke="url(#borderGrad)" stroke-width="3" stroke-dasharray="0"/>
  <rect x="30" y="30" width="1140" height="790" rx="6" ry="6" fill="none" stroke="url(#borderGrad)" stroke-width="1" opacity="0.4"/>

  <!-- Corner decorations -->
  <circle cx="50" cy="50" r="6" fill="#059669" opacity="0.6"/>
  <circle cx="1150" cy="50" r="6" fill="#059669" opacity="0.6"/>
  <circle cx="50" cy="800" r="6" fill="#059669" opacity="0.6"/>
  <circle cx="1150" cy="800" r="6" fill="#059669" opacity="0.6"/>

  <!-- Top decorative line -->
  <line x1="200" y1="120" x2="1000" y2="120" stroke="url(#borderGrad)" stroke-width="1" opacity="0.3"/>

  <!-- "Learn Tech with Zahid" branding -->
  <text x="600" y="85" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="url(#titleGrad)" letter-spacing="4" filter="url(#glow)">LEARN TECH WITH ZAHID</text>

  <!-- Certificate of Achievement -->
  <text x="600" y="170" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#ffffff" font-weight="bold" letter-spacing="2">Certificate of Achievement</text>

  <!-- Decorative line under title -->
  <line x1="300" y1="195" x2="900" y2="195" stroke="url(#borderGrad)" stroke-width="1" opacity="0.4"/>

  <!-- "This certifies that" -->
  <text x="600" y="260" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9ca3af">This certifies that</text>

  <!-- User name -->
  <text x="600" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#ffffff" font-weight="bold">${escapedName}</text>

  <!-- Underline for name -->
  <line x1="${Math.max(300, 600 - escapedName.length * 12)}" y1="335" x2="${Math.min(900, 600 + escapedName.length * 12)}" y2="335" stroke="url(#borderGrad)" stroke-width="1" opacity="0.5"/>

  <!-- "has successfully completed" -->
  <text x="600" y="385" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9ca3af">has successfully completed the examination</text>

  <!-- Exam title -->
  <text x="600" y="435" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="url(#titleGrad)" font-weight="bold">${escapedExam}</text>

  <!-- Score section - big score display -->
  <rect x="460" y="470" width="280" height="80" rx="12" ry="12" fill="#059669" opacity="0.15" stroke="#059669" stroke-width="1" stroke-opacity="0.3"/>
  <text x="600" y="505" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#9ca3af">FINAL SCORE</text>
  <text x="600" y="540" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="url(#scoreGrad)" font-weight="bold">${data.score}/100</text>

  <!-- Date and verification -->
  <text x="600" y="600" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#9ca3af">Date of Completion: ${data.date}</text>
  <text x="600" y="625" text-anchor="middle" font-family="monospace" font-size="12" fill="#6b7280">Verification Code: ${data.token}</text>

  <!-- Signature line -->
  <line x1="400" y1="710" x2="800" y2="710" stroke="#ffffff" stroke-width="1" opacity="0.3"/>
  <text x="600" y="735" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#059669" font-style="italic">Learn Tech with Zahid</text>

  <!-- Bottom decorative elements -->
  <line x1="200" y1="770" x2="1000" y2="770" stroke="url(#borderGrad)" stroke-width="1" opacity="0.2"/>

  <!-- Footer -->
  <text x="600" y="795" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#6b7280">Verify at learn-tech-with-zahid.vercel.app/lookup — Powered by Learn Tech with Zahid</text>
</svg>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;

    let submissionData: {
      username: string;
      examTitle: string;
      score: number;
      submittedAt: string;
      token: string;
      studentName?: string;
    } | null = null;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Submission } = await import("@/lib/models/Submission");
      const { Exam } = await import("@/lib/models/Exam");
      await connectDB();

      const submission = await (Submission as any)
        .findById(submissionId)
        .lean();
      if (!submission) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      const exam = await (Exam as any).findById(submission.examId).lean();

      submissionData = {
        username:
          submission.studentName || submission.username || "Anonymous",
        examTitle: exam?.title || "Unknown Exam",
        score: submission.score,
        submittedAt: submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
        token: submission.token || "",
      };
    } else {
      const sub = await jsonDB.getSubmissionById(submissionId);
      if (!sub) {
        return NextResponse.json(
          { error: "Submission not found" },
          { status: 404 }
        );
      }

      const exam = await jsonDB.getExamById(sub.examId);

      submissionData = {
        username: sub.studentName || sub.username || "Anonymous",
        examTitle: exam?.title || "Unknown Exam",
        score: sub.score,
        submittedAt: new Date(sub.submittedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        token: sub.token || "",
      };
    }

    const svgString = generateCertificateSvg({
      userName: submissionData.username,
      examTitle: submissionData.examTitle,
      score: submissionData.score,
      date: submissionData.submittedAt,
      token: submissionData.token,
    });

    // Convert SVG to PNG using sharp
    const sharp = (await import("sharp")).default;
    const svgBuffer = Buffer.from(svgString);
    const pngBuffer = await sharp(svgBuffer).png().toBuffer();

    return new NextResponse(pngBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="certificate-${submissionData.token}.png"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
