import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString, validateCsrf, rateLimit, getClientIp } from "@/lib/security";
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

// ─── POST: Join a group by code ──────────────────────────────
export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    // Rate limit: 10 requests per minute per IP
    const ip = getClientIp(request);
    const rateLimitError = rateLimit(ip, 10, 60_000);
    if (rateLimitError) return rateLimitError;

    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Group code is required" }, { status: 400 });
    }

    const sanitizedCode = sanitizeString(code, 10).toUpperCase();
    if (!sanitizedCode || sanitizedCode.length < 4) {
      return NextResponse.json({ error: "Invalid group code" }, { status: 400 });
    }

    const userId = user._id?.toString?.() || user._id;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Group } = await import("@/lib/models/Group");
      const mongoose = (await import("mongoose")).default;
      await connectDB();

      const group = await (Group as any).findOne({ code: sanitizedCode }).lean();
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }
      if (!group.isActive) {
        return NextResponse.json({ error: "This group is no longer active" }, { status: 403 });
      }

      // Check if already a member
      const alreadyMember = group.members.some(
        (m: any) => m.userId.toString() === userId
      );
      if (alreadyMember) {
        return NextResponse.json({
          success: true,
          message: "Already a member",
          group: {
            _id: group._id.toString(),
            name: group.name,
            code: group.code,
            teacherName: group.teacherName,
            memberCount: group.members.length,
          },
        });
      }

      // Add user to group
      await (Group as any).updateOne(
        { code: sanitizedCode },
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
        group: {
          _id: group._id.toString(),
          name: group.name,
          code: group.code,
          teacherName: group.teacherName,
          memberCount: group.members.length + 1,
        },
      });
    }

    // JSON fallback
    const group = await jsonDB.joinGroup(sanitizedCode, userId, user.username);
    if (!group) {
      return NextResponse.json({ error: "Group not found or inactive" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Joined group successfully",
      group: {
        _id: group._id,
        name: group.name,
        code: group.code,
        teacherName: group.teacherName,
        memberCount: group.members.length,
      },
    });
  } catch (error) {
    console.error("Group join error:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}
