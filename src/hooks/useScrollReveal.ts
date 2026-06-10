"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseScrollRevealOptions {
  /** Threshold 0-1: how much of the element must be visible to trigger (default 0.1) */
  threshold?: number;
  /** Root margin for the observer (default "0px 0px -60px 0px") */
  rootMargin?: string;
  /** Only trigger once (default true) */
  once?: boolean;
}

/**
 * useScrollReveal — IntersectionObserver hook that reveals elements on scroll.
 * Returns a ref to attach to the target element and a boolean `isVisible`.
 */
export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px 0px -60px 0px", once = true } = options;
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
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, handleIntersect]);

  return { ref, isVisible };
}
