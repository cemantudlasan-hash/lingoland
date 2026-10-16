'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StudyRoomLoadingScreenProps {
  statusText?: string;
}

export function StudyRoomLoadingScreen({ statusText }: StudyRoomLoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950 text-white rounded-3xl select-none"
    >
      {/* Deep atmospheric backdrop blur matching the image edge tones */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-50 scale-110"
        style={{ backgroundImage: "url('/study-room-loading.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/40" />

      {/* Main aspect-locked image container so all overlay positions remain 100% pixel-perfect */}
      <div className="relative w-full h-full max-w-[1400px] max-h-full flex items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-h-full aspect-[1024/562] flex items-center justify-center">
          {/* Authentic uploaded loading screen graphic */}
          <img 
            src="/study-room-loading.jpg" 
            alt="LingoLandverse Study Room Loading" 
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
          />

          {/* Animated Glowing Cyan Segmented Progress Wheel positioned PRECISELY on the circle in the photo */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
            style={{ 
              left: '51.66%', 
              top: '58.63%', 
              width: '11.5%', 
              height: '21.0%' 
            }}
          >
            {/* Dark backing to mask the static pixels under the spinning segments */}
            <div className="absolute inset-0 rounded-full bg-[#0a1e2f] shadow-[inset_0_0_12px_rgba(6,182,212,0.5)]" />

            {/* Glowing animated rotating 12-segment radial spinner */}
            <svg 
              className="relative z-10 w-full h-full animate-spin text-cyan-400 drop-shadow-[0_0_16px_rgba(6,182,212,0.95)]" 
              viewBox="0 0 100 100"
              style={{ animationDuration: '1.25s' }}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 360) / 12;
                const opacity = Math.max(0.18, (i + 1) / 12);
                return (
                  <rect
                    key={i}
                    x="45"
                    y="6"
                    width="10"
                    height="21"
                    rx="5"
                    fill="currentColor"
                    opacity={opacity}
                    transform={`rotate(${angle} 50 50)`}
                  />
                );
              })}
            </svg>

            {/* Inner pulsing cyan energy core */}
            <div className="absolute w-6 h-6 rounded-full bg-cyan-400/30 blur-[2px] animate-pulse" />
          </div>

          {/* Animated concentric pulse along the outer circular HUD ring */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none shadow-[0_0_30px_rgba(6,182,212,0.25)]"
            style={{ 
              left: '51.66%', 
              top: '58.63%', 
              width: '43.5%', 
              height: '79.0%',
              animationDuration: '2.5s' 
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

