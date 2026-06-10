"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Shield,
  Plus,
  Users,
  Clock,
  HelpCircle,
  Eye,
  LogOut,
  ChevronRight,
  Settings,
  BarChart3,
  TrendingUp,
  Trophy,
  Target,
  BookOpen,
  UsersRound,
  Tag,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExamForm from "@/components/admin/ExamForm";
import SubmissionTable from "@/components/admin/SubmissionTable";
import QuestionBankManager from "@/components/admin/QuestionBankManager";
import GroupManager from "@/components/admin/GroupManager";
import TopicManager from "@/components/admin/TopicManager";
import PostManager from "@/components/admin/PostManager";
import { NotificationBanner } from "@/components/ui/notification-banner";
import type { ExamSummary } from "@/types";

interface Submission {
  _id: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  submittedAt: string;
  studentName?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Data states
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<{
    totalUsers: number;
    totalExams: number;
    totalSubmissions: number;
    passRate: number;
    failRate: number;
    avgScore: number;
    mostPopularExam: string;
    trend: { date: string; count: number }[];
    examStats: {
      examTitle: string;
      submissions: number;
      avgScore: number;
      avgTime: number;
      passRate: number;
    }[];
    topScorers: {
      rank: number;
      username: string;
      examTitle: string;
      score: number;
      date: string;
    }[];
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // View state
  const [activeTab, setActiveTab] = useState<"exams" | "create" | "submissions" | "analytics" | "questionbank" | "groups" | "topics" | "posts">("exams");
  const [tabKey, setTabKey] = useState(0);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const handleAuth = async () => {
    if (!tokenInput.trim()) {
      setAuthError("Please enter your admin token.");
      return;
    }
    setAuthError("");
    try {
      // Verify token against server — token is never hardcoded in client
      const res = await fetch("/api/admin/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setAuthed(true);
      } else {
        setAuthError("Invalid token. Access denied.");
      }
    } catch {
      setAuthError("Failed to verify token. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Silently fail
    }
    setAuthed(false);
    hasFetchedRef.current = false;
  };

  // Check admin auth status via httpOnly cookie on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/status");
        const data = await res.json();
        setAuthed(data.authenticated === true);
      } catch {
        setAuthed(false);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);
  useEffect(() => {
    if (!authed || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function doFetch() {
      try {
        const res = await fetch("/api/admin/exams");
        const data = await res.json();
        if (data.exams) setExams(data.exams);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      } finally {
        setLoading(false);
      }
    }
    doFetch();
  }, [authed]);

  // Refresh exams after create
  const refreshExams = () => {
    async function doRefresh() {
      try {
        const res = await fetch("/api/admin/exams");
        const data = await res.json();
        if (data.exams) setExams(data.exams);
      } catch (err) {
        console.error("Failed to refresh exams:", err);
      }
    }
    doRefresh();
  };

  // Fetch submissions
  const fetchSubmissions = async (examId: string) => {
    setSubmissionsLoading(true);
    setSelectedExamId(examId);
    setActiveTab("submissions");
    setTabKey((k) => k + 1);
    try {
      const res = await fetch(`/api/admin/exams/${examId}/submissions`);
      const data = await res.json();
      if (data.submissions) setSubmissions(data.submissions);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Create exam
  const handleCreateExam = async (data: {
    title: string;
    description: string;
    duration: number;
    questions: unknown[];
  }) => {
    setCreating(true);
    setCreateSuccess(false);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create exam");
      }

      setCreateSuccess(true);
      refreshExams();
      setActiveTab("exams");
      setTabKey((k) => k + 1);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create exam");
    } finally {
      setCreating(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleTabChange = (tab: "exams" | "create" | "submissions" | "analytics" | "questionbank" | "groups" | "topics" | "posts") => {
    setActiveTab(tab);
    setTabKey((k) => k + 1);
    if (tab === "analytics" && !analytics) {
      fetchAnalytics();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20";
      case "closed":
        return "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20";
      case "draft":
        return "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/20";
      default:
        return "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/20";
    }
  };

  // Auth loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Auth screen
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Admin Access</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter your admin token to continue
              </p>

              <div className="space-y-3">
                <Input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    setAuthError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  placeholder="Admin token..."
                  className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500/50 text-center"
                />
                {authError && (
                  <p className="text-xs text-red-400">{authError}</p>
                )}
                <Button
                  onClick={handleAuth}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Authenticate
                </Button>
              </div>

              <button
                onClick={() => router.push("/")}
                className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-2 py-1"
              >
                ← Back to Home
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-surface border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-emerald-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              ← Home
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="gap-1.5 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-border px-4">
        <div className="max-w-7xl mx-auto flex gap-0">
          {[
            { id: "exams" as const, label: "All Exams", icon: HelpCircle },
            { id: "create" as const, label: "Create Exam", icon: Plus },
            { id: "questionbank" as const, label: "Question Bank", icon: BookOpen },
            { id: "groups" as const, label: "Groups", icon: UsersRound },
            { id: "topics" as const, label: "Topics", icon: Tag },
            { id: "posts" as const, label: "Posts", icon: FileText },
            { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          {activeTab === "submissions" && (
            <button
              onClick={() => handleTabChange("exams")}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-emerald-500 text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Users className="w-4 h-4" />
              Submissions
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        {/* CSS transitions for tab changes (replaces framer-motion AnimatePresence) */}
        <div key={tabKey} className="tab-enter">
          {/* Exams List */}
          {activeTab === "exams" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center py-20">
                  <HelpCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No exams created yet.</p>
                  <Button
                    onClick={() => handleTabChange("create")}
                    className="mt-4 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Exam
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {createSuccess && (
                    <NotificationBanner
                      message="Exam created successfully!"
                      variant="success"
                      onDismiss={() => setCreateSuccess(false)}
                      className="mb-4"
                    />
                  )}

                  {createError && (
                    <NotificationBanner
                      message={createError}
                      variant="error"
                      onDismiss={() => setCreateError(null)}
                      className="mb-4"
                    />
                  )}

                  {exams.map((exam) => (
                    <Card
                      key={exam._id}
                      className="glass-card hover:border-gray-200 dark:hover:border-white/10 transition-colors"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {exam.title}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${getStatusBadge(exam.status)}`}
                              >
                                {exam.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                              {exam.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" />
                                {exam.questionCount} questions
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {exam.duration}m
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {exam.totalSubmissions} submissions
                              </span>
                              <span>
                                {new Date(exam.createdAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric", year: "numeric" }
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => fetchSubmissions(exam._id)}
                              variant="outline"
                              size="sm"
                              className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              <Eye className="w-3 h-3" />
                              View Submissions
                            </Button>
                            <Button
                              onClick={() =>
                                window.open(`/exam/${exam._id}`, "_blank")
                              }
                              variant="outline"
                              size="sm"
                              className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              Preview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Create Exam */}
          {activeTab === "create" && (
            <div className="max-w-3xl">
              <ExamForm onSubmit={handleCreateExam} loading={creating} />
            </div>
          )}

          {/* Question Bank */}
          {activeTab === "questionbank" && (
            <QuestionBankManager />
          )}

          {/* Groups */}
          {activeTab === "groups" && (
            <GroupManager />
          )}

          {/* Topics */}
          {activeTab === "topics" && (
            <TopicManager adminToken="" />
          )}

          {/* Posts */}
          {activeTab === "posts" && (
            <PostManager adminToken="" />
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <>
              {analyticsLoading || !analytics ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="glass-card">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalUsers}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/10 border border-teal-300 dark:border-teal-500/20 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-teal-600 dark:text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalExams}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Exams</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalSubmissions}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Submissions</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.passRate}%</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Pass Rate</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="glass-card">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analytics.avgScore}%</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fail Rate</p>
                        <p className="text-2xl font-bold text-red-400 mt-1">{analytics.failRate}%</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-card">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Most Popular Exam</p>
                        <p className="text-lg font-bold text-emerald-400 mt-1 truncate">{analytics.mostPopularExam}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Submission Trend Bar Chart */}
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Submission Trend (Last 7 Days)
                      </h3>
                      <div className="flex items-end gap-2 sm:gap-4 h-48">
                        {analytics.trend.map((day) => {
                          const maxCount = Math.max(...analytics.trend.map((d) => d.count), 1);
                          const heightPct = (day.count / maxCount) * 100;
                          const dayLabel = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "short",
                          });
                          return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">{day.count}</span>
                              <div
                                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-500 transition-all min-h-[4px]"
                                style={{ height: `${Math.max(heightPct, 3)}%` }}
                              />
                              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{dayLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Exam Stats Table */}
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Exam Performance</h3>
                      {analytics.examStats.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-white/10">
                                <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Exam</th>
                                <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Submissions</th>
                                <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Avg Score</th>
                                <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Pass Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.examStats.map((stat, i) => (
                                <tr key={i} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                  <td className="py-3 px-2 text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{stat.examTitle}</td>
                                  <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-300">{stat.submissions}</td>
                                  <td className={`py-3 px-2 text-right font-bold ${stat.avgScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : stat.avgScore >= 60 ? "text-teal-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>{stat.avgScore}%</td>
                                  <td className={`py-3 px-2 text-right font-bold ${stat.passRate >= 70 ? "text-emerald-600 dark:text-emerald-400" : stat.passRate >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{stat.passRate}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No data available</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Top 10 Scorers */}
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        Top 10 Scorers (All-Time Best)
                      </h3>
                      {analytics.topScorers.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-white/10">
                                <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium w-16">Rank</th>
                                <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">User</th>
                                <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Exam</th>
                                <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Score</th>
                                <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {analytics.topScorers.map((scorer) => (
                                <tr key={scorer.rank} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                  <td className="py-3 px-2">
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                                      scorer.rank === 1 ? "bg-amber-500 text-amber-950" : scorer.rank === 2 ? "bg-gray-400 text-gray-900" : scorer.rank === 3 ? "bg-orange-700 text-orange-950" : "bg-white/10 text-gray-400"
                                    }`}>
                                      #{scorer.rank}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-gray-900 dark:text-white font-medium">{scorer.username}</td>
                                  <td className="py-3 px-2 text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{scorer.examTitle}</td>
                                  <td className={`py-3 px-2 text-right font-bold ${scorer.score >= 80 ? "text-emerald-600 dark:text-emerald-400" : scorer.score >= 60 ? "text-teal-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>{scorer.score}%</td>
                                  <td className="py-3 px-2 text-right text-gray-500 dark:text-gray-400">{scorer.date}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No submissions yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Submissions */}
          {activeTab === "submissions" && (
            <>
              {submissionsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <SubmissionTable
                  submissions={submissions}
                  examTitle={
                    exams.find((e) => e._id === selectedExamId)?.title || ""
                  }
                />
              )}

              <div className="mt-4">
                <Button
                  onClick={() => handleTabChange("exams")}
                  variant="outline"
                  className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  ← Back to Exams
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
