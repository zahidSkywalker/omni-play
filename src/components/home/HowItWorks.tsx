"use client";

import { FileText, Trophy, ClipboardList, BarChart3 } from "lucide-react";
import ScrollReveal from "@/components/animations/ScrollReveal";
import AnimatedText from "@/components/animations/AnimatedText";

const steps = [
  {
    icon: FileText,
    title: "Admin Posts Exam",
    description:
      "The admin creates and publishes MCQ examinations on the platform. Each exam comes with a set time limit and carefully curated questions covering various topics.",
    color: "emerald",
  },
  {
    icon: ClipboardList,
    title: "Take the Exam",
    description:
      "Students browse available exams, enter their username to get a unique exam token, and answer timed MCQ questions in a focused, distraction-free environment.",
    color: "teal",
  },
  {
    icon: Trophy,
    title: "Instant Results",
    description:
      "As soon as you submit, get your score instantly with a detailed question-by-question review showing correct answers and explanations.",
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Leaderboard & Rankings",
    description:
      "Compete with others! Check the leaderboard to see how you rank, track your progress across exams, and strive for the top spot.",
    color: "amber",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-500/10",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-500/10",
    border: "border-teal-500/20",
    text: "text-teal-600 dark:text-teal-400",
    glow: "shadow-teal-500/10",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    glow: "shadow-cyan-500/10",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-500/10",
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal direction="up" duration={0.4}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-[family-name:var(--font-cinzel)]">
              <AnimatedText
                text="How it Works"
                splitBy="word"
                stagger={80}
                scrollReveal={false}
              />
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              A seamless experience from exam creation to instant results and rankings
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const colors = colorMap[step.color];
            return (
              <ScrollReveal
                key={i}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.1}
                duration={0.4}
              >
                <div className="relative">
                  {/* Connector line (desktop only) — gradient line between steps */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] right-[calc(-50%+40px)] h-px z-10">
                      <div className="h-full w-full bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/10" />
                    </div>
                  )}

                  <div className={`relative p-6 rounded-2xl glass-card card-hover-gradient transition-all duration-300 hover:border-gray-200 dark:hover:border-white/10 shadow-lg ${colors.glow} hover:shadow-xl overflow-visible`}>
                    {/* Step number badge — with hover scale */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-emerald-500/20 step-badge-hover">
                      {i + 1}
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} mb-4`}>
                      <step.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
