"use client";

import Link from "next/link";
import { formatTime } from "@/lib/format";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Submission {
  _id: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  submittedAt: string;
  studentName?: string;
  username?: string;
  token?: string;
}

interface SubmissionTableProps {
  submissions: Submission[];
  examTitle: string;
}

function getScoreBadge(score: number) {
  if (score >= 80) return "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20";
  if (score >= 60) return "bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-500/20";
  if (score >= 40) return "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20";
  return "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20";
}

export default function SubmissionTable({
  submissions,
}: SubmissionTableProps) {
  if (submissions.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-500 dark:text-gray-400">
            No submissions yet for this exam.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Stats
  const avgScore =
    Math.round(
      submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length
    );
  const highestScore = Math.max(...submissions.map((s) => s.score));
  const lowestScore = Math.min(...submissions.map((s) => s.score));

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Score</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}%</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Highest</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{highestScore}%</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lowest</p>
            <p className="text-2xl font-bold text-red-400">{lowestScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">
                  #
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">
                  Student
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">
                  Score
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">
                  Correct
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">
                  Time
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">
                  Submitted
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => (
                <tr
                  key={sub._id}
                  className="border-b border-gray-200/50 dark:border-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">{sub.username || sub.studentName || "Anonymous"}</p>
                    {sub.token && (
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{sub.token}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getScoreBadge(
                        sub.score
                      )}`}
                    >
                      {sub.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {sub.correctAnswers}/{sub.totalQuestions}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(sub.timeTaken)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/result/${sub._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/10 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
