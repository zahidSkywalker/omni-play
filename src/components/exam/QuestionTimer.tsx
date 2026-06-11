"use client";

import { useEffect, useRef, useState } from "react";

interface QuestionTimerProps {
  timeLimit: number; // in seconds
  onTimeUp: () => void;
  onWarning?: (remaining: number) => void;
}

/**
 * Per-question circular countdown timer.
 * - Shows a small circular countdown in the question card header area.
 * - Warning flash at 30% remaining.
 * - Auto-calls onTimeUp when time expires.
 * - Uses a `key` prop pattern: parent should change the key when question changes to reset.
 */
export default function QuestionTimer({
  timeLimit,
  onTimeUp,
  onWarning,
}: QuestionTimerProps) {
  const [remaining, setRemaining] = useState(timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const onWarningRef = useRef(onWarning);
  const warningShownRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const timeLimitRef = useRef(timeLimit);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onWarningRef.current = onWarning;
  }, [onTimeUp, onWarning]);

  // Reset and start timer when timeLimit changes (via key change from parent)
  useEffect(() => {
    timeLimitRef.current = timeLimit;
    warningShownRef.current = false;

    if (timerRef.current) clearInterval(timerRef.current);

    // Set start time
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const rem = Math.max(0, timeLimitRef.current - elapsed);
      setRemaining(rem);

      // Warning at 30% remaining
      const warningThreshold = timeLimitRef.current * 0.3;
      if (rem <= warningThreshold && rem > 0 && !warningShownRef.current) {
        warningShownRef.current = true;
        onWarningRef.current?.(rem);
      }

      // Time up
      if (rem <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onTimeUpRef.current();
      }
    }, 200); // Update more frequently for smooth countdown

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLimit]);

  const percentage = (remaining / timeLimit) * 100;
  const isWarning = remaining <= timeLimit * 0.3 && remaining > 0;
  const isCritical = remaining <= timeLimit * 0.15 && remaining > 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}:${s.toString().padStart(2, "0")}`;
    return `${s}`;
  };

  const getTimerColor = () => {
    if (remaining <= 5) return "text-red-500";
    if (isCritical) return "text-amber-500";
    if (isWarning) return "text-orange-400";
    return "text-emerald-400";
  };

  const getStrokeColor = () => {
    if (remaining <= 5) return "#ef4444";
    if (isCritical) return "#f59e0b";
    if (isWarning) return "#fb923c";
    return "#10b981";
  };

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <div
      className={`flex items-center gap-1.5 glass-surface rounded-lg px-2.5 py-1.5 border border-white/10 ${isWarning ? "timer-warning" : ""}`}
      role="timer"
      aria-live="polite"
      aria-label={`Question timer: ${formatTime(remaining)} seconds remaining`}
    >
      {/* Circular countdown */}
      <svg className="w-8 h-8 -rotate-90 flex-shrink-0" viewBox="0 0 40 40">
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-200 ease-linear"
        />
      </svg>

      {/* Time text */}
      <span className={`text-sm font-mono font-bold tabular-nums ${getTimerColor()}`}>
        {formatTime(remaining)}
      </span>
    </div>
  );
}
