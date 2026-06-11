"use client";

import { Sparkles, GraduationCap, ChevronDown, BookOpen, Trophy, Zap, Users, FileText } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface PlatformStats {
  totalQuestions: number;
  totalExams: number;
  totalSubmissions: number;
  totalUsers: number;
  totalTopics: number;
  totalPosts: number;
}

// Animated counter that counts up from 0 to target
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setCount(0);
      return;
    }
    // Quick count-up animation over ~1 second
    const duration = 1000;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function HeroSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      } catch {
        // Silent fail — keeps existing placeholder text
      }
    }
    fetchStats();

    // Fallback: if video hasn't loaded in 8s, try manually playing
    const fallbackTimer = setTimeout(() => {
      const v = videoRef.current;
      if (v && v.readyState >= 2 && v.paused) {
        v.play().catch(() => {});
      }
    }, 8000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <section className="relative min-h-[60vh] sm:min-h-[65vh] md:min-h-[70vh] flex items-center justify-center pt-4 pb-20 overflow-hidden">
      {/* Video Background — contained within section */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => { setIsVideoLoaded(true); videoRef.current?.play().catch(() => {}); }}
          onCanPlayThrough={() => { setIsVideoLoaded(true); videoRef.current?.play().catch(() => {}); }}
          onError={() => { /* load failure — stays transparent */ }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <source
            src="https://res.cloudinary.com/dbi2rwlso/video/upload/v1780738374/hero-bg/hero-mp4-seamless.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Dark overlay gradient — ensures text readability over video */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-gray-950/70 via-gray-900/60 to-gray-950/90" />

      {/* Bottom blend — fades video into page background with smooth wave curve */}
      <div className="absolute bottom-0 left-0 right-0 z-[3]">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 sm:h-16 md:h-20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#030712" stopOpacity="0" />
              <stop offset="60%" stopColor="#030712" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#030712" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path d="M0 30C240 70 480 80 720 60C960 40 1200 50 1440 40V100H0V30Z" fill="url(#waveFade)" />
        </svg>
      </div>

      {/* Subtle emerald glow accent */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-emerald-900/20 via-transparent to-teal-900/15" />

      {/* Dot grid pattern — very subtle, on top of video */}
      <div className="absolute inset-0 z-[2] dot-grid-pattern opacity-30" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0s" }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 dark:bg-emerald-500/15 backdrop-blur-md border border-emerald-300/40 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-sm font-medium shadow-lg shadow-emerald-900/10">
            <GraduationCap className="w-4 h-4" />
            <span>Online MCQ Examination Platform</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="mb-8">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="font-[family-name:var(--font-cinzel)] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              Learn Tech with
            </span>
            <br />
            <span className="font-[family-name:var(--font-dancing)] gradient-text text-6xl sm:text-7xl md:text-8xl lg:text-9xl drop-shadow-[0_2px_15px_rgba(16,185,129,0.3)]">
              Zahid
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl text-gray-300/90 max-w-2xl mx-auto mb-10 animate-fade-in-up drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
            style={{ animationDelay: "0.3s" }}
          >
            Test your knowledge with curated MCQ examinations. Track your progress,
            review your answers, and learn from detailed explanations.
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.45s" }}
        >
          {/* Browse Exams — gradient border wrapper */}
          <div className="btn-gradient-border">
            <a
              href="#exams"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 btn-glow"
            >
              <Sparkles className="w-5 h-5" />
              <span>Browse Exams</span>
            </a>
          </div>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 text-gray-200 font-medium text-lg transition-all duration-200 hover:bg-white/10 backdrop-blur-sm"
          >
            How it Works
          </a>
        </div>

        {/* Stats bar — frosted glass strip — DYNAMIC DATA */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 animate-fade-in-up px-2"
          style={{ animationDelay: "0.6s" }}
        >
          {/* Questions */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <span className="block text-lg font-bold text-white drop-shadow-sm">
                {stats ? <AnimatedCounter target={stats.totalQuestions} suffix="+" /> : "---"}
              </span>
              <span className="block text-xs text-gray-300/80">Questions</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/15" />

          {/* Exams */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
            <Trophy className="w-5 h-5 text-teal-400" />
            <div className="text-left">
              <span className="block text-lg font-bold text-white drop-shadow-sm">
                {stats ? <AnimatedCounter target={stats.totalExams} suffix="+" /> : "---"}
              </span>
              <span className="block text-xs text-gray-300/80">Exams</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/15" />

          {/* Submissions / Results */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
            <Zap className="w-5 h-5 text-cyan-400" />
            <div className="text-left">
              <span className="block text-lg font-bold text-white drop-shadow-sm">
                {stats ? <AnimatedCounter target={stats.totalSubmissions} suffix="+" /> : "---"}
              </span>
              <span className="block text-xs text-gray-300/80">Results</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/15" />

          {/* Users */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
            <Users className="w-5 h-5 text-violet-400" />
            <div className="text-left">
              <span className="block text-lg font-bold text-white drop-shadow-sm">
                {stats ? <AnimatedCounter target={stats.totalUsers} suffix="+" /> : "---"}
              </span>
              <span className="block text-xs text-gray-300/80">Learners</span>
            </div>
          </div>

          <div className="hidden sm:block w-px h-8 bg-white/15" />

          {/* Topics */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
            <FileText className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <span className="block text-lg font-bold text-white drop-shadow-sm">
                {stats ? <AnimatedCounter target={stats.totalTopics + stats.totalPosts} suffix="+" /> : "---"}
              </span>
              <span className="block text-xs text-gray-300/80">Articles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator" aria-hidden="true">
        <a href="#exams" aria-label="Scroll to exams section" className="text-gray-400 hover:text-emerald-400 transition-colors">
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
}
