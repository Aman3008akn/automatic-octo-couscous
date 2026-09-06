"use client";

import { useEffect } from "react";

/**
 * PwaZoomLock locks pinch-to-zoom, gesture zoom, and accidental double-tap zoom
 * on mobile devices (iOS Safari and Android Chrome standalone PWA)
 * to deliver a 100% native mobile app feeling.
 */
export function PwaZoomLock() {
  useEffect(() => {
    // 1. Prevent Safari gesture zooming (pinch in / pinch out)
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("gesturestart", handleGesture, { passive: false });
    document.addEventListener("gesturechange", handleGesture, { passive: false });
    document.addEventListener("gestureend", handleGesture, { passive: false });

    // 2. Prevent multi-touch pinch zooming
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    // 3. Prevent double-tap to zoom on mobile
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        // Do not block normal taps on form inputs or buttons, but prevent double-tap zoom
        const target = e.target as HTMLElement | null;
        const isInteractive = target && (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a")
        );
        if (!isInteractive) {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    };
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", handleGesture);
      document.removeEventListener("gesturechange", handleGesture);
      document.removeEventListener("gestureend", handleGesture);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return null;
}
