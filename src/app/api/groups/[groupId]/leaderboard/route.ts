import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { extractSessionToken, validateSession, getUserById } from "@/lib/auth-helpers";

// ─── Helper: authenticate session and return user ────────────
async function authenticateSession(request: Request) {
  const token = extractSessionToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: "No session token provided" }, { status: 401 }) };
  }

  const session = await validateSession(token);
  if (!session) {
    return { error: NextResponse.json({ error: "Session expired or invalid" }, { status: 401 }) };
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 401 }) };
  }

  return { user };
}

// ─── GET: Group-specific leaderboard ─────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    // Auth required — only members can see the leaderboard
    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const userId = user._id?.toString?.() || user._id;

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId") || "";

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Group } = await import("@/lib/models/Group");
      const { Submission } = await import("@/lib/models/Submission");
      const mongoose = (await import("mongoose")).default;
      await connectDB();

      // Find group
      const group = await (Group as any).findById(groupId).lean();
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }
      if (!group.isActive) {
        return NextResponse.json({ error: "This group is no longer active" }, { status: 403 });
      }

      // Check membership (teacher or member)
      const isTeacher = group.teacherId.toString() === userId;
      const isMember = group.members.some((m: any) => m.userId.toString() === userId);
      if (!isTeacher && !isMember) {
        return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
      }

      // Get member usernames for filtering
      const memberUsernames = group.members.map((m: any) => m.username);
      const memberUserIds = group.members.map((m: any) => m.userId);

      // Build match filter
      const matchFilter: any = {
        $or: [
          { username: { $in: memberUsernames } },
          { userId: { $in: memberUserIds } },
        ],
      };

      // Filter by exam if specified
      if (examId) {
        matchFilter.examId = new mongoose.Types.ObjectId(examId);
      }

      // Aggregate leaderboard data
      const leaderboard = await (Submission as any).aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: "$username",
            avgScore: { $avg: "$score" },
            totalExams: { $sum: 1 },
            bestScore: { $max: "$score" },
            totalTime: { $sum: "$timeTaken" },
            totalCorrect: { $sum: "$correctAnswers" },
            totalQuestions: { $sum: "$totalQuestions" },
            lastSubmission: { $max: "$submittedAt" },
          },
        },
        {
          $project: {
            username: "$_id",
            avgScore: { $round: ["$avgScore", 1] },
            totalExams: 1,
            bestScore: 1,
            avgTime: { $round: [{ $divide: ["$totalTime", "$totalExams"] }, 0] },
            totalCorrect: 1,
            totalQuestions: 1,
            lastSubmission: 1,
          },
        },
        { $sort: { avgScore: -1, totalExams: -1, avgTime: 1 } },
        { $limit: 100 },
      ]);

      // Add rank
      const ranked = leaderboard.map((e: any, i: number) => ({
        rank: i + 1,
        ...e,
        lastSubmission: e.lastSubmission?.toISOString?.() || e.lastSubmission,
      }));

      return NextResponse.json({ leaderboard: ranked });
    }

    // JSON fallback
    const group = await jsonDB.getGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }
    if (!group.isActive) {
      return NextResponse.json({ error: "This group is no longer active" }, { status: 403 });
    }

    // Check membership
    const isTeacher = group.teacherId === userId;
    const isMember = group.members.some((m) => m.userId === userId);
    if (!isTeacher && !isMember) {
      return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
    }

    // Get submissions for group members
    const memberUsernames = group.members.map((m) => m.username);
    const allSubs = await jsonDB.getSubmissions(examId || undefined);
    const validSubs = allSubs.filter(
      (s) => s.username && memberUsernames.includes(s.username)
    );

    // Aggregate
    const userMap = new Map<string, {
      totalScore: number;
      totalExams: number;
      bestScore: number;
      totalTime: number;
      totalCorrect: number;
      totalQuestions: number;
      lastSubmission: string;
    }>();

    for (const sub of validSubs) {
      const existing = userMap.get(sub.username) || {
        totalScore: 0, totalExams: 0, bestScore: 0, totalTime: 0,
        totalCorrect: 0, totalQuestions: 0, lastSubmission: "",
      };
      existing.totalScore += sub.score;
      existing.totalExams += 1;
      existing.bestScore = Math.max(existing.bestScore, sub.score);
      existing.totalTime += sub.timeTaken;
      existing.totalCorrect += sub.correctAnswers;
      existing.totalQuestions += sub.totalQuestions;
      if (sub.submittedAt > existing.lastSubmission) existing.lastSubmission = sub.submittedAt;
      userMap.set(sub.username, existing);
    }

    const leaderboard = Array.from(userMap.entries())
      .map(([username, data]) => ({
        rank: 0,
        username,
        avgScore: Math.round((data.totalScore / data.totalExams) * 10) / 10,
        totalExams: data.totalExams,
        bestScore: data.bestScore,
        avgTime: Math.round(data.totalTime / data.totalExams),
        totalCorrect: data.totalCorrect,
        totalQuestions: data.totalQuestions,
        lastSubmission: data.lastSubmission,
      }))
      .sort((a, b) => b.avgScore - a.avgScore || b.totalExams - a.totalExams || a.avgTime - b.avgTime)
      .slice(0, 100)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Group leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch group leaderboard" }, { status: 500 });
  }
}
