"use client";

import React from "react";

/**
 * SvgDecorations — Subtle animated SVG decorative elements that enhance
 * the visual appeal of sections without impacting performance.
 * Uses the platform's emerald/teal/cyan color palette.
 */

/** Floating geometric shapes — positioned absolutely in a section */
export function FloatingShapes({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`} aria-hidden="true">
      {/* Rotating hexagon outline — top-right */}
      <svg
        className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.04] animate-[spin_30s_linear_infinite]"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
          stroke="currentColor"
          strokeWidth="1"
          className="text-emerald-400"
        />
      </svg>

      {/* Pulsing circle — bottom-left */}
      <svg
        className="absolute -bottom-6 -left-6 w-24 h-24 opacity-[0.05]"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="1"
          className="text-teal-400 animate-[draw-stroke_3s_ease-out_infinite]"
          strokeDasharray="251"
          strokeDashoffset="251"
        />
      </svg>

      {/* Floating dots cluster — center-right */}
      <svg
        className="absolute top-1/3 -right-4 w-16 h-40 opacity-[0.06]"
        viewBox="0 0 16 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[0, 40, 80, 120].map((y, i) => (
          <circle
            key={i}
            cx="8"
            cy={y + 20}
            r="2"
            className="text-cyan-400 animate-[float-dot_4s_ease-in-out_infinite]"
            fill="currentColor"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}
      </svg>

      {/* Small diamond — top-left */}
      <svg
        className="absolute top-12 left-8 w-8 h-8 opacity-[0.04] animate-[spin_20s_linear_infinite]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1"
          className="text-emerald-400"
          transform="rotate(45 10 10)"
        />
      </svg>
    </div>
  );
}

/** Animated gradient line separator between sections */
export function AnimatedLineDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-md mx-auto h-[2px] ${className}`} aria-hidden="true">
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 400 4"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="30%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Animated traveling glow dot */}
        <line x1="0" y1="2" x2="400" y2="2" stroke="url(#line-grad)" strokeWidth="2" />
        <circle
          cx="0"
          cy="2"
          r="3"
          fill="#14b8a6"
          className="animate-[travel-dot_4s_ease-in-out_infinite]"
        />
      </svg>
    </div>
  );
}

/** Corner accent — decorative bracket/corner marks for section headers */
export function CornerAccents({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none z-0 ${className}`} aria-hidden="true">
      {/* Top-left corner */}
      <svg className="absolute top-0 left-0 w-8 h-8 opacity-[0.12]" viewBox="0 0 32 32" fill="none">
        <path d="M2 12V2H12" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 20V30H12" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0" />
      </svg>
      {/* Top-right corner */}
      <svg className="absolute top-0 right-0 w-8 h-8 opacity-[0.12]" viewBox="0 0 32 32" fill="none">
        <path d="M30 12V2H20" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* Bottom-left corner */}
      <svg className="absolute bottom-0 left-0 w-8 h-8 opacity-[0.08]" viewBox="0 0 32 32" fill="none">
        <path d="M2 20V30H12" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {/* Bottom-right corner */}
      <svg className="absolute bottom-0 right-0 w-8 h-8 opacity-[0.08]" viewBox="0 0 32 32" fill="none">
        <path d="M30 20V30H20" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Orbiting ring — a thin rotating ring around a center point */
export function OrbitingRing({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute pointer-events-none opacity-[0.06] ${className}`}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="8 12"
        className="text-emerald-400 animate-[spin_25s_linear_infinite]"
      />
      <circle
        cx="60"
        cy="10"
        r="3"
        className="text-teal-400 animate-[spin_25s_linear_infinite] origin-center"
        fill="currentColor"
        style={{ transformOrigin: "60px 60px" }}
      />
    </svg>
  );
}
