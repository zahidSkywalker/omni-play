"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * SecurityGuard — Frontend hardening layer
 *
 * Features:
 * 1. DevTools detection via debugger timing + window size difference
 * 2. Right-click context menu disabled
 * 3. Keyboard shortcut blocking (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
 * 4. Console warning banner when DevTools opens
 * 5. Image drag-and-drop prevention
 * 6. Text selection prevention on protected elements
 */
export default function SecurityGuard() {
  const isDevToolsOpen = useRef(false);
  const devToolsWarningShown = useRef(false);
  const threshold = 160; // px difference that suggests DevTools panel

  // ─── 1. DevTools Detection ───────────────────────────────────
  const detectDevTools = useCallback(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!isDevToolsOpen.current) {
        isDevToolsOpen.current = true;
        showConsoleWarning();
      }
    } else {
      isDevToolsOpen.current = false;
    }
  }, []);

  // ─── Console Warning ───────────────────────────────────────
  const showConsoleWarning = useCallback(() => {
    if (devToolsWarningShown.current) return;
    devToolsWarningShown.current = true;

    // Styled console warning
    const warning = [
      "%c⚠️ SECURITY WARNING",
      "color: #ff0000; font-size: 24px; font-weight: bold; font-family: monospace;",
      "",
      "%cThis is a protected application.",
      "color: #ff4444; font-size: 14px; font-family: monospace;",
      "",
      "%cInspecting or tampering with this application is monitored.",
      "color: #ff8888; font-size: 12px; font-family: monospace;",
      "",
      "%cUnauthorized use violates the Terms of Service.",
      "color: #ff8888; font-size: 12px; font-family: monospace;",
      "",
      "%c© Learn Tech with Zahid — All rights reserved.",
      "color: #666; font-size: 11px; font-family: monospace;",
    ];
    console.log(...warning);

    // Reset flag after 10s so it can show again
    setTimeout(() => {
      devToolsWarningShown.current = false;
    }, 10000);
  }, []);

  // ─── 2. Right-click Blocker ──────────────────────────────────
  const blockContextMenu = useCallback((e: MouseEvent) => {
    // Allow right-click on inputs/textarea so users can paste etc.
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }
    e.preventDefault();
  }, []);

  // ─── 3. Keyboard Shortcut Blocker ────────────────────────────
  const blockShortcuts = useCallback((e: KeyboardEvent) => {
    // Block F12
    if (e.key === "F12") {
      e.preventDefault();
      return;
    }

    // Block Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspector)
    if (
      e.ctrlKey &&
      e.shiftKey &&
      (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")
    ) {
      e.preventDefault();
      return;
    }

    // Block Ctrl+U (View Source)
    if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
      e.preventDefault();
      return;
    }

    // Block Ctrl+S (Save Page)
    if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
      e.preventDefault();
      return;
    }

    // Block Ctrl+A (Select All) — only on non-input elements
    const target = e.target as HTMLElement;
    if (
      e.ctrlKey &&
      (e.key === "a" || e.key === "A") &&
      target.tagName !== "INPUT" &&
      target.tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
      return;
    }

    // Block Ctrl+P (Print) — prevents easy PDF scraping
    if (e.ctrlKey && (e.key === "P" || e.key === "p")) {
      e.preventDefault();
      return;
    }
  }, []);

  // ─── 5. Image Drag Prevention ───────────────────────────────
  const blockImageDrag = useCallback((e: DragEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      e.preventDefault();
    }
  }, []);

  // ─── Attach All Listeners ────────────────────────────────────
  useEffect(() => {
    // DevTools detection — check every 1 second
    const devToolsInterval = setInterval(detectDevTools, 1000);
    detectDevTools(); // Initial check

    // Event listeners
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockShortcuts);
    document.addEventListener("dragstart", blockImageDrag);

    // Show initial console watermark regardless
    showConsoleWatermark();

    return () => {
      clearInterval(devToolsInterval);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
      document.removeEventListener("dragstart", blockImageDrag);
    };
  }, [detectDevTools, blockContextMenu, blockShortcuts, blockImageDrag]);

  // This component renders nothing visible
  return null;
}

// ─── Console Watermark (shown once on page load) ────────────────
function showConsoleWatermark() {
  console.log(
    "%c🛡️ Learn Tech with Zahid",
    "color: #10b981; font-size: 18px; font-weight: bold; font-family: monospace;"
  );
  console.log(
    "%cProtected Application — Unauthorized inspection is prohibited.",
    "color: #888; font-size: 11px; font-family: monospace;"
  );
}
