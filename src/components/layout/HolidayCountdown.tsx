"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useSeasonalTheme } from "@/context/seasonal-theme-context";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface HolidayCountdownProps {
  className?: string;
}

export function HolidayCountdown({ className = "" }: HolidayCountdownProps) {
  const { activeTheme, isThemeActiveForUser, settings: seasonalSettings } = useSeasonalTheme();
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [timeLeftPrimary, setTimeLeftPrimary] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timeLeftNY, setTimeLeftNY] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const now = new Date();
      const year = now.getFullYear();
      setCurrentYear(year);

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
      } else {
        if (now.getTime() > primaryTarget.getTime()) {
          primaryTarget = new Date(year + 1, 11, 25);
        }
      }

      let nyDate = new Date(year, 0, 1);
      if (now.getTime() > nyDate.getTime()) {
        nyDate = new Date(year + 1, 0, 1);
      }

      const getDiff = (target: Date) => {
        const difference = target.getTime() - now.getTime();
        if (difference > 0) {
          return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
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

  let primaryLabel = `Christmas ${currentYear}`;
  let primaryEmoji = "🎄";
  if (isSeasonalActive) {
    if (activeTheme.id === 'songkran') {
      primaryLabel = `Songkran Water Festival ${currentYear}`;
      primaryEmoji = "💦";
    } else if (activeTheme.id === 'halloween') {
      primaryLabel = `Halloween ${currentYear}`;
      primaryEmoji = "🎃";
    } else if (activeTheme.id === 'valentine') {
      primaryLabel = `Valentine's Day ${currentYear}`;
      primaryEmoji = "💖";
    } else if (activeTheme.id === 'lunar_new_year') {
      primaryLabel = `Lunar New Year ${currentYear}`;
      primaryEmoji = "🧧";
    }
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative bg-background/50 rounded-md p-2 min-w-[50px] sm:min-w-[60px] flex justify-center backdrop-blur-sm border border-border/50 shadow-inner">
        <span className="text-xl sm:text-2xl font-bold tracking-tighter">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase mt-1 tracking-wider">{label}</span>
    </div>
  );

  return (
    <Card
      className={`w-full backdrop-blur-xl shadow-xl rounded-2xl flex flex-col justify-between transition-all duration-700 ${
        isSeasonalActive
          ? `bg-zinc-950/85 border-2 ${activeTheme.borderColor}`
          : "border-teal-500/25 bg-zinc-950/75"
      } ${className}`}
      style={{
        boxShadow: isSeasonalActive
          ? `0 0 40px ${activeTheme.glowColor}`
          : undefined,
      }}
    >
      <CardHeader className="text-center pb-2 pt-5">
        <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black tracking-tight">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-200 to-indigo-400">
            {isSeasonalActive ? `${activeTheme.name} ${currentYear}` : `Holiday Season ${currentYear}`}
          </span>
          <span className="text-xl">{isSeasonalActive ? activeTheme.emoji : "✨"}</span>
        </CardTitle>
        {isSeasonalActive && (
          <p className="text-xs text-cyan-300/80 font-medium pt-0.5">
            {seasonalSettings.customBadgeText || activeTheme.defaultBadgeText}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pb-5 flex-1 flex flex-col justify-around">
        {/* Primary Holiday Countdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
            <span className="text-base">{primaryEmoji}</span>
            <span>{primaryLabel}</span>
          </div>
          <div className="flex justify-between gap-2">
            <TimeUnit value={timeLeftPrimary.days} label="Days" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftPrimary.hours} label="Hours" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftPrimary.minutes} label="Mins" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftPrimary.seconds} label="Secs" />
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* New Year Countdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-500/90 dark:text-cyan-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>New Year Countdown {currentYear + 1}</span>
          </div>
          <div className="flex justify-between gap-2">
            <TimeUnit value={timeLeftNY.days} label="Days" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftNY.hours} label="Hours" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftNY.minutes} label="Mins" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftNY.seconds} label="Secs" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
