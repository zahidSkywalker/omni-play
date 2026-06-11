'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { exams } from '@/lib/exam-data';
import { questionBank, type MCQQuestion } from '@/lib/exams/question-map';
import { useAppStore } from '@/lib/store';
import {
  ChevronLeft, Clock, CheckCircle2, XCircle, ArrowRight,
  AlertTriangle, Trophy, RotateCcw, Home, ChevronRight,
  BookmarkCheck, Target, Zap, BookOpen, Timer
} from 'lucide-react';

/* ── Fisher-Yates shuffle for options ── */
function shuffleOptions(question: MCQQuestion): MCQQuestion {
  const indices = [0, 1, 2, 3];
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const newOptions = indices.map(i => question.options[i]) as [string, string, string, string];
  const newCorrectAnswer = indices.indexOf(question.correctAnswer);
  return { ...question, options: newOptions, correctAnswer: newCorrectAnswer };
}

/* ── Shuffle all questions ensuring even distribution ── */
function prepareQuestions(questions: MCQQuestion[]): MCQQuestion[] {
  // Shuffle the order of questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  // Shuffle options for each question (fixes biased correctAnswer distribution)
  return shuffled.map(q => shuffleOptions(q));
}

/* ── Question Navigation Dot ── */
function QDot({ index, current, answered, correct, wrong }: {
  index: number; current: number; answered: boolean; correct?: boolean; wrong?: boolean;
}) {
  const isCurrent = index === current;
  let cls = 'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 cursor-pointer ';
  if (isCurrent) cls += 'ring-2 ring-primary ring-offset-1 ring-offset-white scale-110 ';
  if (wrong) cls += 'bg-red-50 text-red-600 border border-red-300 ';
  else if (correct) cls += 'bg-emerald-50 text-emerald-600 border border-emerald-300 ';
  else if (answered) cls += 'bg-primary/10 text-primary border border-primary/30 ';
  else cls += 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 ';
  return (
    <div className={cls} title={`Q${index + 1}`} role="button" aria-label={`Go to question ${index + 1}`}>
      {index + 1}
    </div>
  );
}

