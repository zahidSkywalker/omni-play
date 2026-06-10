"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type RevealDirection = "up" | "down" | "left" | "right" | "none";
type RevealEffect = "fade" | "slide" | "scale" | "blur";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Direction the element enters from (default "up") */
  direction?: RevealDirection;
  /** Animation effect type (default "slide") */
  effect?: RevealEffect;
  /** Delay in seconds (default 0) */
  delay?: number;
  /** Duration in seconds (default 0.6) */
  duration?: number;
  /** IntersectionObserver threshold (default 0.1) */
  threshold?: number;
  /** CSS class string to merge */
  className?: string;
  /** Whether to only trigger once (default true) */
  once?: boolean;
  /** Disable animation (render children without wrapper) */
  disabled?: boolean;
}

/**
 * ScrollReveal — A wrapper component that reveals its children with
 * a smooth animation when scrolled into view. Uses IntersectionObserver
 * under the hood with zero JS animation libraries.
 *
 * Tailwind v4 uses native CSS `translate` and `scale` properties (not `transform`),
 * so we transition `opacity, translate, scale, filter` instead of `transform`.
 */
export default function ScrollReveal({
  children,
  direction = "up",
  effect = "slide",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className,
  once = true,
  disabled = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (!once) {
          setIsVisible(false);
        }
      }
    },
    [once]
  );

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin: "0px 0px -60px 0px",
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, handleIntersect, disabled]);

  // Build CSS transition string using native Tailwind v4 properties
  const transitionStyle: React.CSSProperties = {
    transitionProperty: "opacity, translate, scale, filter",
    transitionDuration: `${duration}s`,
    transitionDelay: `${delay}s`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  };

  if (disabled) {
    return <>{children}</>;
  }

  // Hidden state classes — using Tailwind v4 native translate/scale
  const getHiddenClass = () => {
    const effectMap: Record<RevealEffect, string> = {
      fade: "opacity-0",
      slide: "opacity-0",
      scale: "opacity-0 scale-[0.96]",
      blur: "opacity-0 blur-[3px]",
    };

    const directionMap: Record<RevealDirection, string> = {
      up: "translate-y-8",
      down: "-translate-y-8",
      left: "translate-x-8",
      right: "-translate-x-8",
      none: "",
    };

    return `${directionMap[direction]} ${effectMap[effect]}`.trim();
  };

  // Visible state — reset all transforms
  const getVisibleClass = () =>
    "opacity-100 translate-x-0 translate-y-0 scale-100 blur-0";

  return (
    <div
      ref={ref}
      className={cn(isVisible ? getVisibleClass() : getHiddenClass(), className)}
      style={transitionStyle}
    >
      {children}
    </div>
  );
}
