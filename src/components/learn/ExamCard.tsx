'use client';

import { useRef, useEffect, useState } from 'react';
import type { Exam } from '@/lib/exam-data';
import { categoryColors } from '@/lib/exam-data';
import { questionBank } from '@/lib/exams/question-map';
import { AiVisual, WebDevVisual, DevOpsVisual, CybersecurityVisual, DatabaseVisual, PromptEngineeringVisual, GeneralVisual, AgentWorkflowVisual, VibeCodingVisual } from './ExamCardVisuals';
import { useAppStore } from '@/lib/store';

interface ExamCardProps {
  exam: Exam;
  index?: number;
}

/* ── Static Category Visual Renderer ── */
const categoryVisualMap: Record<string, React.FC<{ className?: string }>> = {
  ai: AiVisual,
  webdev: WebDevVisual,
  devops: DevOpsVisual,
  cybersecurity: CybersecurityVisual,
  database: DatabaseVisual,
  'prompt-engineering': PromptEngineeringVisual,
  general: GeneralVisual,
  'agent-workflow': AgentWorkflowVisual,
  'vibe-coding': VibeCodingVisual,
};

export function ExamCard({ exam, index = 0 }: ExamCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { setLearnView, setSelectedExamId } = useAppStore();
  const colors = categoryColors[exam.category as keyof typeof categoryColors] || categoryColors.general;
  const Visual = categoryVisualMap[exam.category] || GeneralVisual;

  // Check if exam has actual questions
  const hasQuestions = questionBank[exam.id] && questionBank[exam.id].length > 0;
  const actualCount = hasQuestions ? questionBank[exam.id].length : 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 80);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-40px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl overflow-hidden transition-all duration-500 ease-out cursor-pointer
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        hover:scale-[1.02] hover:shadow-xl
        ${!hasQuestions ? 'opacity-70 hover:opacity-90' : ''}
      `}
      style={{
        transitionProperty: 'opacity, translate, scale, box-shadow',
        background: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid #E2E8F0',
      }}
      onClick={() => {
        setLearnView('exam-detail');
        setSelectedExamId(exam.id);
      }}
      role="button"
      aria-label={`${exam.title} — ${hasQuestions ? `${actualCount} questions available` : 'Coming soon'}`}
    >
      {/* Colored left border based on category */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{
          background: exam.category === 'ai' ? '#8B5CF6' :
                     exam.category === 'webdev' ? '#06B6D4' :
                     exam.category === 'devops' ? '#3B82F6' :
                     exam.category === 'cybersecurity' ? '#EF4444' :
                     exam.category === 'database' ? '#F59E0B' :
                     exam.category === 'prompt-engineering' ? '#10B981' :
                     exam.category === 'general' ? '#14B8A6' :
                     exam.category === 'agent-workflow' ? '#6366F1' :
                     exam.category === 'vibe-coding' ? '#EC4899' :
                     '#4285F4',
        }}
      />

      {/* Coming Soon badge */}
      {!hasQuestions && (
        <div className="absolute top-3 right-3 z-30">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
            Coming Soon
          </span>
        </div>
      )}

      {/* Card content */}
      <div className="relative z-10 p-5 pl-6">
        {/* Top row: icon + category badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-hidden="true">{exam.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">{exam.title}</h3>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border
                ${exam.category === 'ai' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                  exam.category === 'webdev' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' :
                  exam.category === 'devops' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  exam.category === 'cybersecurity' ? 'bg-red-50 text-red-600 border-red-200' :
                  exam.category === 'database' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  exam.category === 'prompt-engineering' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  exam.category === 'general' ? 'bg-teal-50 text-teal-600 border-teal-200' :
                  exam.category === 'agent-workflow' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                  exam.category === 'vibe-coding' ? 'bg-pink-50 text-pink-600 border-pink-200' :
                  'bg-gray-50 text-gray-600 border-gray-200'}`}
              >
                {exam.category === 'prompt-engineering' ? 'Prompt Eng' :
                 exam.category === 'cybersecurity' ? 'Cyber' :
                 exam.category === 'devops' ? 'DevOps' :
                 exam.category === 'agent-workflow' ? 'AI Agent' :
                 exam.category === 'vibe-coding' ? 'Vibe Coding' :
                 exam.category.charAt(0).toUpperCase() + exam.category.slice(1)}
              </span>
            </div>
          </div>

          {/* SVG Visual - top right */}
          <div className="relative overflow-hidden" style={{ width: '80px', height: '80px' }}>
            <div className="absolute -top-2 -right-2 w-20 h-20 opacity-[0.12] group-hover:opacity-[0.2] transition-opacity duration-500">
              <Visual className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {exam.description}
        </p>

        {/* Bottom: stats + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {hasQuestions ? `${actualCount} Qs` : '—'}
            </span>
            <span>{exam.duration}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium
              ${exam.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600' :
                exam.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600' :
                'bg-red-50 text-red-600'}`}
            >
              {exam.difficulty}
            </span>
          </div>

          {hasQuestions ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLearnView('exam-detail');
                setSelectedExamId(exam.id);
              }}
              className="text-xs font-medium text-white bg-primary hover:bg-blue-600 active:scale-[0.95] transition-all px-3 py-1.5 rounded-lg shadow-sm shadow-primary/20 hover:shadow-md"
            >
              Start &rarr;
            </button>
          ) : (
            <span className="text-[10px] font-medium text-muted-foreground/60 px-2 py-1 rounded-lg bg-gray-50">
              Soon
            </span>
          )}
        </div>
      </div>

      {/* Shine sweep effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 60%)',
          animation: 'shine-sweep 0.6s ease-out forwards',
        }}
      />
    </div>
  );
}
