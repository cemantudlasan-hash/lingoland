"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Gift } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function HolidayCountdown() {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [timeLeftXmas, setTimeLeftXmas] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timeLeftNY, setTimeLeftNY] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      setCurrentYear(currentYear);
      
      // Christmas target
      let xmasDate = new Date(currentYear, 11, 25); // Dec 25
      if (now.getTime() > xmasDate.getTime()) {
        xmasDate = new Date(currentYear + 1, 11, 25);
      }
      
      // New Year target
      let nyDate = new Date(currentYear, 0, 1); // Jan 1
      if (now.getTime() > nyDate.getTime()) {
        nyDate = new Date(currentYear + 1, 0, 1);
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

      setTimeLeftXmas(getDiff(xmasDate));
      setTimeLeftNY(getDiff(nyDate));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative bg-background/50 rounded-md p-2 min-w-[50px] sm:min-w-[60px] flex justify-center backdrop-blur-sm border border-border/50">
        <span className="text-xl sm:text-2xl font-bold tracking-tighter">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase mt-1 tracking-wider">{label}</span>
    </div>
  );

  return (
    <Card className="w-full max-w-md border-primary/20 bg-background/40 backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(var(--primary),0.3)]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Holiday Season {currentYear}
          </span>
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Christmas Countdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-red-500/90 dark:text-red-400">
            <Gift className="w-4 h-4" />
            <span>Christmas {currentYear}</span>
          </div>
          <div className="flex justify-between gap-2">
            <TimeUnit value={timeLeftXmas.days} label="Days" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftXmas.hours} label="Hours" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftXmas.minutes} label="Mins" />
            <span className="text-xl font-bold mt-2 text-muted-foreground/50">:</span>
            <TimeUnit value={timeLeftXmas.seconds} label="Secs" />
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* New Year Countdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-500/90 dark:text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span>New Year {currentYear + 1}</span>
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
