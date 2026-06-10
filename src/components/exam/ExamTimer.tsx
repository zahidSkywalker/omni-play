"use client";

import { useEffect, useRef, useState } from "react";

interface ExamTimerProps {
  durationSeconds: number;
  startTime: number;
  onTimeUp: () => void;
  onWarning?: (remaining: number) => void;
}

export default function ExamTimer({
  durationSeconds,
  startTime,
  onTimeUp,
  onWarning,
}: ExamTimerProps) {
  const warningShownRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const onWarningRef = useRef(onWarning);

  const getInitialRemaining = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  };

  const [remaining, setRemaining] = useState(getInitialRemaining);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
    onWarningRef.current = onWarning;
  }, [onTimeUp, onWarning]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const rem = Math.max(0, durationSeconds - elapsed);
      setRemaining(rem);

      // 30-second warning
      if (rem <= 30 && rem > 0 && !warningShownRef.current) {
        warningShownRef.current = true;
        onWarningRef.current?.(rem);
      }

      // Auto-submit
      if (rem <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onTimeUpRef.current();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durationSeconds, startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isWarning = remaining <= 30 && remaining > 0;
  const isCritical = remaining <= 60;

  const percentage = (remaining / durationSeconds) * 100;

  const getTimerColor = () => {
    if (remaining <= 10) return "text-red-600 dark:text-red-500";
    if (isWarning) return "text-amber-600 dark:text-amber-500";
    if (isCritical) return "text-orange-500 dark:text-orange-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const getBarColor = () => {
    if (remaining <= 10) return "bg-red-600 dark:bg-red-500";
    if (isWarning) return "bg-amber-600 dark:bg-amber-500";
    if (isCritical) return "bg-orange-500 dark:bg-orange-400";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  return (
    <div
      className={`flex items-center gap-3 ${isWarning ? "timer-warning" : ""}`}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formatTime(remaining)}`}
    >
      {/* Mobile: full-width timer bar above everything */}
      {/* Desktop: compact timer inline */}
      <div className="text-2xl sm:text-3xl font-mono font-bold tabular-nums whitespace-nowrap">
        <span className={getTimerColor()}>{formatTime(remaining)}</span>
      </div>
      <div className="hidden sm:block w-32 h-2 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Mobile: thin progress bar below timer text, visible on small screens */}
      <div className="sm:hidden flex-1 max-w-[80px] h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
