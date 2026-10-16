'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Globe, Headphones, MessageSquare, Mic, Sparkles } from 'lucide-react';

interface StudyRoomLoadingScreenProps {
  statusText?: string;
}

export function StudyRoomLoadingScreen({ statusText = 'Creating Your Study Room' }: StudyRoomLoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white rounded-3xl"
    >
      {/* Blurred 3D Study Room background matching uploaded photo */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 filter blur-[3px] brightness-[0.85]"
        style={{ backgroundImage: "url('/study-room-loading.jpg')" }}
      />
      
      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/50" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full max-h-[640px] py-10 px-4 w-full">
        {/* Top Header */}
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] text-center font-display"
        >
          LingoLandverse Study Room
        </motion.h1>

        {/* Center Circular HUD Portal */}
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, type: 'spring', damping: 20 }}
          className="relative flex items-center justify-center w-[290px] h-[290px] sm:w-[350px] sm:h-[350px]"
        >
          {/* Outer glowing cyan ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-cyan-400/70 shadow-[0_0_40px_rgba(6,182,212,0.55),inset_0_0_30px_rgba(6,182,212,0.25)] pointer-events-none animate-pulse duration-[3000ms]" />

          {/* Secondary thin guide ring */}
          <div className="absolute inset-[10px] rounded-full border border-cyan-300/30 pointer-events-none" />

          {/* Ambient cyan glow backdrop */}
          <div className="absolute inset-[30px] rounded-full bg-slate-950/80 backdrop-blur-md shadow-[inset_0_0_40px_rgba(6,182,212,0.3)] border border-cyan-500/30" />

          {/* Top Logo Badge on Ring */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-[9px] font-black">
              L
            </span>
            <span className="text-[11px] font-extrabold tracking-wider text-cyan-200">
              LingoLandverse
            </span>
          </div>

          {/* Orbiting micro-icons along the perimeter arc */}
          <div className="absolute top-8 left-8 w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <MessageSquare className="w-3 h-3" />
          </div>
          <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <Globe className="w-3 h-3" />
          </div>
          <div className="absolute bottom-12 left-6 w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <Brain className="w-3 h-3" />
          </div>
          <div className="absolute bottom-12 right-6 w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <Headphones className="w-3 h-3" />
          </div>

          {/* Inner Content: LOADING..., Rotating Segmented Spinner, Creating Your Study Room */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 gap-4 sm:gap-5">
            {/* "LOADING..." */}
            <span className="text-sm sm:text-base font-black tracking-[0.25em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] uppercase">
              LOADING...
            </span>

            {/* Glowing Segmented Cyan Radial Progress Wheel */}
            <div className="relative flex items-center justify-center">
              <svg 
                className="w-16 h-16 sm:w-20 sm:h-20 animate-spin text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.9)]" 
                viewBox="0 0 100 100"
                style={{ animationDuration: '1.2s' }}
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12;
                  const opacity = Math.max(0.12, (i + 1) / 12);
                  return (
                    <rect
                      key={i}
                      x="45"
                      y="8"
                      width="10"
                      height="18"
                      rx="5"
                      fill="currentColor"
                      opacity={opacity}
                      transform={`rotate(${angle} 50 50)`}
                    />
                  );
                })}
              </svg>
              {/* Inner core subtle pulse */}
              <div className="absolute w-8 h-8 rounded-full bg-cyan-400/20 blur-sm animate-ping" />
            </div>

            {/* Subtitle text: "Creating Your Study Room" */}
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-cyan-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {statusText}
            </span>
          </div>
        </motion.div>

        {/* Bottom subtle brand note */}
        <div className="h-6 flex items-center">
          <span className="text-[11px] font-bold text-cyan-200/70 tracking-widest uppercase flex items-center gap-1.5 drop-shadow">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            Acoustic Language Learning Ecosystem
          </span>
        </div>
      </div>
    </motion.div>
  );
}
