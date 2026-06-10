"use client";

import { useEffect, useState, useCallback, useRef, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Copy,
  Check,
  Key,
  AlertTriangle,
} from "lucide-react";
import { NotificationBanner } from "@/components/ui/notification-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExamTimer from "@/components/exam/ExamTimer";
import QuestionCard from "@/components/exam/QuestionCard";
import QuestionNav from "@/components/exam/QuestionNav";
import SubmitDialog from "@/components/exam/SubmitDialog";
import LoginModal from "@/components/auth/LoginModal";
import CommentsSection from "@/components/exam/CommentsSection";
import QuestionTimer from "@/components/exam/QuestionTimer";
import type { IExam, IQuestion } from "@/types";
import { shuffleArray } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

export default function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<IExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [questionKey, setQuestionKey] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user } = useAuth();

  // Token dialog states
  const [generatedToken, setGeneratedToken] = useState("");
  const [tokenCopied, setTokenCopied] = useState(false);
  const [tokenDismissed, setTokenDismissed] = useState(false);

  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasAutoSubmitted = useRef(false);

  // ─── Anti-Cheat: Shuffle state ───────────────────────────────
  // shuffledQuestionIndices[newPos] = originalPos
  const shuffledQuestionIndicesRef = useRef<number[]>([]);
  // shuffledOptionsMapping[newPos][newOptionPos] = originalOptionPos
  const shuffledOptionsMappingRef = useRef<number[][]>([]);

  // Shuffled exam questions (displayed to user)
  const [shuffledQuestions, setShuffledQuestions] = useState<IQuestion[]>([]);

  // ─── Anti-Cheat: Tab-switch detection ────────────────────────
  const tabSwitchCountRef = useRef(0);
  const [tabWarningCount, setTabWarningCount] = useState(0);
  const [tabWarningVisible, setTabWarningVisible] = useState(false);
  const tabWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSubmitFromTabsRef = useRef(false);

  // ─── Anti-Cheat: Copy/paste toast ───────────────────────────
  const [copyPasteToast, setCopyPasteToast] = useState(false);
  const copyPasteToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch exam
  useEffect(() => {
    async function fetchExam() {
      try {
        const res = await fetch(`/api/exams/${id}`);
        if (!res.ok) {
          throw new Error("Exam not found");
        }
        const data = await res.json();
        setExam(data);
        setAnswers(new Array(data.questions.length).fill(null));
      } catch {
        setError("Failed to load exam. It may not exist or is no longer active.");
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [id]);

  // Auto-fill username from logged-in user
  useEffect(() => {
    if (user?.username && !username) {
      setUsername(user.username);
    }
  }, [user, username]);

  // ─── Anti-Cheat: Shuffle questions and options on exam start ─
  useEffect(() => {
    if (!exam || !isNameEntered || shuffledQuestions.length > 0) return;

    // 1. Shuffle question order
    const questionIndices = exam.questions.map((_, i) => i);
    const shuffledIndices = shuffleArray(questionIndices);
    shuffledQuestionIndicesRef.current = shuffledIndices;

    // 2. Shuffle options for each question
    const newShuffledQuestions: IQuestion[] = [];
    const optionMappings: number[][] = [];

    shuffledIndices.forEach((origQIdx) => {
      const origQ = exam.questions[origQIdx];
      const optionIndices = origQ.options.map((_, i) => i);
      const shuffledOptIndices = shuffleArray(optionIndices);
      optionMappings.push(shuffledOptIndices);

      // Build the new question with shuffled options
      newShuffledQuestions.push({
        ...origQ,
        options: shuffledOptIndices.map((oi) => origQ.options[oi]),
      });
    });

    shuffledOptionsMappingRef.current = optionMappings;
    setShuffledQuestions(newShuffledQuestions);
    setAnswers(new Array(newShuffledQuestions.length).fill(null));
  }, [exam, isNameEntered, shuffledQuestions.length]);

  // ─── Anti-Cheat: Tab-switch detection ────────────────────────
  useEffect(() => {
    if (!isNameEntered || generatedToken || submitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        const count = tabSwitchCountRef.current;
        setTabWarningCount(count);
        setTabWarningVisible(true);

        // Clear previous auto-dismiss timer
        if (tabWarningTimerRef.current) {
          clearTimeout(tabWarningTimerRef.current);
        }

        // Auto-dismiss the warning banner after 3 seconds
        tabWarningTimerRef.current = setTimeout(() => {
          setTabWarningVisible(false);
        }, 3000);

        // Auto-submit after 3 warnings
        if (count >= 3) {
          autoSubmitFromTabsRef.current = true;
          setIsAutoSubmitting(true);
          handleSubmit();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (tabWarningTimerRef.current) {
        clearTimeout(tabWarningTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNameEntered, generatedToken, submitting]);

  // ─── Anti-Cheat: Copy-paste disabled ─────────────────────────
  useEffect(() => {
    if (!isNameEntered || generatedToken) return;

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C, Cmd+C, Ctrl+V, Cmd+V, Ctrl+Shift+V, Cmd+Shift+V
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || e.key === "v")
      ) {
        e.preventDefault();
        setCopyPasteToast(true);

        if (copyPasteToastTimerRef.current) {
          clearTimeout(copyPasteToastTimerRef.current);
        }
        copyPasteToastTimerRef.current = setTimeout(() => {
          setCopyPasteToast(false);
        }, 2000);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      if (copyPasteToastTimerRef.current) {
        clearTimeout(copyPasteToastTimerRef.current);
      }
    };
  }, [isNameEntered, generatedToken]);

  // Prevent back navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave? Your progress will be lost.";
      return e.returnValue;
    };

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async () => {
      if (submitting || hasAutoSubmitted.current) return;
      hasAutoSubmitted.current = true;
      setSubmitting(true);

      try {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const finalAnswers = answers.map((a) => (a === null ? -1 : a));

        // Build the payload with shuffle mappings for server-side validation
        const payload: Record<string, unknown> = {
          answers: finalAnswers,
          timeTaken,
          username: username.trim(),
        };

        // Only send shuffle mappings if shuffling was active
        if (shuffledQuestionIndicesRef.current.length > 0) {
          payload.shuffledQuestionIndices = shuffledQuestionIndicesRef.current;
          payload.shuffledOptions = shuffledOptionsMappingRef.current;
        }

        const res = await fetch(`/api/exams/${id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to submit");
        }

        const data = await res.json();
        setGeneratedToken(data.token);
      } catch (err) {
        console.error("Submit error:", err);
        setSubmitting(false);
        hasAutoSubmitted.current = false;
        setSubmitError("Failed to submit exam. Please try again.");
      }
    },
    [answers, id, startTime, username, submitting]
  );

  const handleTimeUp = useCallback(() => {
    setIsAutoSubmitting(true);
    handleSubmit();
  }, [handleSubmit]);

  const handleWarning = useCallback(() => {
    setWarningDialogOpen(true);
  }, []);

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(generatedToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch {
      // Fallback: create temporary textarea for clipboard
      const ta = document.createElement("textarea");
      ta.value = generatedToken;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(ta);
      }
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  const handleTokenDismiss = () => {
    setTokenDismissed(true);
  };

  // After token is dismissed, navigate to result
  useEffect(() => {
    if (tokenDismissed && generatedToken) {
      router.push(`/lookup?token=${encodeURIComponent(generatedToken)}`);
    }
  }, [tokenDismissed, generatedToken, router]);

  const handleStartExam = () => {
    if (!username.trim()) {
      setUsernameError("Username is required to start the exam");
      return;
    }
    if (username.trim().length < 2) {
      setUsernameError("Username must be at least 2 characters");
      return;
    }
    setUsernameError("");
    setIsNameEntered(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = optionIndex;
      return copy;
    });
  };

  const handleJump = (index: number) => {
    if (index !== currentIndex) {
      setPrevIndex(currentIndex);
      setCurrentIndex(index);
      setQuestionKey((k) => k + 1);
    }
  };

  const handleNext = () => {
    const total = shuffledQuestions.length || exam?.questions.length || 0;
    if (currentIndex < total - 1) {
      setPrevIndex(currentIndex);
      setCurrentIndex(currentIndex + 1);
      setQuestionKey((k) => k + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setPrevIndex(currentIndex);
      setCurrentIndex(currentIndex - 1);
      setQuestionKey((k) => k + 1);
    }
  };

  const transitionDirection = currentIndex > prevIndex ? "right" : "left";

  // ─── Per-Question Timer ──────────────────────────────────
  const questionTimeLimit = exam?.questionTimeLimit || 0; // 0 means no limit
  // Use questionKey as a derived timer key (resets on question change)
  const questionTimerKey = isNameEntered && questionTimeLimit > 0 ? questionKey : 0;

  const handleQuestionTimeUp = useCallback(() => {
    const total = shuffledQuestions.length || exam?.questions.length || 0;
    // If on last question, auto-submit; otherwise advance
    if (currentIndex < total - 1) {
      setPrevIndex(currentIndex);
      setCurrentIndex(currentIndex + 1);
      setQuestionKey((k) => k + 1);
    } else {
      // Last question expired — auto-submit
      handleSubmit();
    }
  }, [currentIndex, shuffledQuestions.length, exam?.questions.length, handleSubmit]);

  const handleQuestionWarning = useCallback((rem: number) => {
    // Could show a subtle flash or notification
    console.log(`Question timer warning: ${rem}s remaining`);
  }, []);

  // Questions to display (shuffled if available, else original)
  const displayQuestions = useMemo(() => {
    if (shuffledQuestions.length > 0) return shuffledQuestions;
    return exam?.questions || [];
  }, [shuffledQuestions, exam]);

  // Token display dialog (shown after submission, before navigation)
  if (generatedToken && !tokenDismissed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="glass-surface rounded-2xl border border-emerald-500/20 p-8 text-center shadow-lg shadow-emerald-500/10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
              <Key className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your Exam Token
            </h2>
            <p className="text-amber-600 dark:text-amber-400 text-sm mb-6 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Copy this token NOW — it won&apos;t be shown again!
            </p>

            <div className="bg-background rounded-xl border border-gray-200 dark:border-white/10 p-4 mb-6">
              <code className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                {generatedToken}
              </code>
            </div>

            <Button
              onClick={handleCopyToken}
              className={`w-full mb-4 gap-2 font-semibold ${
                tokenCopied
                  ? "bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
              }`}
            >
              {tokenCopied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Token
                </>
              )}
            </Button>

            <Button
              onClick={handleTokenDismiss}
              variant="outline"
              className="w-full gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              View My Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Name entry screen
  if (!loading && exam && !isNameEntered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{exam.description}</p>

            <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Questions</span>
                <span className="text-gray-900 dark:text-white">{exam.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                <span className="text-gray-900 dark:text-white">{exam.duration} minutes</span>
              </div>
            </div>

            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter your username..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleStartExam()}
                className="bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:border-emerald-500/50"
              />
              {usernameError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{usernameError}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                A unique exam token will be generated for you after submission. Save it to track your results.
              </p>
            </div>

            <Button
              onClick={handleStartExam}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
            >
              {user ? "Start Exam (as @" + user.username + ")" : "Start Exam"}
            </Button>

            {!user && (
              <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/5">
                <p className="text-xs text-gray-400 mb-2">
                  Want to track your results?{" "}
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium underline underline-offset-2"
                  >
                    Login or create an account
                  </button>
                </p>
              </div>
            )}

            {/* Discussion / Comments Section — visible before exam starts */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-white/5">
              <CommentsSection examId={id} />
            </div>

            <button
              onClick={() => router.push("/")}
              className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-2 py-1"
            >
              &larr; Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
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

  // If exam has started but shuffled questions aren't ready yet, show loading
  if (isNameEntered && shuffledQuestions.length === 0 && exam.questions.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-[52px] z-40 glass-surface border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
              {exam.title}
            </h1>
          </div>

          <ExamTimer
            durationSeconds={exam.duration * 60}
            startTime={startTime}
            onTimeUp={handleTimeUp}
            onWarning={handleWarning}
          />
        </div>
      </header>

      {/* Anti-Cheat: Tab switch warning banner */}
      {tabWarningVisible && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[120] w-full max-w-lg px-4 animate-fade-in-down">
          <NotificationBanner
            message={`Tab switch detected! (${tabWarningCount}/3 warnings)${tabWarningCount >= 3 ? " — Auto-submitting exam!" : ""}`}
            variant={tabWarningCount >= 2 ? "error" : "warning"}
          />
        </div>
      )}

      {/* Anti-Cheat: Copy/paste toast */}
      {copyPasteToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[120] animate-fade-in-up">
          <div className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 border border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Copy/paste is disabled during the exam
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 py-6 pb-24 lg:pb-6 gap-6">
        {/* Question area */}
        <div className="flex-1 flex flex-col">
          {/* CSS transition for question change (replaces framer-motion AnimatePresence) */}
          <div key={questionKey} className={`flex-1 ${transitionDirection === "right" ? "question-enter-right" : "question-enter-left"}`}>
            {/* Per-question timer (positioned in question area header) */}
            <div className="flex items-center justify-between mb-4">
              <div /> {/* spacer */}
              {questionTimeLimit > 0 && (
                <QuestionTimer
                  key={questionTimerKey}
                  timeLimit={questionTimeLimit}
                  onTimeUp={handleQuestionTimeUp}
                  onWarning={handleQuestionWarning}
                />
              )}
            </div>
            <QuestionCard
              question={displayQuestions[currentIndex]}
              questionNumber={currentIndex + 1}
              totalQuestions={displayQuestions.length}
              selectedAnswer={answers[currentIndex]}
              onSelect={handleSelectOption}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6 mb-2 lg:mb-0">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              variant="outline"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setSubmitDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Send className="w-4 h-4" />
                Submit
              </Button>
            </div>

            <Button
              onClick={handleNext}
              disabled={currentIndex === displayQuestions.length - 1}
              variant="outline"
              className="gap-2 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar - Question Navigation (desktop only, mobile uses bottom sheet in QuestionNav) */}
        <div className="hidden lg:block lg:w-72 flex-shrink-0">
          <div className="lg:sticky lg:top-20">
            <QuestionNav
              totalQuestions={displayQuestions.length}
              currentIndex={currentIndex}
              answers={answers}
              onJump={handleJump}
            />
          </div>
        </div>
      </main>

      {/* Submit Dialog */}
      <SubmitDialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        onConfirm={() => {
          setSubmitDialogOpen(false);
          handleSubmit();
        }}
        answeredCount={answers.filter((a) => a !== null).length}
        totalCount={displayQuestions.length}
      />

      {/* Warning Dialog */}
      <SubmitDialog
        open={warningDialogOpen}
        onClose={() => setWarningDialogOpen(false)}
        onConfirm={() => {
          setWarningDialogOpen(false);
          handleSubmit();
        }}
        answeredCount={answers.filter((a) => a !== null).length}
        totalCount={displayQuestions.length}
        isWarning
        warningSeconds={30}
      />

      {/* Auto-submit overlay */}
      {submitting && (
        <div className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="text-center w-full max-w-sm px-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-900 dark:text-white text-lg font-medium">
              {isAutoSubmitting ? "Auto-submitting..." : "Submitting your exam..."}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Please wait...</p>
          </div>
        </div>
      )}

      {/* Submit error banner */}
      {submitError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4">
          <NotificationBanner
            message={submitError}
            variant="error"
            onDismiss={() => setSubmitError(null)}
          />
        </div>
      )}

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}
