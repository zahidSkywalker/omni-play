'use client';

import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';
import { exams, categoryLabels, categoryColors, type ExamCategory, type Exam } from '@/lib/exam-data';
import { ExamCard } from '@/components/learn/ExamCard';
import { ExamRunner } from '@/components/learn/ExamRunner';
import { useAppStore } from '@/lib/store';
import { ArrowRight, Search, Filter, Clock, Trophy, BookOpen, ChevronLeft, X, GraduationCap, Brain, Sparkles, BarChart3 } from 'lucide-react';

// Dynamic Lottie import (client-only, no SSR)
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Lottie animation data imports
import heroLearningData from '../../../public/lottie/hero-learning.json';
import quizSuccessData from '../../../public/lottie/quiz-success.json';
import emptyStateData from '../../../public/lottie/empty-state.json';
import loadingDotsData from '../../../public/lottie/loading-dots.json';

/* ── Animated Text Component ── */
function AnimatedText({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleWords, setVisibleWords] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          words.forEach((_, i) => {
            setTimeout(() => {
              setVisibleWords((prev) => new Set(prev).add(i));
            }, i * 80);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [words.length]);

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block opacity-0 translate-y-3"
          style={{
            transitionProperty: 'opacity, translate',
            transitionDuration: '0.4s',
            transitionTimingFunction: 'ease-out',
            transitionDelay: `${i * 0.08}s`,
            marginRight: '0.25em',
            ...(visibleWords.has(i) ? { opacity: 1, translate: '0 0' } : {}),
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

/* ── Scroll Reveal Wrapper ── */
function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-60px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transitionProperty: 'opacity, translate, scale, filter',
        transitionDuration: '0.6s',
        transitionTimingFunction: 'ease-out',
        ...(visible ? { opacity: 1, translate: '0 0', scale: 1, filter: 'blur(0)' } : { opacity: 0, translate: '0 20px', scale: 0.98, filter: 'blur(4px)' }),
      }}
    >
      {children}
    </div>
  );
}

