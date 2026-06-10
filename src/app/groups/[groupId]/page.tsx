"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Crown,
  Copy,
  Check,
  LogOut,
  Trophy,
  Medal,
  Clock,
  Target,
  BookOpen,
  TrendingUp,
  Calendar,
  User,
  Loader2,
  Filter,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { formatTime, getScoreColor } from "@/lib/format";
import type { IGroup } from "@/types";

interface LeaderboardEntry {
  rank: number;
  username: string;
  avgScore: number;
  totalExams: number;
  bestScore: number;
  avgTime: number;
  totalCorrect: number;
  totalQuestions: number;
  lastSubmission: string;
}

interface ExamOption {
  _id: string;
  title: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRankStyle(rank: number) {
  if (rank === 1) return { bg: "bg-amber-100 dark:bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-500 text-amber-950", icon: Crown };
  if (rank === 2) return { bg: "bg-gray-400/10", border: "border-gray-400/30", text: "text-gray-700 dark:text-gray-300", badge: "bg-gray-400 text-gray-900", icon: Medal };
  if (rank === 3) return { bg: "bg-orange-700/10", border: "border-orange-700/30", text: "text-orange-400", badge: "bg-orange-700 text-orange-950", icon: Medal };
  return { bg: "bg-white/[0.02]", border: "border-gray-200/50 dark:border-white/[0.06]", text: "text-gray-600 dark:text-gray-400", badge: "bg-white/10 text-gray-300", icon: TrendingUp };
}

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  const { user, loading: authLoading } = useAuth();

  const [group, setGroup] = useState<IGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "leaderboard">("info");

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [examFilter, setExamFilter] = useState("");
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  // Leave state
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  const userId = user?._id || "";
  const isTeacher = group?.teacherId === userId;
  const isMember = group?.members.some((m) => m.userId === userId) || false;

