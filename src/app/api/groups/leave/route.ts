import { NextResponse } from "next/server";
import { hasMongoDB, jsonDB } from "@/lib/mongodb";
import { sanitizeString, validateCsrf } from "@/lib/security";
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

// ─── POST: Leave a group ───────────────────────────────────
export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const body = await request.json();
    const { groupId } = body;

    if (!groupId || typeof groupId !== "string" || !groupId.trim()) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const sanitizedGroupId = sanitizeString(groupId, 100);
    if (!sanitizedGroupId) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    const userId = user._id?.toString?.() || user._id;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Group } = await import("@/lib/models/Group");
      await connectDB();

      const group = await (Group as any).findById(sanitizedGroupId).lean();
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      // Teacher cannot leave their own group
      if (group.teacherId.toString() === userId) {
        return NextResponse.json(
          { error: "Teacher cannot leave their own group" },
          { status: 403 }
        );
      }

      // Check if user is a member
      const isMember = group.members.some(
        (m: any) => m.userId.toString() === userId
      );
      if (!isMember) {
        return NextResponse.json({ error: "You are not a member of this group" }, { status: 400 });
      }

      // Remove user from group
      await (Group as any).updateOne(
        { _id: sanitizedGroupId },
        { $pull: { members: { userId: new (await import("mongoose")).default.Types.ObjectId(userId) } } }
      );

      return NextResponse.json({
        success: true,
        message: "Left group successfully",
      });
    }

    // JSON fallback
    const group = await jsonDB.getGroupById(sanitizedGroupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Teacher cannot leave their own group
    if (group.teacherId === userId) {
      return NextResponse.json(
        { error: "Teacher cannot leave their own group" },
        { status: 403 }
      );
    }

    const updatedGroup = await jsonDB.leaveGroup(sanitizedGroupId, userId);
    if (!updatedGroup) {
      return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    console.error("Group leave error:", error);
    return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
  }
}
