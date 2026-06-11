"use client";

import Link from "next/link";
import {
  Cpu, FlaskConical, BookOpen, Landmark, Calculator, Code, Shield,
  Brain, Globe, Server, Lightbulb, GraduationCap, Palette, Music,
  Languages, Dna, Atom, Rocket, Wrench, Database,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Cpu, FlaskConical, BookOpen, Landmark, Calculator, Code, Shield,
  Brain, Globe, Server, Lightbulb, GraduationCap, Palette, Music,
  Languages, Dna, Atom, Rocket, Wrench, Database,
};

interface TopicCardProps {
  topic: {
    slug: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    postCount: number;
    examCount: number;
  };
  index?: number;
}

export default function TopicCard({ topic, index = 0 }: TopicCardProps) {
  const IconComponent = ICON_MAP[topic.icon] || BookOpen;
  const color = topic.color || "emerald";

  // Build dynamic class segments — Tailwind needs full class strings at build time
  // so we use a safe subset of common colors
  const colorClasses: Record<string, { bg: string; border: string; text: string; hoverBorder: string; shadow: string; iconBg: string }> = {
    blue:    { bg: "bg-blue-500/15",    border: "border-blue-500/20",    text: "text-blue-400",  hoverBorder: "hover:border-blue-500/40",  shadow: "hover:shadow-blue-500/10",  iconBg: "bg-blue-500/10" },
    emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500/20", text: "text-emerald-400", hoverBorder: "hover:border-emerald-500/40", shadow: "hover:shadow-emerald-500/10", iconBg: "bg-emerald-500/10" },
    teal:    { bg: "bg-teal-500/15",    border: "border-teal-500/20",    text: "text-teal-400",  hoverBorder: "hover:border-teal-500/40",  shadow: "hover:shadow-teal-500/10",  iconBg: "bg-teal-500/10" },
    cyan:    { bg: "bg-cyan-500/15",    border: "border-cyan-500/20",    text: "text-cyan-400",  hoverBorder: "hover:border-cyan-500/40",  shadow: "hover:shadow-cyan-500/10",  iconBg: "bg-cyan-500/10" },
    purple:  { bg: "bg-purple-500/15",  border: "border-purple-500/20",  text: "text-purple-400", hoverBorder: "hover:border-purple-500/40", shadow: "hover:shadow-purple-500/10", iconBg: "bg-purple-500/10" },
    violet:  { bg: "bg-violet-500/15",  border: "border-violet-500/20",  text: "text-violet-400", hoverBorder: "hover:border-violet-500/40", shadow: "hover:shadow-violet-500/10", iconBg: "bg-violet-500/10" },
    indigo:  { bg: "bg-indigo-500/15",  border: "border-indigo-500/20",  text: "text-indigo-400", hoverBorder: "hover:border-indigo-500/40", shadow: "hover:shadow-indigo-500/10", iconBg: "bg-indigo-500/10" },
    amber:   { bg: "bg-amber-500/15",   border: "border-amber-500/20",   text: "text-amber-400", hoverBorder: "hover:border-amber-500/40",  shadow: "hover:shadow-amber-500/10",  iconBg: "bg-amber-500/10" },
    orange:  { bg: "bg-orange-500/15",  border: "border-orange-500/20",  text: "text-orange-400", hoverBorder: "hover:border-orange-500/40", shadow: "hover:shadow-orange-500/10", iconBg: "bg-orange-500/10" },
    red:     { bg: "bg-red-500/15",     border: "border-red-500/20",     text: "text-red-400",   hoverBorder: "hover:border-red-500/40",   shadow: "hover:shadow-red-500/10",   iconBg: "bg-red-500/10" },
    rose:    { bg: "bg-rose-500/15",    border: "border-rose-500/20",    text: "text-rose-400",  hoverBorder: "hover:border-rose-500/40",  shadow: "hover:shadow-rose-500/10",  iconBg: "bg-rose-500/10" },
    pink:    { bg: "bg-pink-500/15",    border: "border-pink-500/20",    text: "text-pink-400",  hoverBorder: "hover:border-pink-500/40",  shadow: "hover:shadow-pink-500/10",  iconBg: "bg-pink-500/10" },
    sky:     { bg: "bg-sky-500/15",     border: "border-sky-500/20",     text: "text-sky-400",   hoverBorder: "hover:border-sky-500/40",   shadow: "hover:shadow-sky-500/10",   iconBg: "bg-sky-500/10" },
    lime:    { bg: "bg-lime-500/15",    border: "border-lime-500/20",    text: "text-lime-400",  hoverBorder: "hover:border-lime-500/40",  shadow: "hover:shadow-lime-500/10",  iconBg: "bg-lime-500/10" },
    green:   { bg: "bg-green-500/15",   border: "border-green-500/20",   text: "text-green-400", hoverBorder: "hover:border-green-500/40",  shadow: "hover:shadow-green-500/10",  iconBg: "bg-green-500/10" },
    fuchsia: { bg: "bg-fuchsia-500/15", border: "border-fuchsia-500/20", text: "text-fuchsia-400", hoverBorder: "hover:border-fuchsia-500/40", shadow: "hover:shadow-fuchsia-500/10", iconBg: "bg-fuchsia-500/10" },
  };

  const c = colorClasses[color] || colorClasses.emerald;

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <Link href={`/topics/${topic.slug}`}>
        <Card
          className={`group relative glass-card card-hover-gradient overflow-hidden transition-all duration-300 ${c.hoverBorder} hover:-translate-y-0.5 hover:shadow-lg ${c.shadow}`}
        >
          {/* Decorative dot — top-right corner */}
          <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${c.text} opacity-30 group-hover:opacity-60 transition-opacity duration-300`} />

          {/* Shine overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

          <CardContent className="p-6">
            {/* Icon */}
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${c.iconBg} border ${c.border} mb-4`}
            >
              <IconComponent className={`w-6 h-6 ${c.text}`} />
            </div>

            {/* Name */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {topic.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
              {topic.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {topic.postCount} articles
              </span>
              <span className="text-gray-600 dark:text-gray-600">•</span>
              <span>{topic.examCount} exams</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
