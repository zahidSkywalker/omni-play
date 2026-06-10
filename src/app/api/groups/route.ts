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

// ─── Helper: generate 6-char alphanumeric code ─────────────
function generateGroupCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
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
      username: m.username,
      joinedAt: m.joinedAt?.toISOString?.() || m.joinedAt,
    })),
    examIds: g.examIds || [],
    isActive: g.isActive,
    createdAt: g.createdAt?.toISOString?.() || g.createdAt,
    memberCount: (g.members || []).length,
  };
}

// ─── GET: List user's groups ──────────────────────────────────
export async function GET(request: Request) {
  try {
    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const userId = user._id?.toString?.() || user._id;

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Group } = await import("@/lib/models/Group");
      const mongoose = (await import("mongoose")).default;
      await connectDB();

      // Find groups where user is teacher or member
      const matchFilter: any = {
        isActive: true,
        $or: [
          { teacherId: new mongoose.Types.ObjectId(userId) },
          { "members.userId": new mongoose.Types.ObjectId(userId) },
        ],
      };

      // Search filter
      if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        matchFilter.$or = [
          { teacherId: new mongoose.Types.ObjectId(userId), $or: [{ name: searchRegex }, { code: search }] },
          { "members.userId": new mongoose.Types.ObjectId(userId) },
        ];
        // Simpler: search across name/code for teacher groups
        matchFilter.$and = [
          { isActive: true },
          {
            $or: [
              { teacherId: new mongoose.Types.ObjectId(userId) },
              { "members.userId": new mongoose.Types.ObjectId(userId) },
            ],
          },
        ];
        if (search) {
          (matchFilter.$and as any[]).push({
            $or: [{ name: searchRegex }, { code: search.toUpperCase() }],
          });
        }
      }

      const groups = await (Group as any)
        .find(matchFilter)
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({ groups: groups.map(formatGroup) });
    }

    // JSON fallback
    const allGroups = await jsonDB.getGroups();
    const userGroups = allGroups.filter((g) =>
      g.isActive &&
      (g.teacherId === userId || g.members.some((m) => m.userId === userId))
    );

    let filtered = userGroups;
    if (search) {
      const q = search.toLowerCase();
      filtered = userGroups.filter(
        (g) => g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ groups: filtered.map(formatGroup) });
  } catch (error) {
    console.error("Groups list error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

// ─── POST: Create a group ────────────────────────────────────
export async function POST(request: Request) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const authResult = await authenticateSession(request);
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const sanitizedName = sanitizeString(name, 200);
    const sanitizedDescription = description ? sanitizeString(description, 1000) : undefined;

    if (!sanitizedName) {
      return NextResponse.json({ error: "Invalid group name" }, { status: 400 });
    }

    const userId = user._id?.toString?.() || user._id;
    const code = generateGroupCode();

    if (hasMongoDB) {
      const { connectDB } = await import("@/lib/mongodb");
      const { Group } = await import("@/lib/models/Group");
      const mongoose = (await import("mongoose")).default;
      await connectDB();

      // Ensure code uniqueness (retry up to 3 times)
      let group: any = null;
      for (let i = 0; i < 3; i++) {
        const newCode = i === 0 ? code : generateGroupCode();
        try {
          group = await (Group as any).create({
            name: sanitizedName,
            code: newCode,
            description: sanitizedDescription,
            teacherId: new mongoose.Types.ObjectId(userId),
            teacherName: user.name || user.username,
            members: [],
            examIds: [],
            isActive: true,
          });
          break;
        } catch (err: any) {
          if (err.code === 11000 && i < 2) continue; // Duplicate code, retry
          throw err;
        }
      }

      return NextResponse.json(
        { success: true, group: formatGroup(group) },
        { status: 201 }
      );
    }

    // JSON fallback
    const group = await jsonDB.createGroup({
      name: sanitizedName,
      code,
      description: sanitizedDescription,
      teacherId: userId,
      teacherName: user.name || user.username,
      members: [],
      examIds: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, group: formatGroup(group) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Group create error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
