"use client";

import { useEffect, useState, useRef } from "react";

/**
 * ExamSectionVideo — Contained video background for the Active Examinations section.
 * Video plays behind the header + search area, smoothly fades out before the exam cards.
 */
export default function ExamSectionVideo() {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      const v = videoRef.current;
      if (v && v.readyState >= 2 && v.paused) {
        v.play().catch(() => {});
      }
    }, 6000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <div className="absolute inset-x-0 top-0 z-0 pointer-events-none">
      {/* Video container — positioned to cover only the header + search area */}
      <div className="relative h-[320px] sm:h-[300px] overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => { setIsLoaded(true); videoRef.current?.play().catch(() => {}); }}
          onCanPlayThrough={() => { setIsLoaded(true); videoRef.current?.play().catch(() => {}); }}
          onError={() => {}}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <source
            src="https://res.cloudinary.com/dbi2rwlso/video/upload/v1780738379/hero-bg/exam-section-seamless.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/50 to-gray-950/95" />

        {/* Subtle teal glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 via-transparent to-teal-900/10" />

        {/* Bottom fade — smooth edge that dissolves into the page background */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
      </div>

      {/* Rounded bottom corners mask for smooth frame edges */}
      <div className="absolute bottom-0 left-0 right-0 h-4 overflow-hidden">
        <div className="w-full h-full bg-gray-950" style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }} />
      </div>
    </div>
  );
}