  // Fetch group info
  const fetchGroup = useCallback(async () => {
    if (!user || !groupId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/groups?search=${encodeURIComponent(groupId)}`);
      if (!res.ok) {
        setError("Failed to load group");
        return;
      }
      const data = await res.json();
      const found = (data.groups || []).find((g: IGroup) => g._id === groupId);
      if (!found) {
        setError("Group not found or you don't have access");
        return;
      }
      setGroup(found);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [user, groupId]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchGroup();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError("Please login to view this group");
    }
  }, [user, authLoading, fetchGroup]);

  // Fetch exams for filter
  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch("/api/exams");
        if (res.ok) {
          const data = await res.json();
          setExams(data.exams || []);
        }
      } catch {
        // Ignore
      }
    }
    fetchExams();
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    if (!user || !groupId) return;
    setLbLoading(true);
    try {
      const params = examFilter ? `?examId=${examFilter}` : "";
      const res = await fetch(`/api/groups/${groupId}/leaderboard${params}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } else {
        setLeaderboard([]);
      }
    } catch {
      setLeaderboard([]);
    } finally {
      setLbLoading(false);
    }
  }, [user, groupId, examFilter]);

  useEffect(() => {
    if (group && activeTab === "leaderboard") {
      fetchLeaderboard();
    }
  }, [group, activeTab, fetchLeaderboard]);

  // Handle leave
  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    setLeaving(true);
    setLeaveError("");
    try {
      const res = await fetch("/api/groups/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/groups");
      } else {
        setLeaveError(data.error || "Failed to leave group");
      }
    } catch {
      setLeaveError("Network error");
    } finally {
      setLeaving(false);
    }
  };

  const selectedExamTitle = exams.find((e) => e._id === examFilter)?.title;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center animate-fade-in-up">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error || "Group Not Found"}
            </h2>
            <Button
              onClick={() => router.push("/groups")}
              className="mt-4 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 pt-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/groups")}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 truncate">
              <Users className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{group.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isTeacher && isMember && (
              <Button
                onClick={handleLeave}
                disabled={leaving}
                variant="outline"
                size="sm"
                className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                <span className="hidden sm:inline">Leave</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full">
        {/* Group Info Card */}
        <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h2>
                {isTeacher && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Teacher
                  </span>
                )}
              </div>

              {group.description && (
                <p className="text-sm text-gray-400 mt-1">{group.description}</p>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="text-gray-500">Code:</span>
                  <CopyCode text={group.code} />
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {group.teacherName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(group.createdAt)}
                </span>
              </div>

              {/* Teacher's prominent code display */}
              {isTeacher && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-medium mb-2 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    Share this join code with your students
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-mono font-bold tracking-[0.3em] text-gray-900 dark:text-white">
                      {group.code}
                    </span>
                    <CopyCode text={group.code} size="sm" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "info"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
            } focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
          >
            Members
          </button>
          {(isTeacher || isMember) && (
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "leaderboard"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
              } focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
            >
              <Trophy className="w-4 h-4 inline mr-1.5" />
              Leaderboard
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Members ({group.memberCount})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {group.members.length === 0 ? (
                <div className="glass-card rounded-xl p-6 text-center">
                  <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No members yet. Share the join code to get started!</p>
                </div>
              ) : (
                group.members.map((member) => (
                  <div
                    key={member.userId}
                    className="glass-card rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-400">
                        {member.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {member.username}
                        {member.userId === userId && (
                          <span className="text-xs text-emerald-400 ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Joined {formatDate(member.joinedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            {/* Exam filter */}
            <div className="mb-6 flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowExamDropdown(!showExamDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors min-w-[200px] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Filter className="w-4 h-4 text-emerald-400" />
                  <span className="flex-1 text-left truncate">{selectedExamTitle || "All Exams"}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showExamDropdown ? "rotate-180" : ""}`} />
                </button>
                {showExamDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] rounded-lg border border-gray-200 dark:border-white/10 bg-card shadow-xl z-50 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => { setExamFilter(""); setShowExamDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${!examFilter ? "text-emerald-400 bg-emerald-500/10" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      All Exams
                    </button>
                    {exams.map((exam) => (
                      <button
                        key={exam._id}
                        onClick={() => { setExamFilter(exam._id); setShowExamDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${examFilter === exam._id ? "text-emerald-400 bg-emerald-500/10" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {exam.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {lbLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="shimmer w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="shimmer h-4 w-32 rounded bg-gray-100 dark:bg-white/5" />
                        <div className="shimmer h-3 w-48 rounded bg-gray-100 dark:bg-white/5" />
                      </div>
                      <div className="shimmer h-6 w-12 rounded bg-gray-100 dark:bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Data Yet</h3>
                <p className="text-sm text-gray-400">Members need to take exams to appear on the leaderboard.</p>
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {top3.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry) => {
                      const style = getRankStyle(entry.rank);
                      const podiumOrder = entry.rank === 1 ? "sm:mt-0" : "sm:mt-8";
                      const RankIcon = style.icon;
                      const isCurrentUser = user?.username === entry.username;
                      return (
                        <div key={entry.rank} className={podiumOrder}>
                          <Card className={`${style.bg} border ${isCurrentUser ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : style.border} overflow-hidden transition-all`}>
                            <CardContent className="p-6 text-center">
                              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${style.bg}`}>
                                <RankIcon className={`w-7 h-7 ${style.text}`} />
                              </div>
                              <div className={`text-xs font-bold ${style.text} uppercase tracking-wider mb-1`}>
                                #{entry.rank}
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {isCurrentUser && <span className="text-emerald-400 text-xs font-normal block">You</span>}
                                {entry.username}
                              </h3>
                              <div className={`text-3xl font-bold ${getScoreColor(entry.avgScore)} mb-4`}>
                                {entry.avgScore}%
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-50 dark:bg-white/[0.03] rounded-lg p-2">
                                  <p className="text-gray-600 dark:text-gray-400">Exams</p>
                                  <p className="text-gray-900 dark:text-white font-bold">{entry.totalExams}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/[0.03] rounded-lg p-2">
                                  <p className="text-gray-600 dark:text-gray-400">Best</p>
                                  <p className="text-gray-900 dark:text-white font-bold">{entry.bestScore}%</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rest */}
                {rest.length > 0 && (
                  <div className="space-y-2">
                    {rest.map((entry) => {
                      const style = getRankStyle(entry.rank);
                      const isCurrentUser = user?.username === entry.username;
                      return (
                        <Card
                          key={entry.rank}
                          className={`${style.bg} border ${isCurrentUser ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : style.border} hover:border-gray-200 dark:hover:border-white/10 transition-all`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${style.bg} border ${style.border} ${style.text}`}>
                                  #{entry.rank}
                                </span>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {entry.username}
                                    {isCurrentUser && (
                                      <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">You</span>
                                    )}
                                  </h4>
                                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{entry.totalExams} exams</span>
                                    <span className="flex items-center gap-1"><Target className="w-3 h-3" />{entry.totalCorrect}/{entry.totalQuestions}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(entry.avgTime)} avg</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-xl font-bold ${getScoreColor(entry.avgScore)}`}>{entry.avgScore}%</span>
                                <p className="text-xs text-gray-400">avg</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Leave Error */}
        {leaveError && (
          <p className="text-sm text-red-400 mt-4">{leaveError}</p>
        )}
      </main>
    </div>
  );
}

// ─── Copy Code Component ──────────────────────────────────────
function CopyCode({ text, size = "default" }: { text: string; size?: "default" | "sm" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [text]);

  const sizeClass = size === "sm"
    ? "text-xs px-2 py-1"
    : "text-sm px-3 py-1.5";

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 ${sizeClass} rounded-md bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors font-mono tracking-wider font-bold focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {text}
        </>
      )}
    </button>
  );
}