/* ── Timer Display ── */
function TimerDisplay({ seconds, warning }: { seconds: number; warning: boolean }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold transition-colors duration-500
      ${warning ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-primary/10 text-primary border border-primary/20'}`}
      role="timer" aria-label={`${m} minutes ${s} seconds remaining`}>
      <Clock className="w-3.5 h-3.5" />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
}

/* ── Exam Detail View (pre-exam) ── */
function ExamDetailView({ examId, onStart, onBack }: {
  examId: string; onStart: () => void; onBack: () => void;
}) {
  const exam = exams.find(e => e.id === examId);
  if (!exam) return null;
  const rawQuestions = questionBank[examId];
  const hasQuestions = rawQuestions && rawQuestions.length > 0;
  const actualCount = hasQuestions ? rawQuestions.length : 0;

  return (
    <div className="min-h-screen overflow-y-auto custom-scrollbar gradient-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" aria-label="Go back">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-foreground flex-1">Exam Details</h2>
      </div>

      <div className="px-6 py-8 max-w-lg mx-auto">
        {/* Exam Icon & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-white shadow-lg border border-blue-100">
            <span className="text-4xl" role="img" aria-label="exam icon">{exam.icon}</span>
          </div>
          <h3 className="text-xl font-bold text-foreground">{exam.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exam.description}</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: <Target className="w-4 h-4" />, label: 'Questions', value: hasQuestions ? `${actualCount} Qs` : `${exam.questionCount} Qs` },
            { icon: <Clock className="w-4 h-4" />, label: 'Duration', value: exam.duration },
            { icon: <Zap className="w-4 h-4" />, label: 'Difficulty', value: exam.difficulty },
          ].map((item, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-white shadow-md border border-blue-50">
              <div className="flex justify-center text-primary mb-2">{item.icon}</div>
              <div className="text-sm font-bold text-foreground">{item.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {exam.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-lg text-xs bg-primary/8 text-primary border border-primary/15">
              {tag}
            </span>
          ))}
        </div>

        {/* Rules */}
        <div className="rounded-xl p-4 mb-8 bg-white shadow-md border border-blue-50">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-primary" /> Exam Rules
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> Each question has 4 options — pick the correct one</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> Timer starts when you click Start</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> You can navigate between questions freely</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> Results with explanations shown after submission</li>
          </ul>
        </div>

        {/* Start / Coming Soon Button */}
        {hasQuestions ? (
          <button onClick={onStart}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-primary/25">
            Start Exam <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4" /> Coming Soon — Questions under preparation
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Exam Taking View ── */
function ExamTakingView({ examId, onFinish }: { examId: string; onFinish: () => void }) {
  const exam = exams.find(e => e.id === examId);
  const rawQuestions = questionBank[examId] || [];

  // Prepare shuffled questions once on mount
  const [preparedQuestions] = useState<MCQQuestion[]>(() => prepareQuestions(rawQuestions));

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionAreaRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [submitted]);

  // Scroll to top of question area on question change
  useEffect(() => {
    if (questionAreaRef.current) {
      questionAreaRef.current.scrollTop = 0;
    }
  }, [currentQ]);

  const q: MCQQuestion = preparedQuestions[currentQ];
  const totalQ = preparedQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalQ > 0 ? ((answeredCount / totalQ) * 100) : 0;
  const isWarning = timeLeft < 60;

  const handleSelect = useCallback((optIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [currentQ]: optIndex }));
  }, [currentQ, submitted]);

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [submitted]);

  // Calculate results
  let correctCount = 0;
  let wrongCount = 0;
  const resultData = preparedQuestions.map((question, idx) => {
    const userAnswer = answers[idx];
    const isCorrect = userAnswer === question.correctAnswer;
    if (isCorrect) correctCount++;
    else if (userAnswer !== undefined) wrongCount++;
    return { question, userAnswer, isCorrect };
  });
  const unanswered = totalQ - correctCount - wrongCount;
  const percentage = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

  // Time taken
  const timeTaken = 30 * 60 - timeLeft;
  const minutesTaken = Math.floor(timeTaken / 60);
  const secondsTaken = timeTaken % 60;

  if (!exam || preparedQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-bg">
        <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-sm text-muted-foreground">No questions available for this exam.</p>
        <button onClick={onFinish} className="mt-4 px-4 py-2 rounded-lg text-xs font-medium text-primary bg-white border border-primary/20 hover:bg-primary/5 transition-all">
          Go Back
        </button>
      </div>
    );
  }

  /* ── Results Screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen overflow-y-auto custom-scrollbar gradient-bg">
        <div className="px-6 py-8 max-w-2xl mx-auto">
          {/* Score Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-white shadow-lg border-2"
              style={{ borderColor: percentage >= 70 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444' }}>
              <Trophy className={`w-8 h-8 ${percentage >= 70 ? 'text-emerald-500' : percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {percentage >= 80 ? 'Outstanding!' : percentage >= 70 ? 'Excellent!' : percentage >= 50 ? 'Good Try!' : percentage >= 30 ? 'Keep Practicing!' : 'Keep Learning!'}
            </h3>
            <div className="text-4xl font-black mt-2"
              style={{ color: percentage >= 70 ? '#10B981' : percentage >= 50 ? '#F59E0B' : '#EF4444' }}>
              {percentage}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">{correctCount} out of {totalQ} correct</p>
            <p className="text-xs text-muted-foreground/60 mt-1 flex items-center justify-center gap-1">
              <Timer className="w-3 h-3" /> Time: {minutesTaken}m {String(secondsTaken).padStart(2, '0')}s
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Correct', value: correctCount, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              { label: 'Wrong', value: wrongCount, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
              { label: 'Skipped', value: unanswered, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
              { label: 'Accuracy', value: `${percentage}%`, color: percentage >= 70 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600', bg: percentage >= 70 ? 'bg-emerald-50' : percentage >= 50 ? 'bg-amber-50' : 'bg-red-50', border: percentage >= 70 ? 'border-emerald-200' : percentage >= 50 ? 'border-amber-200' : 'border-red-200' },
            ].map((stat, i) => (
              <div key={i} className={`text-center p-3 rounded-xl bg-white shadow-md ${stat.border}`}>
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Question Review — scrollable */}
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Review Answers
          </h4>
          <div className="space-y-3 mb-8">
            {resultData.map((item, idx) => (
              <div key={idx} className="rounded-xl p-4 bg-white shadow-sm"
                style={{
                  border: `1px solid ${item.isCorrect ? '#BBF7D0' : item.userAnswer !== undefined ? '#FECACA' : '#E2E8F0'}`
                }}>
                <div className="flex items-start gap-2 mb-2">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : item.userAnswer !== undefined ? (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <p className="text-sm text-foreground font-medium leading-relaxed">{idx + 1}. {item.question.question}</p>
                </div>
                {/* Show all options with highlights */}
                <div className="ml-6 mb-2 space-y-1">
                  {item.question.options.map((opt, optIdx) => {
                    const isCorrectOpt = optIdx === item.question.correctAnswer;
                    const isWrongOpt = item.userAnswer === optIdx && !item.isCorrect;
                    let optStyle = 'text-xs text-muted-foreground';
                    if (isCorrectOpt) optStyle = 'text-xs text-emerald-600 font-medium';
                    else if (isWrongOpt) optStyle = 'text-xs text-red-500 line-through';
                    return (
                      <p key={optIdx} className={optStyle}>
                        {String.fromCharCode(65 + optIdx)}) {opt}
                        {isCorrectOpt && ' ✓'}
                        {isWrongOpt && ' ✗'}
                      </p>
                    );
                  })}
                </div>
                {/* Explanation — shown only in review */}
                <div className="ml-6 mt-2">
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    <span className="text-primary font-semibold not-italic">💡 Explanation: </span>{item.question.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 safe-area-bottom">
            <button onClick={onFinish}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.98]">
              <Home className="w-4 h-4" /> Back to Home
            </button>
            <button onClick={() => { setCurrentQ(0); setAnswers({}); setTimeLeft(30 * 60); setSubmitted(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-blue-600 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]">
              <RotateCcw className="w-4 h-4" /> Retake Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Question Screen ── */
  return (
    <div className="min-h-screen flex flex-col overflow-hidden gradient-bg">
      {/* Top bar */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <TimerDisplay seconds={timeLeft} warning={isWarning} />
        <div className="flex-1 text-center min-w-0">
          <span className="text-xs text-muted-foreground truncate block">{exam.title}</span>
        </div>
        <button onClick={() => setShowConfirmSubmit(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-blue-600 active:scale-[0.95] transition-all shadow-sm shadow-primary/20">
          Submit
        </button>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 px-4 py-2 bg-white/50">
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{answeredCount}/{totalQ} answered</span>
          <span className="text-[10px] text-muted-foreground">Q{currentQ + 1} of {totalQ}</span>
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="shrink-0 px-4 py-2 overflow-x-auto no-scrollbar bg-white/30">
        <div className="flex flex-wrap gap-1.5 justify-center" role="navigation" aria-label="Question navigation">
          {preparedQuestions.map((_, idx) => {
            const userAns = answers[idx];
            return (
              <div key={idx} onClick={() => !submitted && setCurrentQ(idx)}>
                <QDot index={idx} current={currentQ} answered={userAns !== undefined} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Question area */}
      <div ref={questionAreaRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
        <div className="max-w-xl mx-auto">
          <h3 className="text-base font-semibold text-foreground mb-5 leading-relaxed">
            <span className="text-primary mr-1">Q{currentQ + 1}.</span> {q.question}
          </h3>

          <div className="space-y-3" role="radiogroup" aria-label={`Question ${currentQ + 1} options`}>
            {q.options.map((option, optIdx) => {
              const isSelected = answers[currentQ] === optIdx;

              let optCls = 'w-full text-left p-4 rounded-xl text-sm transition-all duration-200 cursor-pointer border active:scale-[0.98] ';
              if (isSelected) optCls += 'bg-primary/10 text-primary border-primary/30 shadow-sm ';
              else optCls += 'bg-white text-foreground border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm ';

              return (
                <button key={optIdx} onClick={() => handleSelect(optIdx)} className={optCls}
                  role="radio" aria-checked={isSelected} aria-label={`Option ${String.fromCharCode(65 + optIdx)}: ${option}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors duration-200
                      ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* NO explanation during exam — only shown in results after submission */}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between bg-white/90 backdrop-blur-md border-t border-blue-100 safe-area-bottom">
        <button onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} disabled={currentQ === 0}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all active:scale-[0.95]"
          aria-label="Previous question">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-xs text-muted-foreground font-medium">{currentQ + 1} / {totalQ}</span>
        {currentQ < totalQ - 1 ? (
          <button onClick={() => setCurrentQ(prev => Math.min(totalQ - 1, prev + 1))}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-all active:scale-[0.95]"
            aria-label="Next question">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setShowConfirmSubmit(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-white bg-primary hover:bg-blue-600 transition-all shadow-sm active:scale-[0.95]">
            Finish <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Submit confirmation modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Submit exam confirmation">
          <div className="rounded-2xl p-6 max-w-sm mx-4 bg-white shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-foreground mb-2">Submit Exam?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              You&apos;ve answered <span className="text-primary font-bold">{answeredCount}</span> out of <span className="text-foreground font-bold">{totalQ}</span> questions.
            </p>
            {(totalQ - answeredCount) > 0 && (
              <p className="text-sm text-amber-600 mb-4 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {totalQ - answeredCount} question{(totalQ - answeredCount) > 1 ? 's' : ''} still unanswered!
              </p>
            )}
            {(totalQ - answeredCount) === 0 && (
              <p className="text-sm text-emerald-600 mb-4 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All questions answered!
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground border border-gray-200 hover:border-primary/30 transition-all active:scale-[0.97]">
                Cancel
              </button>
              <button onClick={() => { setShowConfirmSubmit(false); handleSubmit(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-blue-600 transition-all shadow-lg shadow-primary/25 active:scale-[0.97]">
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Export ── */
export function ExamRunner({ examId }: { examId: string | null }) {
  const { setLearnView } = useAppStore();
  const [mode, setMode] = useState<'detail' | 'taking'>('detail');

  if (!examId) return null;

  const handleBack = () => {
    if (mode === 'taking') setMode('detail');
    else setLearnView('examinations');
  };

  if (mode === 'detail') {
    return <ExamDetailView examId={examId} onStart={() => setMode('taking')} onBack={handleBack} />;
  }

  return <ExamTakingView examId={examId} onFinish={handleBack} />;
}
