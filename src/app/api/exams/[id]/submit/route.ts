import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { validateSubmission, sanitizeString, getClientIp, rateLimit, validateCsrf } from "@/lib/security";
import { extractSessionToken, validateSession } from "@/lib/auth-helpers";

/**
 * Generate a cryptographically secure token using Node's crypto module.
 * Replaces the old Math.random()-based token generation.
 */
function generateToken(): string {
  const crypto = require("crypto");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments: string[] = [];
  for (let s = 0; s < 3; s++) {
    const bytes = crypto.randomBytes(4);
    let seg = "";
    for (let i = 0; i < 4; i++) {
      seg += chars[bytes[i] % chars.length];
    }
    segments.push(seg);
  }
  return `LTWZ-${segments.join("-")}`;
}

/**
 * Reconstruct the original-order answers from shuffled answers.
 */
function reconstructAnswers(
  shuffledAnswers: number[],
  shuffledQuestionIndices: number[],
  shuffledOptions: number[][],
  totalQuestions: number
): number[] {
  const original: number[] = new Array(totalQuestions).fill(-1);

  for (let i = 0; i < shuffledAnswers.length; i++) {
    const origQIdx = shuffledQuestionIndices[i];
    const shuffledAnswer = shuffledAnswers[i];

    if (shuffledAnswer >= 0 && shuffledAnswer < 4) {
      original[origQIdx] = shuffledOptions[i][shuffledAnswer];
    } else {
      original[origQIdx] = -1;
    }
  }

  return original;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // CSRF validation on submission
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Rate limiting (10 submissions per minute per IP)
    const ip = getClientIp(request);
    const rateLimitError = rateLimit(`submit:${ip}`, 10, 60_000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const { answers, timeTaken, studentName, username, shuffledQuestionIndices, shuffledOptions, sessionToken: bodySessionToken } = body;

    // Read session token: cookie first, then body fallback
    const sessionToken = extractSessionToken(request) || bodySessionToken || null;

    // Input validation and sanitization
    const validationError = validateSubmission({ answers, timeTaken, studentName, username });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const sanitizedUsername = sanitizeString(username, 100);
    const sanitizedStudentName = studentName ? sanitizeString(studentName, 200) : undefined;

    const token = generateToken();

    // If shuffle mappings are provided, reconstruct answers to original order
    let finalAnswers = answers as number[];
    if (
      Array.isArray(shuffledQuestionIndices) &&
      Array.isArray(shuffledOptions) &&
      shuffledQuestionIndices.length > 0 &&
      shuffledOptions.length > 0
    ) {
      if (shuffledQuestionIndices.length !== answers.length) {
        return NextResponse.json(
          { error: "Shuffle mapping length mismatch" },
          { status: 400 }
        );
      }
      for (const idx of shuffledQuestionIndices) {
        if (typeof idx !== "number" || idx < 0) {
          return NextResponse.json(
            { error: "Invalid shuffle mapping" },
            { status: 400 }
          );
        }
      }
      const maxOrigIdx = Math.max(...shuffledQuestionIndices);
      finalAnswers = reconstructAnswers(
        answers,
        shuffledQuestionIndices,
        shuffledOptions,
        maxOrigIdx + 1
      );
    }

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Exam } = await import("@/lib/models/Exam");
      const { Submission } = await import("@/lib/models/Submission");
      await connectDB();

      const exam = await (Exam as any).findById(id).lean();
      if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

      if (exam.status !== "active") {
        return NextResponse.json({ error: "This exam is no longer accepting submissions" }, { status: 403 });
      }

      // Check for duplicate submission (same username + same exam)
      const existingSubmission = await (Submission as any).findOne({
        examId: exam._id,
        username: sanitizedUsername,
      });
      if (existingSubmission) {
        return NextResponse.json(
          { error: "You have already submitted this exam. Your previous token: " + existingSubmission.token },
          { status: 409 }
        );
      }

      if (finalAnswers.length !== exam.questions.length) {
        return NextResponse.json(
          { error: `Expected ${exam.questions.length} answers, received ${finalAnswers.length}` },
          { status: 400 }
        );
      }

      // Score on server-side
      let correctCount = 0;
      exam.questions.forEach((q: any, i: number) => {
        if (finalAnswers[i] === q.correctAnswer) correctCount++;
      });

      const score = Math.round((correctCount / exam.questions.length) * 100);

      // Optionally link submission to user if sessionToken is provided
      let userId: any = undefined;
      if (sessionToken) {
        try {
          const validSession = await validateSession(sessionToken);
          if (validSession) userId = validSession.userId;
        } catch {
          // Ignore session lookup failures
        }
      }

      const submission = await (Submission as any).create({
        examId: exam._id,
        answers: finalAnswers,
        score,
        totalQuestions: exam.questions.length,
        correctAnswers: correctCount,
        timeTaken,
        studentName: sanitizedStudentName,
        username: sanitizedUsername,
        token,
        ...(userId ? { userId } : {}),
      });

      await (Exam as any).updateOne({ _id: exam._id }, { $inc: { totalSubmissions: 1 } });

      // Update user stats, badges, and streak if linked
      let newBadges: string[] = [];
      if (userId) {
        try {
          const { User } = await import("@/lib/models/User");
          const { checkBadges, calculateStreak } = await import("@/lib/badges");

          const existingUser = await (User as any).findById(userId).lean();
          if (existingUser) {
            // Find previous score on same exam for "Persistent" badge
            const previousSub = await (Submission as any).findOne({
              userId,
              examId: exam._id,
              _id: { $ne: submission._id },
            }).lean();

            const badgeCtx = {
              totalExamsBefore: existingUser.stats?.totalExams || 0,
              totalScoreBefore: existingUser.stats?.totalScore || 0,
              badgesBefore: existingUser.badges || [],
              score,
              timeTaken,
              examDuration: exam.duration * 60, // minutes to seconds
              submittedAt: new Date(),
              examId: id,
              username: sanitizedUsername,
              previousScoreOnExam: previousSub?.score,
            };

            newBadges = checkBadges(badgeCtx);

            // Calculate streak
            const userSubmissions = await (Submission as any)
              .find({ userId })
              .sort({ submittedAt: -1 })
              .select("submittedAt")
              .lean();
            const subDates = userSubmissions.map((s: any) => new Date(s.submittedAt));
            const { streak, lastExamAt } = calculateStreak(subDates);

            // Update user
            const updates: Record<string, any> = {
              $inc: { "stats.totalExams": 1, "stats.totalScore": score },
              $set: {
                "stats.lastExamAt": new Date(),
                "stats.streak": streak,
              },
            };

            if (newBadges.length > 0) {
              updates.$addToSet = { badges: { $each: newBadges } };
            }

            await (User as any).updateOne({ _id: userId }, updates);
          }
        } catch {
          // Ignore stats/badge update failures
        }
      }

      // Send email notification (fire-and-forget, never blocks response)
      try {
        const { sendNotification } = await import("@/lib/email");
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learn-tech-with-zahid.vercel.app";
        sendNotification({
          to: process.env.NOTIFICATION_EMAIL || "diana-ai@agentmail.to",
          subject: `New Submission: ${sanitizedUsername} scored ${score}% on ${exam.title}`,
          html: `<div style="font-family:Inter,sans-serif;background:#0a0a0a;color:#f5f5f5;padding:32px"><div style="max-width:480px;margin:0 auto;background:rgba(26,26,46,0.85);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px"><h2 style="color:#10b981;margin:0 0 8px">New Exam Submission</h2><p style="color:#94a3b8"><strong>${sanitizedUsername}</strong> scored <strong style="color:#10b981">${score}%</strong> (${correctCount}/${exam.questions.length}) on <em>${exam.title}</em></p><p style="color:#64748b;font-size:12px;margin-top:16px">Token: ${token} | Time: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s</p><a href="${appUrl}/result/${submission._id.toString()}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#14b8a6);color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:16px">View Result</a></div></div>`,
        }).catch(() => { /* fire-and-forget */ });
      } catch { /* Skip email on any error */ }

      return NextResponse.json({
        submissionId: submission._id.toString(),
        score,
        token,
        ...(newBadges.length > 0 ? { newBadges } : {}),
      });
    }

    // JSON fallback
    const exam = await jsonDB.getExamById(id);
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    if (exam.status !== "active") {
      return NextResponse.json({ error: "This exam is no longer accepting submissions" }, { status: 403 });
    }

    if (finalAnswers.length !== exam.questions.length) {
      return NextResponse.json(
        { error: `Expected ${exam.questions.length} answers, received ${finalAnswers.length}` },
        { status: 400 }
      );
    }

    let correctCount = 0;
    exam.questions.forEach((q: any, i: number) => {
      if (finalAnswers[i] === q.correctAnswer) correctCount++;
    });

    const score = Math.round((correctCount / exam.questions.length) * 100);

    let userId: string | undefined = undefined;
    if (sessionToken) {
      try {
        const validSession = await validateSession(sessionToken);
        if (validSession) userId = validSession.userId;
      } catch {
        // Ignore
      }
    }

    const sub = await jsonDB.createSubmission({
      examId: id,
      answers: finalAnswers,
      score,
      totalQuestions: exam.questions.length,
      correctAnswers: correctCount,
      timeTaken,
      submittedAt: new Date().toISOString(),
      studentName: sanitizedStudentName,
      username: sanitizedUsername,
      token,
      ...(userId ? { userId } : {}),
    });

    // Update user stats, badges, and streak if linked
    let newBadges: string[] = [];
    if (userId) {
      try {
        const { checkBadges, calculateStreak } = await import("@/lib/badges");
        const user = await jsonDB.getUserById(userId);
        if (user) {
          // Find previous score on same exam
          const allSubs = await jsonDB.getSubmissions(id);
          const previousSub = allSubs.find(
            (s) => s.userId === userId && s._id !== sub._id
          );

          const badgeCtx = {
            totalExamsBefore: user.stats.totalExams || 0,
            totalScoreBefore: user.stats.totalScore || 0,
            badgesBefore: user.badges || [],
            score,
            timeTaken,
            examDuration: exam.duration * 60,
            submittedAt: new Date(),
            examId: id,
            username: sanitizedUsername,
            previousScoreOnExam: previousSub?.score,
          };

          newBadges = checkBadges(badgeCtx);

          // Calculate streak
          const userSubs = await jsonDB.getSubmissionsByUserId(userId);
          const subDates = userSubs.map((s) => new Date(s.submittedAt));
          const { streak } = calculateStreak(subDates);

          const newBadgesList = [...new Set([...(user.badges || []), ...newBadges])];

          await jsonDB.updateUser(userId, {
            stats: {
              totalExams: (user.stats.totalExams || 0) + 1,
              totalScore: (user.stats.totalScore || 0) + score,
              bestScore: Math.max(user.stats.bestScore || 0, score),
              streak,
              lastExamAt: new Date().toISOString(),
            },
            badges: newBadgesList,
          });
        }
      } catch {
        // Ignore stats/badge update failures
      }
    }

    return NextResponse.json({
      submissionId: sub._id,
      score,
      token,
      ...(newBadges.length > 0 ? { newBadges } : {}),
    });

    // Note: email notification only sent for MongoDB path (requires user email lookup)
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
