"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ClefConversationBubbleProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Native dimensions of /images/cockpit-hero.jpg
const NATIVE_IMAGE_WIDTH = 1376;
const NATIVE_IMAGE_HEIGHT = 768;
const IMAGE_ASPECT = NATIVE_IMAGE_WIDTH / NATIVE_IMAGE_HEIGHT;

// Exact pixel coordinates of Clef's helmet apex in the native 1376x768 image
const CLEF_X_RATIO = 1017 / NATIVE_IMAGE_WIDTH; // ~0.7391 (73.91% from left)
const CLEF_Y_RATIO = 266 / NATIVE_IMAGE_HEIGHT; // ~0.3464 (34.64% from top)

export function ClefConversationBubble({ containerRef }: ClefConversationBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubbleCoords, setBubbleCoords] = useState<{
    left: number;
    top: number;
    tailLeft: number;
    isReady: boolean;
  }>({
    left: 0,
    top: 0,
    tailLeft: 24,
    isReady: false,
  });

  const [clickCount, setClickCount] = useState(0);

  // Recalculate exact position whenever container resizes or mounts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updatePosition = () => {
      const rect = container.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (W === 0 || H === 0) return;

      const containerAspect = W / H;
      let renderedWidth: number;
      let renderedHeight: number;
      let offsetX: number;
      let offsetY: number;

      // Match CSS object-fit: cover; object-position: center
      if (containerAspect > IMAGE_ASPECT) {
        // Container is wider than image aspect ratio (widescreen)
        renderedWidth = W;
        renderedHeight = W / IMAGE_ASPECT;
        offsetX = 0;
        offsetY = (H - renderedHeight) / 2;
      } else {
        // Container is narrower than image aspect ratio (tablet, mobile, etc.)
        renderedHeight = H;
        renderedWidth = H * IMAGE_ASPECT;
        offsetX = (W - renderedWidth) / 2;
        offsetY = 0;
      }

      // Clef helmet apex in container pixel coordinates
      const clefX = offsetX + CLEF_X_RATIO * renderedWidth;
      const clefY = offsetY + CLEF_Y_RATIO * renderedHeight;

      const bubbleEl = bubbleRef.current;
      const bubbleW = bubbleEl ? bubbleEl.offsetWidth : 160;
      const bubbleH = bubbleEl ? bubbleEl.offsetHeight : 38;

      // Position bubble centered above Clef's helmet
      const targetLeft = clefX - bubbleW / 2;

      // Clamp left position so bubble stays safely inside container on mobile / small screens
      const minLeft = 10;
      const maxLeft = Math.max(minLeft, W - bubbleW - 10);
      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, targetLeft));

      // Tail aligns directly to Clef's helmet relative to the bubble
      const rawTailLeft = clefX - clampedLeft;
      const minTailLeft = 14;
      const maxTailLeft = Math.max(minTailLeft, bubbleW - 14);
      const clampedTailLeft = Math.max(minTailLeft, Math.min(maxTailLeft, rawTailLeft));

      // Position bubble just above Clef's helmet
      const targetTop = Math.max(8, clefY - bubbleH - 8);

      setBubbleCoords({
        left: clampedLeft,
        top: targetTop,
        tailLeft: clampedTailLeft,
        isReady: true,
      });
    };

    updatePosition();

    // ResizeObserver ensures continuous synchronization across orientation changes and window resizing
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });
    resizeObserver.observe(container);

    window.addEventListener("resize", updatePosition, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, [containerRef]);

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: bubbleCoords.isReady ? 1 : 0,
        scale: bubbleCoords.isReady ? 1 : 0.8,
        y: [0, -3.5, 0],
      }}
      transition={{
        y: { repeat: Infinity, duration: 2.6, ease: "easeInOut" },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      }}
      style={{
        position: "absolute",
        left: `${bubbleCoords.left}px`,
        top: `${bubbleCoords.top}px`,
      }}
      onClick={() => setClickCount((c) => c + 1)}
      className="z-20 pointer-events-auto select-none group/clef cursor-pointer transition-transform active:scale-95"
      title="Clef, your LingoLandVerse Copilot"
    >
      <div className="relative bg-slate-950/90 hover:bg-slate-900 border-2 border-cyan-400 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl shadow-[0_0_18px_rgba(6,182,212,0.6)] backdrop-blur-xl flex items-center gap-1.5">
        <span className="text-xs sm:text-sm animate-wave">👋</span>
        <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-wide text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] whitespace-nowrap">
          Hi, my name is <span className="text-cyan-300 font-extrabold">Clef</span>!
        </span>

        {/* Dynamic Speech Bubble Pointer (Tail) pointing straight down to Clef's helmet */}
        <div
          style={{ left: `${bubbleCoords.tailLeft - 6}px` }}
          className="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400"
        />
        <div
          style={{ left: `${bubbleCoords.tailLeft - 5}px` }}
          className="absolute -bottom-[6px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-950"
        />
      </div>
    </motion.div>
  );
}
