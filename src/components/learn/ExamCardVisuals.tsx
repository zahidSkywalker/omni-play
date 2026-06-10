'use client';

import type { ExamCategory } from '@/lib/exam-data';

/* ── Category-specific SVG illustrations ── */

function AiVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Neural network nodes */}
      <circle cx="60" cy="60" r="18" className="fill-emerald-500/30" />
      <circle cx="60" cy="60" r="6" className="fill-emerald-400/80">
        <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="50" r="14" className="fill-purple-500/30" />
      <circle cx="140" cy="50" r="5" className="fill-purple-400/80" />
      <circle cx="100" cy="120" r="20" className="fill-cyan-500/30" />
      <circle cx="100" cy="120" r="7" className="fill-cyan-400/80">
        <animate attributeName="r" values="7;10;7" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="150" r="12" className="fill-emerald-500/20" />
      <circle cx="50" cy="150" r="4" className="fill-emerald-400/60" />
      <circle cx="155" cy="140" r="16" className="fill-purple-500/20" />
      <circle cx="155" cy="140" r="5" className="fill-purple-400/60" />
      {/* Connections */}
      <line x1="74" y1="67" x2="130" y2="53" className="stroke-emerald-400/20" strokeWidth="2" />
      <line x1="74" y1="67" x2="90" y2="105" className="stroke-purple-400/20" strokeWidth="2" />
      <line x1="130" y1="55" x2="110" y2="105" className="stroke-cyan-400/20" strokeWidth="2" />
      <line x1="90" y1="130" x2="60" y2="143" className="stroke-emerald-400/15" strokeWidth="2" />
      <line x1="110" y1="130" x2="145" y2="135" className="stroke-purple-400/15" strokeWidth="2" />
      {/* Pulse ring */}
      <circle cx="100" cy="120" r="25" className="stroke-cyan-400/20" strokeWidth="1" fill="none">
        <animate attributeName="r" values="25;40;25" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function WebDevVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Browser window */}
      <rect x="30" y="30" width="140" height="100" rx="8" className="fill-cyan-500/15 stroke-cyan-500/30" strokeWidth="2" />
      <rect x="30" y="30" width="140" height="20" rx="8" className="fill-cyan-500/20" />
      <rect x="38" y="35" width="8" height="8" rx="4" className="fill-red-400/60" />
      <rect x="50" y="35" width="8" height="8" rx="4" className="fill-amber-400/60" />
      <rect x="62" y="35" width="8" height="8" rx="4" className="fill-emerald-400/60" />
      {/* Code lines */}
      <rect x="42" y="60" width="50" height="4" rx="2" className="fill-cyan-400/50" />
      <rect x="42" y="70" width="35" height="4" rx="2" className="fill-emerald-400/40" />
      <rect x="82" y="70" width="40" height="4" rx="2" className="fill-purple-400/40" />
      <rect x="50" y="80" width="60" height="4" rx="2" className="fill-cyan-400/30" />
      <rect x="50" y="90" width="45" height="4" rx="2" className="fill-amber-400/30" />
      <rect x="42" y="100" width="55" height="4" rx="2" className="fill-emerald-400/20" />
      <rect x="42" y="110" width="30" height="4" rx="2" className="fill-cyan-400/20" />
      {/* Angle brackets */}
      <text x="90" y="175" textAnchor="middle" className="fill-cyan-400/60 text-3xl font-mono">&lt;/&gt;</text>
    </svg>
  );
}

function DevOpsVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Container boxes */}
      <rect x="35" y="40" width="50" height="40" rx="6" className="fill-blue-500/15 stroke-blue-500/30" strokeWidth="2" />
      <rect x="115" y="40" width="50" height="40" rx="6" className="fill-blue-500/15 stroke-blue-500/30" strokeWidth="2" />
      <rect x="75" y="110" width="50" height="40" rx="6" className="fill-emerald-500/15 stroke-emerald-500/30" strokeWidth="2" />
      {/* Docker whale shape */}
      <circle cx="60" cy="55" r="4" className="fill-blue-400/60" />
      <circle cx="72" cy="55" r="4" className="fill-blue-400/60" />
      <circle cx="60" cy="65" r="4" className="fill-blue-400/50" />
      <circle cx="72" cy="65" r="4" className="fill-blue-400/50" />
      <circle cx="140" cy="55" r="4" className="fill-cyan-400/60" />
      <circle cx="152" cy="55" r="4" className="fill-cyan-400/60" />
      <circle cx="140" cy="65" r="4" className="fill-cyan-400/50" />
      {/* Arrows */}
      <line x1="85" y1="60" x2="115" y2="60" className="stroke-emerald-400/30" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="60" y1="80" x2="90" y2="110" className="stroke-blue-400/30" strokeWidth="2" />
      <line x1="140" y1="80" x2="110" y2="110" className="stroke-cyan-400/30" strokeWidth="2" />
      {/* Infinity CI/CD */}
      <path d="M70 165 Q100 145 130 165 Q100 185 70 165" className="stroke-emerald-400/30" strokeWidth="2" fill="none">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
      </path>
      <text x="100" y="190" textAnchor="middle" className="fill-emerald-400/40 text-xs">CI/CD</text>
    </svg>
  );
}

function CybersecurityVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Shield */}
      <path d="M100 30 L155 55 L155 100 Q155 145 100 170 Q45 145 45 100 L45 55 Z"
        className="fill-red-500/10 stroke-red-500/30" strokeWidth="2" />
      {/* Scanning line */}
      <line x1="50" y1="100" x2="150" y2="100" className="stroke-red-400/40" strokeWidth="1">
        <animate attributeName="y1" values="55;170;55" dur="3s" repeatCount="indefinite" />
        <animate attributeName="y2" values="55;170;55" dur="3s" repeatCount="indefinite" />
      </line>
      {/* Lock icon */}
      <rect x="88" y="90" width="24" height="20" rx="3" className="fill-red-400/30" />
      <path d="M93 90 L93 80 Q93 70 100 70 Q107 70 107 80 L107 90" className="stroke-red-400/50" strokeWidth="2" fill="none" />
      <circle cx="100" cy="102" r="3" className="fill-red-400/60" />
      {/* Key dots */}
      <circle cx="75" cy="50" r="3" className="fill-red-400/30">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="130" cy="50" r="3" className="fill-red-400/30">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function DatabaseVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Database cylinder */}
      <ellipse cx="100" cy="55" rx="45" ry="18" className="fill-amber-500/15 stroke-amber-500/30" strokeWidth="2" />
      <rect x="55" y="55" width="90" height="80" className="fill-amber-500/10" />
      <line x1="55" y1="55" x2="55" y2="135" className="stroke-amber-500/30" strokeWidth="2" />
      <line x1="145" y1="55" x2="145" y2="135" className="stroke-amber-500/30" strokeWidth="2" />
      <ellipse cx="100" cy="135" rx="45" ry="18" className="fill-amber-500/15 stroke-amber-500/30" strokeWidth="2" />
      {/* Data rows */}
      <ellipse cx="100" cy="75" rx="45" ry="12" className="stroke-amber-500/15" strokeWidth="1" fill="none" />
      <ellipse cx="100" cy="95" rx="45" ry="12" className="stroke-amber-500/15" strokeWidth="1" fill="none" />
      <ellipse cx="100" cy="115" rx="45" ry="12" className="stroke-amber-500/15" strokeWidth="1" fill="none" />
      {/* Query text */}
      <text x="100" y="185" textAnchor="middle" className="fill-amber-400/40 text-xs font-mono">SELECT * FROM</text>
    </svg>
  );
}

function PromptEngineeringVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Chat bubble */}
      <rect x="30" y="30" width="120" height="70" rx="12" className="fill-emerald-500/10 stroke-emerald-500/30" strokeWidth="2" />
      <polygon points="45,100 55,100 40,115" className="fill-emerald-500/10" />
      <polygon points="45,100 55,100 40,115" className="stroke-emerald-500/30" strokeWidth="2" fill="none" />
      {/* Prompt lines */}
      <rect x="45" y="48" width="60" height="4" rx="2" className="fill-emerald-400/40" />
      <rect x="45" y="58" width="80" height="4" rx="2" className="fill-emerald-400/25" />
      <rect x="45" y="68" width="50" height="4" rx="2" className="fill-emerald-400/20" />
      {/* Sparkles */}
      <circle cx="165" cy="50" r="4" className="fill-emerald-400/40">
        <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="75" r="3" className="fill-cyan-400/40">
        <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="155" cy="85" r="2.5" className="fill-emerald-400/30">
        <animate attributeName="r" values="2.5;4;2.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* AI response arrow */}
      <path d="M100 130 L100 160" className="stroke-emerald-400/30" strokeWidth="2" markerEnd="url(#arrow2)" />
      <rect x="65" y="160" width="70" height="25" rx="6" className="fill-emerald-500/15 stroke-emerald-500/20" strokeWidth="1" />
      <rect x="75" y="170" width="40" height="3" rx="1.5" className="fill-emerald-400/30" />
    </svg>
  );
}

function GeneralVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Hexagon */}
      <polygon points="100,30 160,60 160,120 100,150 40,120 40,60" className="fill-teal-500/10 stroke-teal-500/30" strokeWidth="2" />
      {/* Inner hexagon */}
      <polygon points="100,55 135,72 135,108 100,125 65,108 65,72" className="stroke-teal-500/15" strokeWidth="1" fill="none" />
      {/* Lightbulb center */}
      <circle cx="100" cy="85" r="12" className="fill-teal-400/30" />
      <path d="M95 82 L100 72 L105 82" className="stroke-teal-400/60" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="100" y1="82" x2="100" y2="92" className="stroke-teal-400/60" strokeWidth="2" strokeLinecap="round" />
      {/* Pulsing rings */}
      <circle cx="100" cy="90" r="20" className="stroke-teal-400/15" strokeWidth="1" fill="none">
        <animate attributeName="r" values="20;50;20" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="90" r="30" className="stroke-teal-400/10" strokeWidth="1" fill="none">
        <animate attributeName="r" values="30;60;30" dur="4s" begin="1s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0;0.2" dur="4s" begin="1s" repeatCount="indefinite" />
      </circle>
      {/* Gear teeth hint */}
      <circle cx="100" cy="90" r="35" className="stroke-teal-500/10" strokeWidth="8" fill="none" strokeDasharray="8 12" />
    </svg>
  );
}

/* ── Mapper function ── */

function AgentWorkflowVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Robot head */}
      <rect x="65" y="40" width="70" height="55" rx="12" className="fill-indigo-500/15 stroke-indigo-500/30" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="82" cy="60" r="6" className="fill-indigo-400/50">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="118" cy="60" r="6" className="fill-indigo-400/50">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin="0.3s" repeatCount="indefinite" />
      </circle>
      {/* Antenna */}
      <line x1="100" y1="40" x2="100" y2="25" className="stroke-indigo-400/40" strokeWidth="2" />
      <circle cx="100" cy="22" r="4" className="fill-indigo-400/40">
        <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Body */}
      <rect x="75" y="100" width="50" height="45" rx="8" className="fill-indigo-500/10 stroke-indigo-500/20" strokeWidth="1.5" />
      {/* Connection lines (workflow) */}
      <line x1="60" y1="120" x2="75" y2="120" className="stroke-indigo-400/20" strokeWidth="1" strokeDasharray="4 3" />
      <line x1="125" y1="120" x2="145" y2="120" className="stroke-indigo-400/20" strokeWidth="1" strokeDasharray="4 3" />
      {/* Tool boxes */}
      <rect x="30" y="110" width="22" height="20" rx="4" className="fill-cyan-500/15 stroke-cyan-500/25" strokeWidth="1" />
      <rect x="148" y="110" width="22" height="20" rx="4" className="fill-purple-500/15 stroke-purple-500/25" strokeWidth="1" />
      {/* Pulse ring */}
      <circle cx="100" cy="120" r="15" className="stroke-indigo-400/15" strokeWidth="1" fill="none">
        <animate attributeName="r" values="15;35;15" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function VibeCodingVisual({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Code editor window */}
      <rect x="25" y="30" width="150" height="100" rx="8" className="fill-pink-500/10 stroke-pink-500/25" strokeWidth="2" />
      {/* Tab bar */}
      <rect x="25" y="30" width="150" height="18" rx="8" className="fill-pink-500/15" />
      <rect x="35" y="34" width="30" height="8" rx="3" className="fill-pink-400/30" />
      {/* Code blocks with gradient colors */}
      <rect x="38" y="58" width="40" height="4" rx="2" className="fill-pink-400/40" />
      <rect x="82" y="58" width="55" height="4" rx="2" className="fill-purple-400/30" />
      <rect x="45" y="68" width="70" height="4" rx="2" className="fill-cyan-400/35" />
      <rect x="45" y="78" width="50" height="4" rx="2" className="fill-emerald-400/30" />
      <rect x="100" y="78" width="35" height="4" rx="2" className="fill-amber-400/25" />
      <rect x="38" y="88" width="60" height="4" rx="2" className="fill-pink-400/25" />
      <rect x="38" y="98" width="25" height="4" rx="2" className="fill-cyan-400/20" />
      {/* Sparkle (AI magic) */}
      <circle cx="160" cy="155" r="5" className="fill-pink-400/40">
        <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="165" r="3" className="fill-purple-400/30">
        <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="170" cy="170" r="2.5" className="fill-cyan-400/30">
        <animate attributeName="r" values="2.5;4;2.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* AI wand line */}
      <path d="M155 150 Q140 140 130 100" className="stroke-pink-400/20" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
    </svg>
  );
}

const visuals: Record<string, React.FC<{ className?: string }>> = {
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

export function getCategoryVisual(category: string) {
  return visuals[category] || GeneralVisual;
}

export {
  AiVisual,
  WebDevVisual,
  DevOpsVisual,
  CybersecurityVisual,
  DatabaseVisual,
  PromptEngineeringVisual,
  GeneralVisual,
  AgentWorkflowVisual,
  VibeCodingVisual,
};