/* ── How It Works Steps ── */
const steps = [
  { icon: <BookOpen className="w-6 h-6" />, title: 'Choose a Topic', desc: 'Browse our curated collection of tech examinations across AI, Web Dev, DevOps, and more.' },
  { icon: <Brain className="w-6 h-6" />, title: 'Take the Exam', desc: 'Answer multiple-choice questions at your own pace with timed sessions and instant feedback.' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Track Progress', desc: 'Review your scores, identify knowledge gaps, and retake exams to strengthen weak areas.' },
];

function HowItWorks() {
  return (
    <section className="relative px-6 py-16">
      <AnimatedText text="How It Works" className="text-2xl font-bold text-foreground mb-10 text-center" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((step, i) => (
          <ScrollReveal key={i} delay={i * 150} className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-lg border border-blue-100 text-primary mb-4">
              {step.icon}
            </div>
            <h4 className="text-base font-semibold text-foreground mb-2">{step.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-7 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary/20 to-transparent" />
            )}
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ── Stats Section ── */
function StatsSection() {
  return (
    <ScrollReveal className="px-6 py-10">
      <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
        {[
          { value: '15', label: 'Exams', icon: <GraduationCap className="w-5 h-5" /> },
          { value: '150', label: 'Questions', icon: <Sparkles className="w-5 h-5" /> },
          { value: '3 Active', label: 'Categories', icon: <Filter className="w-5 h-5" /> },
        ].map((stat, i) => (
          <div key={i} className="text-center p-5 rounded-2xl bg-white shadow-md border border-blue-50">
            <div className="flex justify-center text-primary mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}

/* ── Exam Cards Grid ── */
function ExamCardsGrid({ examList, limit }: { examList?: Exam[]; limit?: number }) {
  const source = examList || exams;
  const displayExams = limit ? source.slice(0, limit) : source;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {displayExams.length > 0 ? displayExams.map((exam, i) => (
        <ExamCard key={exam.id} exam={exam} index={i} />
      )) : (
        <div className="col-span-full flex flex-col items-center justify-center py-16">
          <div className="w-32 h-32 mb-4">
            <Lottie animationData={emptyStateData} loop />
          </div>
          <p className="text-sm text-muted-foreground">No exams found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or category</p>
        </div>
      )}
    </div>
  );
}

/* ── Examinations Page (sub-view) ── */
function ExaminationsView({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ExamCategory | 'all'>('all');

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.description.toLowerCase().includes(search.toLowerCase()) ||
      exam.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || exam.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: (ExamCategory | 'all')[] = ['all', ...Object.keys(categoryLabels) as ExamCategory[]];

  return (
    <div className="min-h-screen overflow-y-auto custom-scrollbar pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-foreground flex-1">All Examinations</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">{filteredExams.length} exams</span>
      </div>

      {/* Search */}
      <div className="px-4 mb-4 mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams..."
            className="w-full pl-9 pr-9 py-3 text-sm rounded-xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="px-4 mb-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${activeCategory === cat
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-white text-muted-foreground border border-gray-200 hover:text-foreground hover:border-primary/30 hover:shadow-sm'
              }`}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-4">
        <ExamCardsGrid examList={filteredExams} />
      </div>
    </div>
  );
}

/* ── Main Learn Module ── */
export function LearnModule() {
  const { learnView, setLearnView, selectedExamId } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col">
      {learnView === 'exam-detail' && selectedExamId ? (
        <ExamRunner examId={selectedExamId} />
      ) : learnView === 'examinations' ? (
        <ExaminationsView onBack={() => setLearnView('home')} />
      ) : (
        <div className="min-h-screen overflow-y-auto custom-scrollbar">
          {/* Navbar */}
          <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">Learn Tech with Zahid</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLearnView('examinations')}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  Exams
                </button>
                <button
                  onClick={() => setLearnView('examinations')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-600 transition-all shadow-md shadow-primary/20"
                >
                  Start Learning
                </button>
              </div>
            </div>
          </nav>

          {/* Hero Section with Lottie */}
          <section className="relative px-6 pt-12 pb-10 overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #4285F4, transparent)' }} />
            <div className="absolute top-10 right-0 w-56 h-56 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #10B981, transparent)' }} />

            <div className="relative max-w-6xl mx-auto flex items-center gap-8">
              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4 border border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  Interactive MCQ Exam Platform
                </div>
                <AnimatedText
                  text="Learn Tech with Zahid"
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
                />
                <AnimatedText
                  text="Master technology through interactive MCQ examinations. Test your knowledge, track your progress, and ace your next interview."
                  className="text-base text-muted-foreground mt-4 leading-relaxed max-w-lg"
                />
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => setLearnView('examinations')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-blue-600 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                  >
                    Browse Exams <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLearnView('examinations')}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-gray-200 bg-white hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    View All Exams
                  </button>
                </div>
              </div>

              {/* Lottie Animation */}
              <div className="hidden sm:block w-48 h-48 md:w-64 md:h-64 shrink-0">
                <Lottie
                  animationData={heroLearningData}
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </section>

          {/* Stats */}
          <div className="max-w-6xl mx-auto">
            <StatsSection />
          </div>

          {/* Active Examinations */}
          <section className="px-6 py-10">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <AnimatedText text="Active Examinations" className="text-2xl font-bold text-foreground" />
                <span className="text-sm text-muted-foreground">{exams.length} exams available</span>
              </div>
              <ExamCardsGrid limit={6} />

              {/* View All Button */}
              <ScrollReveal className="mt-8 text-center">
                <button
                  onClick={() => setLearnView('examinations')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-primary bg-white border border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  View All Examinations ({exams.length})
                  <ArrowRight className="w-4 h-4" />
                </button>
              </ScrollReveal>
            </div>
          </section>

          {/* How It Works */}
          <div className="max-w-6xl mx-auto">
            <HowItWorks />
          </div>

          {/* Footer */}
          <footer className="px-6 py-10 mt-8 border-t border-blue-100 bg-white/50">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Learn Tech with Zahid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12">
                      <Lottie animationData={quizSuccessData} loop style={{ width: '100%', height: '100%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Built with love for the tech community
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
