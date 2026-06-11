"use client";

import { cn } from "@/lib/utils";
import type { IQuestion } from "@/types";

interface QuestionCardProps {
  question: IQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelect: (optionIndex: number) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelect,
}: QuestionCardProps) {
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 hover-lift no-select">
      {/* Question header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
          {questionNumber}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          of {totalQuestions} questions
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-8 leading-relaxed whitespace-pre-wrap">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-3" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === i;

          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${optionLabels[i]}: ${option}`}
              onClick={() => onSelect(i)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4",
                "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                isSelected
                  ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-500/40 text-gray-900 dark:text-white scale-[1.01] shadow-lg shadow-emerald-500/5"
                  : "bg-gray-50 dark:bg-white/[0.02] border-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:border-gray-300 dark:hover:border-white/15"
              )}
            >
              {/* Radio indicator */}
              <span
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500 shadow-md shadow-emerald-500/30"
                    : "border-gray-300 dark:border-white/20"
                )}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>

              {/* Option label + text */}
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200",
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                  )}
                >
                  {optionLabels[i]}
                </span>
                <span className="text-sm sm:text-base leading-relaxed pt-0.5 whitespace-pre-wrap">
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
