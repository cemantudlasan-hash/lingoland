'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Globe, Clock, ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { THAI_AND_INTERNATIONAL_HOLIDAYS } from '@/lib/holidays';

export function BeautifulCalendar() {
  const [today, setToday] = useState(new Date());
  const [currentDayString, setCurrentDayString] = useState(new Date().toDateString());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Timezone and locale parameters
  const userLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const userTimezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';

  // Country detection based on timezone or locale
  const detectedCountry = useMemo(() => {
    const tzLower = userTimezone.toLowerCase();
    const localeLower = userLocale.toLowerCase();
    if (tzLower.includes('bangkok') || localeLower.includes('th')) {
      return { code: 'TH', name: 'Thailand', flag: '🇹🇭' };
    }
    if (tzLower.includes('london') || localeLower.includes('gb') || localeLower.includes('uk')) {
      return { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' };
    }
    if (tzLower.includes('paris') || localeLower.includes('fr')) {
      return { code: 'FR', name: 'France', flag: '🇫🇷' };
    }
    if (tzLower.includes('america') || tzLower.includes('us') || localeLower.includes('us')) {
      return { code: 'US', name: 'United States', flag: '🇺🇸' };
    }
    return { code: 'INT', name: 'International', flag: '🌐' };
  }, [userTimezone, userLocale]);

  // Periodic check to verify if the day has changed (Midnight tracker)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.toDateString() !== currentDayString) {
        setToday(now);
        setViewDate(now);
        setSelectedDay(now.getDate());
        setCurrentDayString(now.toDateString());
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(timer);
  }, [currentDayString]);

  // Compute month days and layouts
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = useMemo(() => {
    return new Intl.DateTimeFormat(userLocale, { month: 'long', year: 'numeric' }).format(viewDate);
  }, [viewDate, userLocale]);

  const weekdays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(userLocale, { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2026, 0, 4 + i); // Jan 4, 2026 is Sunday
      return formatter.format(d);
    });
  }, [userLocale]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    // Empty padding slots for days of previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayIndex, daysInMonth]);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Helper to format date as YYYY-MM-DD
  const getFormattedDateString = (day: number) => {
    const yStr = year;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${yStr}-${mStr}-${dStr}`;
  };

  // Filter and match holidays for the view depending on locale/country
  const activeMonthHolidays = useMemo(() => {
    const list: Record<number, { name: string; type: string }> = {};
    
    THAI_AND_INTERNATIONAL_HOLIDAYS.forEach(h => {
      const [hYear, hMonth, hDay] = h.date.split('-').map(Number);
      // Year-agnostic matching: match month and day only so holidays render correctly in 2026 and future years
      if ((hMonth - 1) === month) {
        const isThaiOnly = h.type === 'thai_public';
        if (detectedCountry.code === 'TH' || !isThaiOnly) {
          list[hDay] = { name: h.name, type: h.type };
        }
      }
    });

    return list;
  }, [month, detectedCountry]);

  // Selected date info
  const selectedHolidayInfo = useMemo(() => {
    if (selectedDay === null) return null;
    return activeMonthHolidays[selectedDay] || null;
  }, [selectedDay, activeMonthHolidays]);

  // Locale-based full today date format
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat(userLocale, { dateStyle: 'full' }).format(today);
  }, [today, userLocale]);

  // Formatting date for dynamic banner
  const formattedSelectedDate = useMemo(() => {
    if (selectedDay === null) return '';
    const selDate = new Date(year, month, selectedDay);
    return new Intl.DateTimeFormat(userLocale, { dateStyle: 'medium' }).format(selDate);
  }, [selectedDay, year, month, userLocale]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full bg-gradient-to-br from-indigo-950/20 via-zinc-950/80 to-purple-950/20 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background glow effects */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Localization, Country & Timezone Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Globe className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>{userLocale}</span>
            <span className="text-zinc-650 opacity-60">|</span>
            <span className="flex items-center gap-1">
              <span className="text-sm leading-none">{detectedCountry.flag}</span>
              <span className="text-[10px] text-indigo-300">{detectedCountry.name} Holidays</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/15">
            <Clock className="h-3 w-3 text-indigo-400" />
            <span>{userTimezone.split('/').pop()?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Calendar Nav */}
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-black tracking-tight capitalize select-none">
            {monthName}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekday Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-zinc-500 text-xs font-black uppercase tracking-wider">
          {weekdays.map((day, idx) => (
            <div key={idx} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const isToday =
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;

            const isSelected = selectedDay === day;
            const holiday = activeMonthHolidays[day];

            return (
              <motion.button
                key={`day-${day}`}
                onHoverStart={() => setHoveredDay(day)}
                onHoverEnd={() => setHoveredDay(null)}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all duration-300 relative",
                  isToday
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/20"
                    : isSelected
                    ? (holiday 
                        ? "bg-rose-950/80 text-rose-200 border-rose-500/60 shadow-inner shadow-rose-500/20 animate-pulse" 
                        : "bg-indigo-950/80 text-indigo-200 border-indigo-500/40 shadow-inner")
                    : holiday
                    ? "bg-rose-950/30 text-rose-300 border-rose-500/30 hover:border-rose-450/50 shadow-sm shadow-rose-950/20"
                    : "bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 border-zinc-900 hover:border-zinc-700/50"
                )}
              >
                <span>{day}</span>
                
                {/* Holiday Indicator Dot (Rose/Red) */}
                {holiday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute bottom-1.5 shadow-md shadow-rose-500/50 animate-pulse" />
                )}

                {/* Glow ring on hover */}
                {hoveredDay === day && (
                  <motion.div
                    layoutId="glow-ring"
                    className="absolute inset-0 rounded-xl border border-indigo-400 pointer-events-none"
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic Holiday Info Banner */}
        <AnimatePresence mode="wait">
          {selectedHolidayInfo ? (
            <motion.div
              key={`holiday-${selectedDay}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-3 flex gap-2.5 items-start relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-500/5 blur-md pointer-events-none" />
              <div className="text-xl p-1.5 bg-rose-500/10 rounded-lg flex-shrink-0">🎈</div>
              <div>
                <p className="text-[10px] font-extrabold uppercase text-rose-300 tracking-wider mb-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-rose-400" />
                  Public Holiday on {formattedSelectedDate}
                </p>
                <p className="text-xs text-rose-100 font-bold leading-normal">
                  {selectedHolidayInfo.name}
                </p>
              </div>
            </motion.div>
          ) : selectedDay !== null ? (
            <motion.div
              key={`regular-${selectedDay}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-zinc-900/20 border border-white/5 rounded-2xl p-3 text-center text-zinc-550 text-[11px] font-semibold text-zinc-400"
            >
              Selected Date: {formattedSelectedDate} (No public holidays)
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Beautiful Footer indicating formatted local date */}
        <div className="pt-2 border-t border-white/5 flex flex-col gap-1 items-center">
          <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
            <Calendar className="h-3 w-3 text-indigo-400" />
            Today's Date
          </p>
          <p className="text-xs text-indigo-200 font-bold text-center capitalize leading-relaxed">
            {formattedToday}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
