"use client";

import Link from "next/link";
import { Clock, HelpCircle, ArrowRight, Users, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import type { ExamSummary } from "@/types";

interface ExamCardProps {
  exam: ExamSummary;
  index: number;
  isBookmarked?: boolean;
  onToggleBookmark?: (examId: string) => void;
  onLoginRequired?: () => void;
}

const accentColors = [
  { stripe: "bg-emerald-500", hoverBorder: "hover:border-emerald-500/30", shadowColor: "hover:shadow-emerald-500/20" },
  { stripe: "bg-teal-500", hoverBorder: "hover:border-teal-500/30", shadowColor: "hover:shadow-teal-500/20" },
  { stripe: "bg-cyan-500", hoverBorder: "hover:border-cyan-500/30", shadowColor: "hover:shadow-cyan-500/20" },
];

export default function ExamCard({ exam, index, isBookmarked, onToggleBookmark, onLoginRequired }: ExamCardProps) {
  const { user } = useAuth();

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${minutes}m`;
  };

  const isNew = (createdAt: string) => {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  const accent = accentColors[index % accentColors.length];

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      onLoginRequired?.();
      return;
    }
    onToggleBookmark?.(exam._id);
  };

  return (
    <>
      <div>
        <Card className={`group relative overflow-hidden glass-card card-hover-gradient transition-all duration-300 ${accent.hoverBorder} emerald-glow-hover hover:-translate-y-1 hover-lift`}>
          {/* Colored left accent stripe */}
          <div className={`absolute top-0 left-0 w-[3px] h-full ${accent.stripe} rounded-r-full`} />

          {/* Decorative dot — top-right corner */}
          <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${accent.stripe} opacity-40 group-hover:opacity-70 transition-opacity duration-300`} />

          {/* Gradient top border on hover */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Shine overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

          <CardContent className="p-6 pl-7">
            {/* Status badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                  Active
                </span>
                {isNew(exam.createdAt) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 pulse-border">
                    NEW
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(exam.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Title + Bookmark */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {exam.title}
              </h3>
              <button
                onClick={handleBookmarkClick}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark
                  className={`w-4 h-4 transition-colors ${
                    isBookmarked
                      ? "text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`}
                />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2">
              {exam.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-5 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <HelpCircle className="w-4 h-4 text-emerald-500/70" />
                <span>{exam.questionCount} Questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 text-teal-500/70" />
                <span>{formatDuration(exam.duration)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4 text-cyan-500/70" />
                <span>{exam.totalSubmissions}</span>
              </div>
            </div>

            {/* Start Button — enhanced gradient */}
            <Link
              href={`/exam/${exam._id}`}
              className={`inline-flex items-center gap-2 w-full justify-center px-5 py-3 rounded-xl text-gray-900 dark:text-white font-medium transition-all duration-500 hover:shadow-lg ${accent.shadowColor} shine-effect btn-glow focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                index % 3 === 0
                  ? "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-cyan-500"
                  : index % 3 === 1
                  ? "bg-gradient-to-r from-teal-600/90 to-cyan-600/90 hover:from-teal-500 hover:to-emerald-500"
                  : "bg-gradient-to-r from-cyan-600/90 to-emerald-600/90 hover:from-cyan-500 hover:to-teal-500"
              }`}
            >
              Start Exam
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>

    </>
  );
}
