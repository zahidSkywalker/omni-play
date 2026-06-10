"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  /** The text content to animate */
  text: string;
  /** Split by "word" or "character" (default "word") */
  splitBy?: "word" | "character";
  /** Stagger delay between each unit in ms (default 60) */
  stagger?: number;
  /** Base delay before animation starts in ms (default 0) */
  baseDelay?: number;
  /** CSS class for each animated unit wrapper */
  className?: string;
  /** CSS class for the outer container */
  containerClassName?: string;
  /** Whether to trigger on scroll (true) or immediately on mount (false) (default true) */
  scrollReveal?: boolean;
  /** IntersectionObserver threshold when scrollReveal is true */
  threshold?: number;
  /** Highlight specific words with gradient-text class */
  highlightWords?: string[];
}

/**
 * AnimatedText — Reveals text word-by-word or character-by-character
 * with a stagger effect. Supports scroll-triggered reveal and word highlighting.
 *
 * Uses pure CSS transitions (no Framer Motion) for performance.
 * Tailwind v4: transitions `translate` (not `transform`) + `filter` + `opacity`.
 */
export default function AnimatedText({
  text,
  splitBy = "word",
  stagger = 60,
  baseDelay = 0,
  className,
  containerClassName,
  scrollReveal = true,
  threshold = 0.2,
  highlightWords = [],
}: AnimatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(!scrollReveal);

  useEffect(() => {
    if (!scrollReveal) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollReveal, threshold]);

  // Split text into units (words or characters)
  const units = splitBy === "word" ? text.split(" ") : text.split("");

  // Tailwind v4 uses native `translate` and `filter` — not `transform`
  const transitionStyle: React.CSSProperties = {
    transitionProperty: "opacity, translate, filter",
    transitionDuration: "0.5s",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <span ref={ref} className={cn("inline-block", containerClassName)} aria-label={text}>
      {units.map((unit, i) => {
        transitionStyle.transitionDelay = `${baseDelay + i * stagger}ms`;

        const isHighlighted = splitBy === "word" && highlightWords.includes(unit);
        // For word split, add space after each word except the last
        const displayText = splitBy === "word" ? (i < units.length - 1 ? `${unit} ` : unit) : unit;

        return (
          <span
            key={i}
            className={cn(
              "inline-block",
              isVisible
                ? "opacity-100 translate-y-0 blur-0"
                : "opacity-0 translate-y-3 blur-[2px]",
              isHighlighted && "gradient-text",
              className
            )}
            style={{ ...transitionStyle }}
          >
            {displayText}
          </span>
        );
      })}
    </span>
  );
}
