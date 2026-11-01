"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Calendar, Clock, Flame } from "lucide-react";
import { useSeasonalTheme } from "@/context/seasonal-theme-context";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

interface HolidayCountdownProps {
  className?: string;
}

export function HolidayCountdown({ className = "" }: HolidayCountdownProps) {
  const { activeTheme, isThemeActiveForUser, settings: seasonalSettings } = useSeasonalTheme();
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [timeLeftPrimary, setTimeLeftPrimary] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
  const [timeLeftNY, setTimeLeftNY] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
  const [yearProgress, setYearProgress] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const now = new Date();
      const year = now.getFullYear();
      setCurrentYear(year);

      // Annual year completion percentage
      const startOfYear = new Date(year, 0, 1).getTime();
      const endOfYear = new Date(year + 1, 0, 1).getTime();
      const currentProgress = Math.min(100, Math.max(0, ((now.getTime() - startOfYear) / (endOfYear - startOfYear)) * 100));
      setYearProgress(Number(currentProgress.toFixed(1)));

      let primaryTarget = new Date(year, 11, 25);
      const themeId = isThemeActiveForUser ? activeTheme.id : 'default';

      if (themeId === 'songkran') {
        primaryTarget = new Date(year, 3, 13);
        if (now.getTime() > primaryTarget.getTime() + 3 * 24 * 60 * 60 * 1000) {
          primaryTarget = new Date(year + 1, 3, 13);
        }
      } else if (themeId === 'halloween') {
        primaryTarget = new Date(year, 9, 31);
        if (now.getTime() > primaryTarget.getTime()) {
          primaryTarget = new Date(year + 1, 9, 31);
        }
      } else if (themeId === 'valentine') {
        primaryTarget = new Date(year, 1, 14);
        if (now.getTime() > primaryTarget.getTime()) {
          primaryTarget = new Date(year + 1, 1, 14);
        }
      } else if (themeId === 'lunar_new_year') {
        primaryTarget = new Date(year, 1, 17); // Approx late Jan / Feb
        if (now.getTime() > primaryTarget.getTime()) {
          primaryTarget = new Date(year + 1, 1, 17);
        }
      } else {
        if (now.getTime() > primaryTarget.getTime()) {
          primaryTarget = new Date(year + 1, 11, 25);
        }
      }

      let nyDate = new Date(year, 0, 1);
      if (now.getTime() > nyDate.getTime()) {
        nyDate = new Date(year + 1, 0, 1);
      }

      const getDiff = (target: Date): TimeLeft => {
        const difference = target.getTime() - now.getTime();
        if (difference > 0) {
          return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            totalMs: difference,
          };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
      };

      setTimeLeftPrimary(getDiff(primaryTarget));
      setTimeLeftNY(getDiff(nyDate));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [isThemeActiveForUser, activeTheme]);

  if (!mounted) return null;

  const isSeasonalActive = isThemeActiveForUser && activeTheme.id !== 'default';

  let primaryLabel = `Christmas Day`;
  let primaryTargetDateStr = `Dec 25, ${currentYear}`;
  let primaryEmoji = "🎄";
  let primaryThemeGlow = "rgba(16, 185, 129, 0.25)";
  let primaryAccentColor = "from-emerald-400 to-teal-300";

  if (isSeasonalActive) {
    if (activeTheme.id === 'songkran') {
      primaryLabel = `Songkran Water Festival`;
      primaryTargetDateStr = `Apr 13-15, ${currentYear}`;
      primaryEmoji = "💦";
      primaryThemeGlow = "rgba(6, 182, 212, 0.3)";
      primaryAccentColor = "from-cyan-400 via-sky-300 to-blue-400";
    } else if (activeTheme.id === 'halloween') {
      primaryLabel = `Halloween`;
      primaryTargetDateStr = `Oct 31, ${currentYear}`;
      primaryEmoji = "🎃";
      primaryThemeGlow = "rgba(249, 115, 22, 0.35)";
      primaryAccentColor = "from-orange-400 via-amber-300 to-purple-400";
    } else if (activeTheme.id === 'valentine') {
      primaryLabel = `Valentine's Day`;
      primaryTargetDateStr = `Feb 14, ${currentYear}`;
      primaryEmoji = "💖";
      primaryThemeGlow = "rgba(236, 72, 153, 0.3)";
      primaryAccentColor = "from-pink-400 via-rose-300 to-red-400";
    } else if (activeTheme.id === 'lunar_new_year') {
      primaryLabel = `Lunar New Year`;
      primaryTargetDateStr = `Spring Festival ${currentYear}`;
      primaryEmoji = "🧧";
      primaryThemeGlow = "rgba(239, 68, 68, 0.3)";
      primaryAccentColor = "from-red-400 via-amber-300 to-yellow-400";
    }
  }

  // Futuristic Glassmorphic Digit Vault Card with Split Groove
  const TimeUnit = ({ 
    value, 
    label, 
    accent = "cyan" 
  }: { 
    value: number; 
    label: string;
    accent?: "cyan" | "orange" | "amber" | "emerald";
  }) => {
    const formatted = value.toString().padStart(2, "0");

    const accentGradient = 
      accent === "orange" ? "from-orange-200 via-amber-100 to-orange-400" :
      accent === "amber" ? "from-amber-200 via-yellow-100 to-amber-300" :
      accent === "emerald" ? "from-emerald-200 via-teal-100 to-emerald-300" :
      "from-white via-cyan-100 to-teal-300";

    const glowColor =
      accent === "orange" ? "shadow-[0_0_15px_rgba(249,115,22,0.15)]" :
      accent === "amber" ? "shadow-[0_0_15px_rgba(234,179,8,0.15)]" :
      accent === "emerald" ? "shadow-[0_0_15px_rgba(16,185,129,0.15)]" :
      "shadow-[0_0_15px_rgba(34,211,238,0.15)]";

    return (
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div 
          className={cn(
            "relative w-full py-2 sm:py-2.5 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center backdrop-blur-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-black/40 overflow-hidden transition-all duration-300 hover:scale-[1.03]",
            glowColor
          )}
        >
          {/* Top Beveled Edge Glass Light */}
          <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Luxury Horizontal Split Groove Line (Chronometer Flip-Plate Aesthetic) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/60 shadow-[0_1px_0_rgba(255,255,255,0.08)] pointer-events-none z-10" />

          {/* Numbers with Metallic Gradient & Tabular Figures */}
          <span className={cn(
            "font-mono text-xl sm:text-2xl md:text-3xl font-black tracking-tight tabular-nums relative z-0 select-none bg-gradient-to-b bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]",
            accentGradient
          )}>
            {formatted}
          </span>
        </div>

        {/* Crisp High-Contrast Micro Tag */}
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1.5 font-sans">
          {label}
        </span>
      </div>
    );
  };

  const ColonSeparator = () => (
    <div className="flex flex-col items-center justify-center gap-1.5 px-0.5 sm:px-1 pt-1 sm:pt-2 text-cyan-400/60 select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 shadow-[0_0_6px_rgba(34,211,238,0.8)] animate-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 shadow-[0_0_6px_rgba(34,211,238,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  );

  return (
    <Card
      className={cn(
        "w-full h-full backdrop-blur-2xl rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-700 select-none group",
        isSeasonalActive
          ? `bg-slate-950/95 border-2 ${activeTheme.borderColor}`
          : "border border-cyan-500/30 bg-slate-950/85 hover:border-cyan-400/50 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
      )}
      style={{
        boxShadow: isSeasonalActive
          ? `0 0 50px ${activeTheme.glowColor}, inset 0 0 25px ${activeTheme.glowColor}`
          : undefined,
      }}
    >
      {/* Ambient Neon Atmosphere Orbs */}
      <div 
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          backgroundColor: isSeasonalActive ? activeTheme.accentColor : '#06b6d4', 
          opacity: isSeasonalActive ? 0.22 : 0.18 
        }} 
      />
      <div 
        className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          backgroundColor: isSeasonalActive ? activeTheme.accentColor : '#6366f1', 
          opacity: isSeasonalActive ? 0.22 : 0.15 
        }} 
      />

      {/* Sleek Top Edge Highlight */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {/* ── Header ── */}
      <CardHeader className="p-0 pb-3 sm:pb-3.5 relative z-10">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.25)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span className={cn("bg-clip-text text-transparent bg-gradient-to-r", primaryAccentColor)}>
                  {isSeasonalActive ? activeTheme.name : `Holiday Observatory`}
                </span>
                <span className="text-base sm:text-lg">{isSeasonalActive ? activeTheme.emoji : "✨"}</span>
              </CardTitle>
            </div>
          </div>

          {/* Live Sync Beacon Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>Live Sync</span>
          </div>
        </div>

        {isSeasonalActive && (
          <div className="mt-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2 text-xs text-slate-200">
            <span className="text-sm">{activeTheme.emoji}</span>
            <span className="font-semibold truncate">
              {seasonalSettings.customBadgeText || activeTheme.defaultBadgeText}
            </span>
          </div>
        )}
      </CardHeader>

      {/* ── Content: Two Luxury Frosted Insets ── */}
      <CardContent className="p-0 space-y-3.5 relative z-10 flex-1 flex flex-col justify-around">

        {/* 1. Primary Holiday Chronometer Inset */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.1] shadow-inner space-y-2.5 relative overflow-hidden group/primary">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-white font-extrabold">
              <span className="text-lg">{primaryEmoji}</span>
              <span className="tracking-tight text-slate-100">{primaryLabel}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/25">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>{primaryTargetDateStr}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 sm:gap-1.5">
            <TimeUnit value={timeLeftPrimary.days} label="Days" accent={isSeasonalActive && activeTheme.id === 'halloween' ? "orange" : "cyan"} />
            <ColonSeparator />
            <TimeUnit value={timeLeftPrimary.hours} label="Hours" accent={isSeasonalActive && activeTheme.id === 'halloween' ? "orange" : "cyan"} />
            <ColonSeparator />
            <TimeUnit value={timeLeftPrimary.minutes} label="Mins" accent={isSeasonalActive && activeTheme.id === 'halloween' ? "orange" : "cyan"} />
            <ColonSeparator />
            <TimeUnit value={timeLeftPrimary.seconds} label="Secs" accent={isSeasonalActive && activeTheme.id === 'halloween' ? "orange" : "cyan"} />
          </div>
        </div>

        {/* 2. New Year Countdown Inset */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.1] shadow-inner space-y-2.5 relative overflow-hidden group/ny">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="tracking-tight text-slate-100">New Year Milestone {currentYear + 1}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/25">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Jan 1, {currentYear + 1}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 sm:gap-1.5">
            <TimeUnit value={timeLeftNY.days} label="Days" accent="amber" />
            <ColonSeparator />
            <TimeUnit value={timeLeftNY.hours} label="Hours" accent="amber" />
            <ColonSeparator />
            <TimeUnit value={timeLeftNY.minutes} label="Mins" accent="amber" />
            <ColonSeparator />
            <TimeUnit value={timeLeftNY.seconds} label="Secs" accent="amber" />
          </div>

          {/* Annual Orbit Completion Micro Progress Bar */}
          <div className="pt-1 space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-amber-400" />
                <span>Annual Cycle Completed</span>
              </span>
              <span className="text-amber-300 font-mono">{yearProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(234,179,8,0.5)] transition-all duration-1000"
                style={{ width: `${yearProgress}%` }}
              />
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
