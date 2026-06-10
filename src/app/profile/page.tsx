"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  User,
  Trophy,
  Flame,
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  LogOut,
  ArrowLeft,
  Award,
  BookOpen,
  Star,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthProvider";
import { formatTime, getScoreColor } from "@/lib/format";
import type { IUser, ISubmissionWithExam } from "@/types";
import { BADGES, type BadgeDefinition } from "@/lib/badges";

function getBadgeBg(badge: BadgeDefinition) {
  switch (badge.id) {
    case "first_steps":
      return "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20";
    case "perfect_score":
      return "bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20";
    case "speed_demon":
      return "bg-cyan-100 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/20";
    case "scholar":
      return "bg-violet-100 dark:bg-violet-500/10 border-violet-300 dark:border-violet-500/20";
    case "excellence":
      return "bg-yellow-100 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/20";
    case "night_owl":
      return "bg-indigo-100 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/20";
    case "persistent":
      return "bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/20";
    case "veteran":
      return "bg-orange-100 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/20";
    default:
      return "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10";
  }
}

function ProfileContent() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [profileData, setProfileData] = useState<IUser | null>(null);
  const [submissions, setSubmissions] = useState<ISubmissionWithExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (!user) return;

    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfileData(data.user);
        setSubmissions(data.submissions || []);
      } catch (err) {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || "Unable to load profile"}</p>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const stats = profileData.stats;
  const avgScore = stats.totalExams > 0 ? Math.round(stats.totalScore / stats.totalExams) : 0;

  // Get badge data for user's earned badges
  const earnedBadges = (profileData.badges || []).map(
    (badgeId) => BADGES[badgeId]
  ).filter(Boolean);

  // Get locked badges (all badges minus earned)
  const lockedBadges = Object.values(BADGES).filter(
    (b) => !profileData.badges.includes(b.id)
  );

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">My Profile</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
        {/* User Info Card */}
        <Card className="glass-card border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-emerald-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{profileData.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-emerald-400">@{profileData.username}</span>
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 capitalize"
                  >
                    {profileData.provider}
                  </Badge>
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3" />
                  Member since{" "}
                  {new Date(profileData.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExams}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Exams</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-3">
                <Target className="w-5 h-5 text-teal-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Score</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bestScore}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Best Score</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <Flame className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.streak}</p>
                {stats.streak > 0 && <span className="text-lg">🔥</span>}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Achievements
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({earnedBadges.length}/{Object.keys(BADGES).length})
              </span>
            </h3>

            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {earnedBadges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] ${getBadgeBg(badge)}`}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {badge.name}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500">
                  No achievements yet. Take exams to earn badges!
                </p>
              </div>
            )}

            {/* Locked badges */}
            {lockedBadges.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  Locked Badges
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {lockedBadges.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className="p-4 rounded-xl border bg-gray-50 dark:bg-white/[0.02] border-gray-200/50 dark:border-white/5 text-center opacity-40 transition-opacity hover:opacity-60"
                    >
                      <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                      <p className="text-sm font-medium text-gray-400 truncate">
                        {badge.name}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Exam History */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-emerald-500" />
              Exam History
            </h3>

            {submissions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {submissions.map((sub, index) => (
                  <div
                    key={sub._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-400">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {sub.examTitle || "Unknown Exam"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {sub.correctAnswers}/{sub.totalQuestions} correct
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(sub.timeTaken)}
                        </span>
                        <span>
                          {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-2xl font-bold ${getScoreColor(sub.score)}`}
                      >
                        {sub.score}%
                      </span>
                      <Button
                        onClick={() => router.push(`/result/${sub._id}`)}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No exam history yet. Start taking exams!
                </p>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  Browse Exams
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedBadge?.icon}</span>
              <span className="text-gray-900 dark:text-white">{selectedBadge?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedBadge?.description}
            </p>
            <div className="flex items-center gap-2 text-xs">
              {profileData?.badges.includes(selectedBadge?.id || "") ? (
                <>
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-emerald-400">Earned!</span>
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">Locked</span>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
