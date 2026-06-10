// ─── Badge Definitions and Unlock Logic ────────────────────────────────────

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  color: string; // tailwind text color class
}

export const BADGES: Record<string, BadgeDefinition> = {
  first_steps: {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first exam",
    icon: "🎯",
    color: "text-emerald-400",
  },
  perfect_score: {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Score 100% on any exam",
    icon: "💯",
    color: "text-amber-400",
  },
  speed_demon: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete an exam in under half the allotted time",
    icon: "⚡",
    color: "text-cyan-400",
  },
  scholar: {
    id: "scholar",
    name: "Scholar",
    description: "Complete 5 exams",
    icon: "📚",
    color: "text-violet-400",
  },
  excellence: {
    id: "excellence",
    name: "Excellence",
    description: "Average score above 80%",
    icon: "🌟",
    color: "text-yellow-400",
  },
  night_owl: {
    id: "night_owl",
    name: "Night Owl",
    description: "Complete an exam between 11 PM and 5 AM",
    icon: "🦉",
    color: "text-indigo-400",
  },
  persistent: {
    id: "persistent",
    name: "Persistent",
    description: "Get above 60% after scoring below 40% on the same exam topic",
    icon: "💪",
    color: "text-rose-400",
  },
  veteran: {
    id: "veteran",
    name: "Veteran",
    description: "Complete 10 exams",
    icon: "🏆",
    color: "text-orange-400",
  },
};

export type BadgeCheckContext = {
  // User info
  totalExamsBefore: number; // exams completed before this submission
  totalScoreBefore: number;
  badgesBefore: string[];
  // Current submission
  score: number;
  timeTaken: number;
  examDuration: number; // allotted time in seconds
  submittedAt: Date;
  examId: string;
  username: string;
  // Previous submissions on same exam (for persistent badge)
  previousScoreOnExam?: number;
};

/**
 * Check which new badges are earned based on submission context.
 * Returns array of newly earned badge IDs (not already in badgesBefore).
 */
export function checkBadges(ctx: BadgeCheckContext): string[] {
  const newBadges: string[] = [];

  // 1. First Steps — Complete your first exam
  if (ctx.totalExamsBefore === 0) {
    newBadges.push("first_steps");
  }

  // 2. Perfect Score — Score 100%
  if (ctx.score === 100) {
    newBadges.push("perfect_score");
  }

  // 3. Speed Demon — Complete in under half the allotted time
  if (ctx.timeTaken < ctx.examDuration / 2) {
    newBadges.push("speed_demon");
  }

  // 4. Scholar — Complete 5 exams (totalExamsBefore was 4 before this one)
  if (ctx.totalExamsBefore + 1 >= 5) {
    newBadges.push("scholar");
  }

  // 5. Excellence — Average score above 80%
  const newTotalExams = ctx.totalExamsBefore + 1;
  const newTotalScore = ctx.totalScoreBefore + ctx.score;
  if (newTotalExams > 0 && newTotalScore / newTotalExams > 80) {
    newBadges.push("excellence");
  }

  // 6. Night Owl — Complete between 11 PM and 5 AM
  const hour = ctx.submittedAt.getHours();
  if (hour >= 23 || hour < 5) {
    newBadges.push("night_owl");
  }

  // 7. Persistent — Get above 60% after previously scoring below 40% on same exam
  if (
    ctx.previousScoreOnExam !== undefined &&
    ctx.previousScoreOnExam < 40 &&
    ctx.score > 60
  ) {
    newBadges.push("persistent");
  }

  // 8. Veteran — Complete 10 exams
  if (newTotalExams >= 10) {
    newBadges.push("veteran");
  }

  // Filter out badges the user already has
  return newBadges.filter((b) => !ctx.badgesBefore.includes(b));
}

/**
 * Calculate streak from submission history.
 * Returns { streak, lastExamAt }.
 * A streak is the number of consecutive days with at least one exam submission.
 */
export function calculateStreak(
  submissionDates: Date[],
  today: Date = new Date()
): { streak: number; lastExamAt: Date | null } {
  if (submissionDates.length === 0) {
    return { streak: 0, lastExamAt: null };
  }

  // Sort dates descending
  const sorted = [...submissionDates].sort(
    (a, b) => b.getTime() - a.getTime()
  );

  // Get unique days
  const uniqueDays = new Set<string>();
  for (const d of sorted) {
    uniqueDays.add(d.toISOString().split("T")[0]);
  }

  const dayStrings = Array.from(uniqueDays).sort().reverse();

  // The streak counts consecutive days from today backwards
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let streak = 0;
  let checkDate: Date;

  // Streak must include today or yesterday to be active
  if (dayStrings[0] === todayStr) {
    streak = 1;
    checkDate = new Date(today);
  } else if (dayStrings[0] === yesterdayStr) {
    streak = 1;
    checkDate = new Date(yesterday);
  } else {
    // Streak broken — last exam wasn't today or yesterday
    return {
      streak: 0,
      lastExamAt: sorted[0] || null,
    };
  }

  // Count consecutive days going backwards
  while (true) {
    checkDate.setDate(checkDate.getDate() - 1);
    const checkStr = checkDate.toISOString().split("T")[0];
    if (dayStrings.includes(checkStr)) {
      streak++;
    } else {
      break;
    }
  }

  return { streak, lastExamAt: sorted[0] || null };
}
