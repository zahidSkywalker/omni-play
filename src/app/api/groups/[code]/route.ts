import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString, validateCsrf } from "@/lib/security";

// ─── Helper: authenticate session and return user ────────────
async function authenticateSession(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "No session token provided" }, { status: 401 }) };
  }

  const token = authHeader.slice(7);
  if (!token) {
    return { error: NextResponse.json({ error: "Invalid session token" }, { status: 401 }) };
  }

  if (hasMongoDB) {
    const { connectDB } = await import("@/lib/mongodb");
    const { Session } = await import("@/lib/models/Session");
    const { User } = await import("@/lib/models/User");
    await connectDB();

    const session = await (Session as any).findOne({
      token,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) {
      return { error: NextResponse.json({ error: "Session expired or invalid" }, { status: 401 }) };
    }

    const user = await (User as any).findById(session.userId).lean();
    if (!user) {
      return { error: NextResponse.json({ error: "User not found" }, { status: 401 }) };
    }

    return { user };
  }

  // JSON fallback
  await jsonDB.cleanExpiredSessions();
  const session = await jsonDB.getSessionByToken(token);
  if (!session) {
    return { error: NextResponse.json({ error: "Session expired or invalid" }, { status: 401 }) };
  }

  const user = await jsonDB.getUserById(session.userId);
  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 401 }) };
  }

  return { user };
}

// ─── Helper: format group for response ──────────────────────
function formatGroup(g: any): any {
  return {
    _id: g._id?.toString?.() || g._id,
    name: g.name,
    code: g.code,
    description: g.description || undefined,
    teacherId: g.teacherId?.toString?.() || g.teacherId,
    teacherName: g.teacherName,
    members: (g.members || []).map((m: any) => ({
      userId: m.userId?.toString?.() || m.userId,
      username: typeof m === "string" ? m : m.username,
      joinedAt: (m.joinedAt?.toISOString?.() || m.joinedAt) || new Date().toISOString(),
    })),
    examIds: g.examIds || [],
    isActive: g.isActive,
    createdAt: g.createdAt?.toISOString?.() || g.createdAt,
    memberCount: (g.members || []).length,
  };
}

// ─── GET: Look up group by code ─────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Group } = await import("@/lib/models/Group");
      const { Submission } = await import("@/lib/models/Submission");
      await connectDB();

      const group = await (Group as any).findOne({ code: code.toUpperCase() }).lean();
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      return NextResponse.json({ group: formatGroup(group) });
    }

    // JSON fallback
    const group = await jsonDB.getGroupByCode(code);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ group: formatGroup(group) });
  } catch (error) {
    console.error("Group lookup error:", error);
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
  }
}

// ─── POST: Join group by code (legacy endpoint, delegates to join) ──
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const userId = user._id?.toString?.() || user._id;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Group } = await import("@/lib/models/Group");
      const mongoose = (await import("mongoose")).default;
      await connectDB();

      const group = await (Group as any).findOne({ code: code.toUpperCase() }).lean();
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }
      if (!group.isActive) {
        return NextResponse.json({ error: "This group is no longer active" }, { status: 403 });
      }

      // Check if already a member
      const alreadyMember = group.members.some(
        (m: any) => m.userId?.toString?.() === userId
      );
      if (alreadyMember) {
        return NextResponse.json({
          success: true,
          message: "Already a member",
          group: formatGroup(group),
        });
      }

      // Add user to group
      await (Group as any).updateOne(
        { code: code.toUpperCase() },
        {
          $push: {
            members: {
              userId: new mongoose.Types.ObjectId(userId),
              username: user.username,
              joinedAt: new Date(),
            },
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Joined group successfully",
        group: formatGroup({ ...group, members: [...group.members, { userId, username: user.username, joinedAt: new Date() }] }),
      });
    }

    // JSON fallback
    const group = await jsonDB.joinGroup(code, userId, user.username);
    if (!group) {
      return NextResponse.json({ error: "Group not found or inactive" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Joined group successfully",
      group: formatGroup(group),
    });
  } catch (error) {
    console.error("Group join error:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}
