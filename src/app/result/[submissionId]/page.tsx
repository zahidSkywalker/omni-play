"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Home,
  Printer,
  Download,
  Target,
  Award,
} from "lucide-react";
import { Share2, MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CertificateView } from "@/components/exam/CertificateView";
import CommentSection from "@/components/exam/CommentSection";
import { formatTime, getScoreColor } from "@/lib/format";

interface ResultQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface ResultData {
  _id: string;
  examId: string;
  examTitle: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  submittedAt: string;
  studentName?: string;
  questions: ResultQuestion[];
}

function getScoreGradient(score: number) {
  if (score >= 80) return "from-emerald-500 to-teal-500";
  if (score >= 60) return "from-teal-500 to-cyan-500";
  if (score >= 40) return "from-amber-500 to-orange-500";
  return "from-red-500 to-orange-500";
}

function getScoreMessage(score: number) {
  if (score >= 90) return "Outstanding!";
  if (score >= 80) return "Excellent!";
  if (score >= 70) return "Great Job!";
  if (score >= 60) return "Good Effort!";
  if (score >= 40) return "Keep Practicing!";
  return "Don't Give Up!";
}

export default function ResultPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);
  const router = useRouter();

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/results/${submissionId}`);
        if (!res.ok) {
          throw new Error("Result not found");
        }
        const data = await res.json();
        setResult(data);
      } catch {
        setError("Failed to load result. It may not exist.");
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const wrongAnswers = result.totalQuestions - result.correctAnswers;
  const unansweredCount = result.answers.filter((a) => a === -1).length;
  const answeredCorrectly = result.correctAnswers;
  const answeredWrong = result.totalQuestions - unansweredCount - result.correctAnswers;
  const scoreColor = getScoreColor(result.score);
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference * (1 - result.score / 100);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {result.examTitle}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.open(`/api/results/${submissionId}/export`, "_blank")}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        {/* Score Card */}
        <div className="mb-8 animate-fade-in-up">
          <Card className="glass-card overflow-hidden">
            <div className={`bg-gradient-to-r ${getScoreGradient(result.score)} p-[2px]`}>
              <div className="bg-card rounded-[calc(0.75rem-2px)] p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Score circle — CSS animated */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        className="stroke-gray-200 dark:stroke-white/[0.05]"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="score-ring"
                      />
                      <defs>
                        <linearGradient id="scoreGradient">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${scoreColor}`}>
                        {result.score}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Score</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 text-center sm:text-left">
                    {result.studentName && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {result.studentName}
                      </p>
                    )}
                    <h2 className={`text-2xl font-bold mb-1 ${scoreColor}`}>
                      {getScoreMessage(result.score)}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {result.correctAnswers}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Correct</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {wrongAnswers}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Wrong</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {result.totalQuestions}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-500" />
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatTime(result.timeTaken)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bar Chart */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Score Breakdown</h4>
                  <div className="flex rounded-lg overflow-hidden h-8 score-bar-container">
                    <div
                      className="score-bar-fill bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center"
                      style={{
                        width: `${(answeredCorrectly / result.totalQuestions) * 100}%`,
                        minWidth: answeredCorrectly > 0 ? "2rem" : "0",
                      }}
                    >
                      <span className="text-xs font-bold text-gray-900 dark:text-white drop-shadow-sm">
                        {answeredCorrectly > 0 ? answeredCorrectly : ""}
                      </span>
                    </div>
                    <div
                      className="score-bar-fill bg-gradient-to-r from-red-500 to-red-400 flex items-center justify-center"
                      style={{
                        width: `${(answeredWrong / result.totalQuestions) * 100}%`,
                        minWidth: answeredWrong > 0 ? "2rem" : "0",
                      }}
                    >
                      <span className="text-xs font-bold text-gray-900 dark:text-white drop-shadow-sm">
                        {answeredWrong > 0 ? answeredWrong : ""}
                      </span>
                    </div>
                    <div
                      className="score-bar-fill bg-gray-500 flex items-center justify-center"
                      style={{
                        width: `${(unansweredCount / result.totalQuestions) * 100}%`,
                        minWidth: unansweredCount > 0 ? "2rem" : "0",
                      }}
                    >
                      <span className="text-xs font-bold text-gray-900 dark:text-white drop-shadow-sm">
                        {unansweredCount > 0 ? unansweredCount : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                      Correct ({answeredCorrectly})
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                      Wrong ({answeredWrong})
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-gray-500" />
                      Unanswered ({unansweredCount})
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Submitted:{" "}
                  {new Date(result.submittedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Review */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-[family-name:var(--font-cinzel)]">
            Question Review
          </h3>

          <div className="space-y-6">
            {result.questions.map((q, i) => {
              const userAnswer = result.answers[i];
              const isCorrect = userAnswer === q.correctAnswer;
              const optionLabels = ["A", "B", "C", "D"];

              return (
                <Card
                  key={i}
                  className={`border-border ${
                    isCorrect ? "bg-emerald-50 dark:bg-emerald-500/5" : "bg-red-50 dark:bg-red-500/5"
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Question header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-sm font-bold">
                          {i + 1}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isCorrect
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Incorrect
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Question text */}
                    <p className="text-gray-900 dark:text-white mb-4 whitespace-pre-wrap">
                      {q.question}
                    </p>

                    {/* Options */}
                    <div className="space-y-2">
                      {q.options.map((option, j) => {
                        const isCorrectOption = j === q.correctAnswer;
                        const isUserAnswer = j === userAnswer;
                        const isWrong =
                          isUserAnswer && !isCorrectOption;

                        let style =
                          "bg-gray-50 dark:bg-white/[0.02] border-border text-gray-500 dark:text-gray-400";
                        if (isCorrectOption) {
                          style =
                            "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                        }
                        if (isWrong) {
                          style =
                            "bg-red-500/10 border-red-500/30 text-red-300";
                        }

                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${style}`}
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-white/5">
                              {optionLabels[j]}
                            </span>
                            <span className="text-sm whitespace-pre-wrap">
                              {option}
                            </span>
                            {isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                            )}
                            {isWrong && (
                              <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-gray-600 dark:text-gray-300">
                            Explanation:{" "}
                          </span>
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    {/* Unanswered indicator */}
                    {userAnswer === -1 && (
                      <p className="mt-3 text-xs text-amber-400/70">
                        Not answered
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Certificate Section */}
        {result.score >= 60 && (
          <div className="mt-8 mb-4">
            <Card className="glass-card border-emerald-500/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Congratulations! You Passed! 🎉
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Download your certificate of achievement
                </p>
                <div className="flex justify-center">
                  <CertificateView submissionId={submissionId} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Social Share Section */}
        <div className="mt-8 mb-4 animate-fade-in-up">
          <Card className="glass-card border-emerald-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share Your Result</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Challenge your friends and share your achievement!
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  onClick={() => {
                    const text = `I scored ${result.score}% on ${result.examTitle}! Test your knowledge at ${shareUrl}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  variant="outline"
                  className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/30 hover:text-[#1DA1F2] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Share2 className="w-4 h-4" />
                  Twitter/X
                </Button>
                <Button
                  onClick={() => {
                    const text = `I scored ${result.score}% on ${result.examTitle}!`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`, "_blank");
                  }}
                  variant="outline"
                  className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 hover:text-[#1877F2] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Share2 className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  onClick={() => {
                    const message = `🏆 Exam Result\n📚 ${result.examTitle}\n📊 Score: ${result.score}% (${result.correctAnswers}/${result.totalQuestions} correct)\n🔗 ${shareUrl}`;
                    navigator.clipboard.writeText(message);
                  }}
                  variant="outline"
                  className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-[#5865F2]/10 hover:border-[#5865F2]/30 hover:text-[#5865F2] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <MessageCircle className="w-4 h-4" />
                  Discord
                </Button>
                <Button
                  onClick={() => {
                    const text = `I scored ${result.score}% on ${result.examTitle}!\nCorrect: ${result.correctAnswers}/${result.totalQuestions}\nTime: ${formatTime(result.timeTaken)}\n${shareUrl}`;
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  variant="outline"
                  className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy Result"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Discussion Section */}
        <div className="mt-8 mb-4">
          <CommentSection examId={result.examId} />
        </div>

        {/* Back button */}
        <div className="mt-4 mb-8 text-center">
          <Button
            onClick={() => router.push("/")}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Trophy className="w-4 h-4" />
            Take Another Exam
          </Button>
        </div>
      </main>
    </div>
  );
}
