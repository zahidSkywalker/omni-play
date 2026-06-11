"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface QuestionNavProps {
  totalQuestions: number;
  currentIndex: number;
  answers: (number | null)[];
  onJump: (index: number) => void;
}

export default function QuestionNav({
  totalQuestions,
  currentIndex,
  answers,
  onJump,
}: QuestionNavProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const answeredCount = answers.filter((a) => a !== null && a !== undefined).length;

  return (
    <>
      {/* Mobile: Bottom Sheet Trigger + Preview */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Trigger bar */}
        <button
          onClick={() => setSheetOpen(!sheetOpen)}
          className="w-full glass-surface border-t border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between"
          aria-label={sheetOpen ? "Close question navigation" : "Open question navigation"}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400">{answeredCount}/{totalQuestions}</span>
            </div>
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300"
                style={{
                  width: `${(answeredCount / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="text-xs">Q{currentIndex + 1}</span>
            {sheetOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </div>
        </button>

        {/* Sheet content */}
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[-1]"
              onClick={() => setSheetOpen(false)}
            />
            <div className="glass-surface border-t border-gray-200 dark:border-white/10 max-h-[50vh] overflow-y-auto p-4 bottom-sheet-enter">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Questions
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
                    Answered
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-white/10" />
                    Unanswered
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => {
                  const isAnswered = answers[i] !== null && answers[i] !== undefined;
                  const isCurrent = i === currentIndex;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        onJump(i);
                        setSheetOpen(false);
                      }}
                      aria-label={`Go to question ${i + 1}`}
                      className={cn(
                        "w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                        isCurrent &&
                          "ring-2 ring-emerald-500 ring-offset-2 ring-offset-card",
                        isAnswered &&
                          !isCurrent &&
                          "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-500/30",
                        !isAnswered &&
                          !isCurrent &&
                          "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10",
                        isCurrent && isAnswered && "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-200",
                        isCurrent && !isAnswered && "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-white/5">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                  <span>Overall Progress</span>
                  <span>{answeredCount} / {totalQuestions}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300"
                    style={{
                      width: `${(answeredCount / totalQuestions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop: Sidebar Question Navigation (existing behavior) */}
      <div className="hidden lg:block">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Questions
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
                Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-white/10" />
                Unanswered
              </span>
            </div>
          </div>

          <div className="grid grid-cols-8 gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const isAnswered = answers[i] !== null && answers[i] !== undefined;
              const isCurrent = i === currentIndex;

              return (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  aria-label={`Go to question ${i + 1}`}
                  className={cn(
                    "w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    isCurrent &&
                      "ring-2 ring-emerald-500 ring-offset-2 ring-offset-card",
                    isAnswered &&
                      !isCurrent &&
                      "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-500/30",
                    !isAnswered &&
                      !isCurrent &&
                      "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10",
                    isCurrent && isAnswered && "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-200",
                    isCurrent && !isAnswered && "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-300"
                style={{
                  width: `${(answeredCount / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
