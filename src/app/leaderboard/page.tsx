"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Home,
  Medal,
  Clock,
  Target,
  BookOpen,
  Crown,
  TrendingUp,
  Search,
  ChevronDown,
  User,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { formatTime, getScoreColor } from "@/lib/format";

interface ExamOption {
  _id: string;
  title: string;
}

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

function getRankStyle(rank: number) {
  if (rank === 1) return { bg: "bg-amber-100 dark:bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-500 text-amber-950", icon: Crown };
  if (rank === 2) return { bg: "bg-gray-400/10", border: "border-gray-400/30", text: "text-gray-700 dark:text-gray-300", badge: "bg-gray-400 text-gray-900", icon: Medal };
  if (rank === 3) return { bg: "bg-orange-700/10", border: "border-orange-700/30", text: "text-orange-400", badge: "bg-orange-700 text-orange-950", icon: Medal };
  return { bg: "bg-white/[0.02]", border: "border-gray-200/50 dark:border-white/[0.06]", text: "text-gray-600 dark:text-gray-400", badge: "bg-white/10 text-gray-300", icon: TrendingUp };
}

const PAGE_SIZE = 50;

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showExamDropdown, setShowExamDropdown] = useState(false);

  // Fetch available exams for filter dropdown
  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch("/api/exams");
        if (res.ok) {
          const data = await res.json();
          setExams(data.exams || []);
        }
      } catch {
        // Ignore — dropdown will just show "All Exams"
      }
    }
    fetchExams();
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setVisibleCount(PAGE_SIZE);
      try {
        const params = examFilter ? `?examId=${examFilter}` : "";
        const res = await fetch(`/api/leaderboard${params}`);
        const data = await res.json();
        const entries: LeaderboardEntry[] = (data.leaderboard || []).map(
          (e: Record<string, unknown>, i: number) => ({
            rank: i + 1,
            ...e,
          })
        );
        setLeaderboard(entries);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [examFilter]);

  // Filter by search
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    const q = searchQuery.toLowerCase();
    return leaderboard.filter((e) =>
      e.username.toLowerCase().includes(q)
    );
  }, [leaderboard, searchQuery]);

  const top3 = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);
  const visibleRest = rest.slice(0, visibleCount - 3);
  const hasMore = rest.length > visibleCount - 3;

  const selectedExamTitle = exams.find((e) => e._id === examFilter)?.title;

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-6 pt-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-[family-name:var(--font-cinzel)]">
                <span className="gradient-text">Leaderboard</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Compete & climb the ranks</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-6xl mx-auto w-full">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Exam filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExamDropdown(!showExamDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors min-w-[200px] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400" />
              <span className="flex-1 text-left truncate">
                {selectedExamTitle || "All Exams"}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showExamDropdown ? "rotate-180" : ""}`} />
            </button>
            {showExamDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] rounded-lg border border-gray-200 dark:border-white/10 bg-card shadow-xl z-50 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setExamFilter("");
                    setShowExamDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${!examFilter ? "text-emerald-400 bg-emerald-500/10" : "text-gray-700 dark:text-gray-300"}`}
                >
                  All Exams
                </button>
                {exams.map((exam) => (
                  <button
                    key={exam._id}
                    onClick={() => {
                      setExamFilter(exam._id);
                      setShowExamDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${examFilter === exam._id ? "text-emerald-400 bg-emerald-500/10" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {exam.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="pl-9 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 text-sm"
            />
          </div>

          {(examFilter || searchQuery) && (
            <Button
              onClick={() => {
                setExamFilter("");
                setSearchQuery("");
              }}
              variant="outline"
              size="sm"
              className="text-xs text-gray-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-8">
            {/* Skeleton podium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`glass-card rounded-2xl p-6 space-y-4 ${i === 1 ? "sm:mt-8" : ""}`}
                >
                  <div className="shimmer w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 mx-auto" />
                  <div className="shimmer h-3 w-16 rounded bg-gray-100 dark:bg-white/5 mx-auto" />
                  <div className="shimmer h-5 w-24 rounded bg-gray-100 dark:bg-white/5 mx-auto" />
                  <div className="shimmer h-8 w-16 rounded bg-gray-100 dark:bg-white/5 mx-auto" />
                  <div className="flex gap-2 justify-center">
                    <div className="shimmer h-10 w-16 rounded-lg bg-gray-100 dark:bg-white/5" />
                    <div className="shimmer h-10 w-16 rounded-lg bg-gray-100 dark:bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
            {/* Skeleton rows */}
            <div className="space-y-2">
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
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
              {searchQuery ? "No matching users found" : "No Data Yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "Try a different search term"
                : "Take some exams to appear on the leaderboard!"}
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium — Desktop */}
            <div className="hidden sm:block">
              {top3.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry) => {
                    const style = getRankStyle(entry.rank);
                    const podiumOrder =
                      entry.rank === 1 ? "sm:mt-0" : "sm:mt-8";
                    const RankIcon = style.icon;
                    const isCurrentUser =
                      user && user.username === entry.username;
                    return (
                      <div key={entry.rank} className={podiumOrder}>
                        <Card
                          className={`${style.bg} border ${isCurrentUser ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : style.border} overflow-hidden transition-all`}
                        >
                          <CardContent className="p-6 text-center">
                            <div
                              className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${style.bg}`}
                            >
                              <RankIcon
                                className={`w-7 h-7 ${style.text}`}
                              />
                            </div>
                            <div
                              className={`text-xs font-bold ${style.text} uppercase tracking-wider mb-1`}
                            >
                              Rank #
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ml-1 ${style.badge}`}
                              >
                                {entry.rank}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                              {isCurrentUser && (
                                <span className="text-emerald-400 text-xs font-normal block">
                                  ⭐ You
                                </span>
                              )}
                              {entry.username}
                            </h3>
                            <div
                              className={`text-3xl font-bold ${getScoreColor(entry.avgScore)} mb-4`}
                            >
                              {entry.avgScore}%
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-50 dark:bg-white/[0.03] rounded-lg p-2">
                                <p className="text-gray-600 dark:text-gray-400">Exams</p>
                                <p className="text-gray-900 dark:text-white font-bold">
                                  {entry.totalExams}
                                </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-white/[0.03] rounded-lg p-2">
                                <p className="text-gray-600 dark:text-gray-400">Best</p>
                                <p className="text-gray-900 dark:text-white font-bold">
                                  {entry.bestScore}%
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top 3 Podium — Mobile cards */}
            <div className="sm:hidden space-y-3 mb-6">
              {top3.map((entry) => {
                const style = getRankStyle(entry.rank);
                const isCurrentUser =
                  user && user.username === entry.username;
                return (
                  <Card
                    key={entry.rank}
                    className={`${style.bg} border ${isCurrentUser ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : style.border}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold ${style.badge}`}
                        >
                          #{entry.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {entry.username}
                            </h4>
                            {isCurrentUser && (
                              <span className="text-emerald-400 text-xs">
                                ⭐
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>
                              {entry.totalExams} exams
                            </span>
                            <span>
                              Best: {entry.bestScore}%
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-xl font-bold ${getScoreColor(entry.avgScore)}`}
                        >
                          {entry.avgScore}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Rest of leaderboard — Desktop table */}
            {visibleRest.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Full Rankings
                </h3>
                {/* Desktop rows */}
                <div className="hidden sm:block space-y-2">
                  {visibleRest.map((entry) => {
                    const style = getRankStyle(entry.rank);
                    const isCurrentUser =
                      user && user.username === entry.username;
                    return (
                      <Card
                        key={entry.rank}
                        className={`${style.bg} border ${isCurrentUser ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : style.border} hover:border-gray-200 dark:hover:border-white/10 transition-all`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${style.bg} border ${style.border} ${style.text}`}
                              >
                                #{entry.rank}
                              </span>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  {entry.username}
                                  {isCurrentUser && (
                                    <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                      ⭐ You
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {entry.totalExams} exams
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {entry.totalCorrect}/
                                    {entry.totalQuestions} correct
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(entry.avgTime)} avg
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span
                                  className={`text-xl font-bold ${getScoreColor(entry.avgScore)}`}
                                >
                                  {entry.avgScore}%
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">avg</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {visibleRest.map((entry) => {
                    const style = getRankStyle(entry.rank);
                    const isCurrentUser =
                      user && user.username === entry.username;
                    return (
                      <Card
                        key={entry.rank}
                        className={`${style.bg} border ${isCurrentUser ? "border-emerald-500/60 ring-1 ring-emerald-500/30" : style.border}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${style.badge}`}
                            >
                              #{entry.rank}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                                  {entry.username}
                                </h4>
                                {isCurrentUser && (
                                  <span className="text-emerald-400 text-xs">
                                    ⭐
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{entry.totalExams} exams</span>
                                <span>·</span>
                                <span>
                                  {entry.totalCorrect}/
                                  {entry.totalQuestions}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-lg font-bold ${getScoreColor(entry.avgScore)}`}
                            >
                              {entry.avgScore}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={() =>
                        setVisibleCount((prev) => prev + PAGE_SIZE)
                      }
                      variant="outline"
                      className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Load More
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Showing {Math.min(visibleCount, filteredLeaderboard.length)} of{" "}
                      {filteredLeaderboard.length} entries
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
