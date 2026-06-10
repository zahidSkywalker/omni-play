"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Users,
  Plus,
  Trash2,
  Copy,
  Check,
  UserPlus,
  KeyRound,
  Trophy,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationBanner } from "@/components/ui/notification-banner";

interface Group {
  _id: string;
  name: string;
  code: string;
  examId: string;
  createdBy: string;
  members: string[];
  isActive: boolean;
  createdAt: string;
}

interface ExamOption {
  _id: string;
  title: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  submittedAt: string;
}

export default function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamOption[]>([]);

  // Create group dialog
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createExamId, setCreateExamId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Notification
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  // View leaderboard
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Copied code
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;
      const res = await fetch("/api/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.groups) setGroups(data.groups);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;
      const res = await fetch("/api/admin/exams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.exams) setExams(data.exams);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchExams();
  }, []);

  const handleCreate = async () => {
    if (!createName.trim() || !createExamId) {
      setCreateError("Name and exam are required");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: createName, examId: createExamId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create group");

      setShowCreate(false);
      setCreateName("");
      setCreateExamId("");
      fetchGroups();
      setNotification({ message: `Group created with code: ${data.group.code}`, variant: "success" });
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("ltwz_admin_token");
      if (!token) return;
      const res = await fetch(`/api/groups?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setNotification({ message: "Group deleted", variant: "success" });
      fetchGroups();
    } catch {
      setNotification({ message: "Failed to delete group", variant: "error" });
    }
  };

  const handleViewLeaderboard = async (group: Group) => {
    setViewingGroup(group);
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/api/groups/${group.code}`);
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch {
      console.error("Failed to fetch leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const getExamTitle = (examId: string) => {
    return exams.find((e) => e._id === examId)?.title || examId;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Leaderboard modal
  if (viewingGroup) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">{viewingGroup.name} — Leaderboard</h3>
            </div>
            <button
              onClick={() => setViewingGroup(null)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
            <span>Code: </span>
            <code className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded font-mono font-bold">
              {viewingGroup.code}
            </code>
            <span>• {viewingGroup.members.length} members</span>
          </div>

          {leaderboardLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No submissions yet. Share the group code to invite members!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {leaderboard.map((entry) => (
                <div
                  key={entry.username}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                      entry.rank === 1
                        ? "bg-amber-500 text-amber-950"
                        : entry.rank === 2
                        ? "bg-gray-400 text-gray-900"
                        : entry.rank === 3
                        ? "bg-orange-700 text-orange-950"
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    #{entry.rank}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm text-white font-medium">{entry.username}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {entry.correctAnswers}/{entry.totalQuestions} correct • {formatTime(entry.timeTaken)}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      entry.score >= 80
                        ? "text-emerald-400"
                        : entry.score >= 60
                        ? "text-teal-400"
                        : entry.score >= 40
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {entry.score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <NotificationBanner
          message={notification.message}
          variant={notification.variant}
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setShowCreate(true)}
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
        <span className="text-xs text-gray-400 ml-auto">
          {groups.length} group{groups.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <Card className="glass-card border-emerald-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Create New Group
              </h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <p className="text-xs text-red-400">{createError}</p>
            )}

            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Group name (e.g., CS101 Section A)"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50 text-sm"
            />

            <select
              value={createExamId}
              onChange={(e) => setCreateExamId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-emerald-500/50"
            >
              <option value="">Select an exam...</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>

            <p className="text-xs text-gray-500">
              A unique 6-character join code will be auto-generated. Share it with students to let them join.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? "Creating..." : "Create Group"}
              </Button>
              <Button
                onClick={() => setShowCreate(false)}
                variant="outline"
                className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No groups created yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Create a group to enable class-based exams with join codes and leaderboards.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Card key={group._id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-white font-medium truncate">{group.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          group.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/15 text-red-400 border-red-500/20"
                        }`}
                      >
                        {group.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Exam: {getExamTitle(group.examId)}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <KeyRound className="w-3 h-3" />
                        <button
                          onClick={() => handleCopyCode(group.code)}
                          className="font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          {group.code}
                        </button>
                        <button onClick={() => handleCopyCode(group.code)} className="text-gray-500 hover:text-emerald-400">
                          {copiedCode === group.code ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        <Users className="w-3 h-3 inline mr-1" />
                        {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created {new Date(group.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => handleViewLeaderboard(group)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      Leaderboard
                    </Button>
                    <Button
                      onClick={() => handleDelete(group._id)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
