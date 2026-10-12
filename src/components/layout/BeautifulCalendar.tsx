'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Globe, Clock, ChevronLeft, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  THAI_AND_INTERNATIONAL_HOLIDAYS,
  TIMEZONE_TO_COUNTRY,
  COUNTRY_INFO,
  type ApiHolidayRaw,
  type HolidayEntry
} from '@/lib/holidays';

export function BeautifulCalendar() {
  const [today, setToday] = useState(new Date());
  const [currentDayString, setCurrentDayString] = useState(new Date().toDateString());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // API holiday data: keyed by "YYYY-MM-DD"
  const [apiHolidays, setApiHolidays] = useState<Record<string, HolidayEntry[]>>({});
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  // Track which "YYYY_CC" combos have been fetched to avoid repeat requests
  const fetchedKeys = useRef<Set<string>>(new Set());

  // Detect user locale + timezone dynamically to support VPN & local timezone settings
  const [userLocale, setUserLocale] = useState('en-US');
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [countryCode, setCountryCode] = useState<string | null>(null);

  // Country display info
  const countryInfo = useMemo(() =>
    (countryCode && COUNTRY_INFO[countryCode]) || { name: 'International', flag: '🌐' },
    [countryCode]
  );

  // Initialize client-side environment & IP detection on mount
  useEffect(() => {
    // 1. Detect browser locale & timezone
    const browserLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    const browserTimezone = typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'Asia/Bangkok';
    const browserCountry = TIMEZONE_TO_COUNTRY[browserTimezone] ?? 'TH';

    setUserLocale(browserLocale);
    setUserTimezone(browserTimezone);
    setCountryCode(browserCountry);

    // 2. Perform IP-based geo-location to detect physical location (supports VPNs)
    const detectLocation = async () => {
      try {
        const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.countryCode && data.timeZone) {
            setCountryCode(prev => prev !== data.countryCode ? data.countryCode : prev);
            setUserTimezone(prev => prev !== data.timeZone ? data.timeZone : prev);
          }
        }
      } catch (err) {
        console.warn('IP geolocation failed, using browser timezone:', err);
      }
    };
    detectLocation();
  }, []);

  // ─── Fetch holidays from Nager.Date public API ────────────────────────────
  const fetchHolidays = useCallback(async (year: number) => {
    if (!countryCode) return;
    const key = `${year}_${countryCode}`;
    if (fetchedKeys.current.has(key)) return;
    fetchedKeys.current.add(key);

    // Check sessionStorage cache first
    const cacheKey = `ll_holidays_${key}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed: ApiHolidayRaw[] = JSON.parse(cached);
        const converted: Record<string, HolidayEntry[]> = {};
        parsed.forEach(h => {
          if (!converted[h.date]) converted[h.date] = [];
          converted[h.date].push({ name: h.name, localName: h.localName });
        });
        setApiHolidays(prev => ({ ...prev, ...converted }));
        setUsingFallback(false);
        return;
      }
    } catch {}

    setIsLoadingHolidays(true);
    try {
      const res = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiHolidayRaw[] = await res.json();

      // Cache result
      try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}

      const converted: Record<string, HolidayEntry[]> = {};
      data.forEach(h => {
        if (!converted[h.date]) converted[h.date] = [];
        converted[h.date].push({ name: h.name, localName: h.localName });
      });
      setApiHolidays(prev => ({ ...prev, ...converted }));
      setUsingFallback(false);
    } catch {
      // API unavailable — fall back to hardcoded data
      setUsingFallback(true);
    } finally {
      setIsLoadingHolidays(false);
    }
  }, [countryCode]);

  // Fetch on mount for current year + next year (pre-warm)
  useEffect(() => {
    const year = new Date().getFullYear();
    fetchHolidays(year);
    fetchHolidays(year + 1);
  }, [fetchHolidays]);

  // Fetch when navigating to a new year
  useEffect(() => {
    fetchHolidays(viewDate.getFullYear());
  }, [viewDate, fetchHolidays]);

  // Midnight tracker — update "today" when the date changes
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.toDateString() !== currentDayString) {
        setToday(now);
        setViewDate(now);
        setSelectedDay(now.getDate());
        setCurrentDayString(now.toDateString());
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [currentDayString]);

  // ─── Calendar grid computations ──────────────────────────────────────────
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = useMemo(() =>
    new Intl.DateTimeFormat(userLocale, { month: 'long', year: 'numeric' }).format(viewDate),
    [viewDate, userLocale]
  );

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(userLocale, { weekday: 'short' });
    // Jan 4, 2026 is a Sunday — use as anchor for 7-day row
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 0, 4 + i)));
  }, [userLocale]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDayIndex, daysInMonth]);

  // ─── Merge API + fallback holidays for current view month ────────────────
  const activeMonthHolidays = useMemo(() => {
    const list: Record<number, HolidayEntry> = {};

    // Priority 1: live API data
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (apiHolidays[dateStr]?.length) {
        list[day] = apiHolidays[dateStr][0];
      }
    }

    // Priority 2: hardcoded fallback (used when API failed or no country detected)
    if (usingFallback || !countryCode) {
      const isThai = countryCode === 'TH' || userTimezone.includes('Bangkok');
      THAI_AND_INTERNATIONAL_HOLIDAYS.forEach(h => {
        const [hYear, hMonth, hDay] = h.date.split('-').map(Number);
        if ((hMonth - 1) === month && hYear === year) {
          const isThaiOnly = h.type === 'thai_public';
          if (isThai || !isThaiOnly) {
            if (!list[hDay]) list[hDay] = { name: h.name };
          }
        }
      });
    }

    return list;
  }, [year, month, daysInMonth, apiHolidays, usingFallback, countryCode, userTimezone]);

  const selectedHolidayInfo = useMemo(() =>
    selectedDay !== null ? activeMonthHolidays[selectedDay] ?? null : null,
    [selectedDay, activeMonthHolidays]
  );

  const formattedToday = useMemo(() =>
    new Intl.DateTimeFormat(userLocale, { dateStyle: 'full' }).format(today),
    [today, userLocale]
  );

  const formattedSelectedDate = useMemo(() => {
    if (selectedDay === null) return '';
    return new Intl.DateTimeFormat(userLocale, { dateStyle: 'medium' }).format(
      new Date(year, month, selectedDay)
    );
  }, [selectedDay, year, month, userLocale]);

  // ─── Render ───────────────────────────────────────────────────────────────
  const isViewingCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full bg-zinc-950/80 backdrop-blur-2xl border border-indigo-500/30 hover:border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-300 group"
    >
      {/* ── Ambient Neon Cyber Orbs ── */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Sleek Top Edge Highlight ── */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

      <div className="relative z-10 space-y-3.5">

        {/* ── Top Bar: Location / Locale / Timezone badges ── */}
        <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-zinc-300 text-[11px] font-semibold tracking-wide shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="uppercase text-[10px] text-zinc-400">{userLocale}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs">{countryInfo.flag}</span>
              <span className="text-[11px] font-bold text-indigo-300">{countryInfo.name}</span>
              {isLoadingHolidays && (
                <Loader2 className="h-3 w-3 animate-spin text-indigo-400 ml-0.5" />
              )}
              {usingFallback && !isLoadingHolidays && (
                <span className="text-[9px] text-zinc-500 italic font-normal ml-0.5">offline</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-bold tracking-wider uppercase font-mono shadow-sm">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>{userTimezone.split('/').pop()?.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* ── Month Title & Navigation Bar ── */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent capitalize select-none drop-shadow-sm">
              {monthName}
            </h3>
            {!isViewingCurrentMonth && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedDay(today.getDate());
                }}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-colors shadow-sm"
              >
                Reset
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
              className="h-7 w-7 flex items-center justify-center text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-indigo-500/25 hover:border-indigo-400/40 border border-white/5 rounded-lg transition-all duration-200 active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
              className="h-7 w-7 flex items-center justify-center text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-indigo-500/25 hover:border-indigo-400/40 border border-white/5 rounded-lg transition-all duration-200 active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Sleek Weekday Bar ── */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          {weekdays.map((d, i) => {
            const isWeekend = i === 0 || i === 6;
            return (
              <div
                key={i}
                className={cn(
                  "py-1 text-center text-[10px] sm:text-[11px] font-black uppercase tracking-wider",
                  isWeekend ? "text-indigo-400/90" : "text-zinc-400"
                )}
              >
                {d}
              </div>
            );
          })}
        </div>

        {/* ── Calendar Grid (Sleek Modern Glass Cells) ── */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-8 sm:h-9 w-full rounded-xl bg-white/[0.01] border border-white/[0.02]"
                />
              );
            }

            const isToday =
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;
            const isSelected = selectedDay === day;
            const holiday = activeMonthHolidays[day];
            const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);

            return (
              <motion.button
                key={`day-${day}`}
                onHoverStart={() => setHoveredDay(day)}
                onHoverEnd={() => setHoveredDay(null)}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  'h-8 sm:h-9 w-full rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-200 relative group/cell overflow-hidden cursor-pointer select-none',
                  // Today cell (Hero cyberpunk luminous style)
                  isToday
                    ? 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white font-black shadow-[0_0_20px_rgba(99,102,241,0.55)] border-2 border-indigo-300 ring-2 ring-indigo-400/40'
                    // Selected cell (Luminous frosted ring)
                    : isSelected
                    ? holiday
                      ? 'bg-rose-950/70 text-rose-100 border-2 border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.4)]'
                      : 'bg-indigo-600/30 text-white border-2 border-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.4)]'
                    // Public Holiday cell (Warm ruby glass)
                    : holiday
                    ? 'bg-gradient-to-b from-rose-500/15 to-rose-950/30 text-rose-200 border border-rose-500/35 hover:border-rose-400/70 hover:bg-rose-500/25 shadow-sm'
                    // Regular Day cell (Frosted glass squircle)
                    : 'bg-gradient-to-b from-white/[0.05] to-white/[0.015] hover:from-white/[0.12] hover:to-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.07] hover:border-indigo-400/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                )}
              >
                {/* Micro top shine for glossy glass look */}
                {!isToday && (
                  <div className="absolute top-0 inset-x-2 h-[1px] bg-white/[0.12] pointer-events-none" />
                )}

                <span className={cn(
                  "relative z-10 tracking-tight",
                  isToday ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" : isWeekend && !holiday && !isSelected ? "text-zinc-200" : ""
                )}>
                  {day}
                </span>

                {/* Holiday Indicator Dot with Neon Ruby Flare */}
                {holiday && (
                  <span className="absolute bottom-1 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                  </span>
                )}

                {/* Today tiny cyber indicator */}
                {isToday && !holiday && (
                  <span className="w-1 h-1 rounded-full bg-cyan-200 absolute bottom-1 shadow-[0_0_6px_#a5f3fc]" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* ── Holiday Info Card (Modern Frosted Glass Banner) ── */}
        <AnimatePresence mode="wait">
          {selectedHolidayInfo ? (
            <motion.div
              key={`hol-${selectedDay}`}
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-r from-rose-950/50 via-purple-950/30 to-zinc-950/50 border border-rose-500/35 rounded-xl p-2.5 px-3 flex items-center justify-between gap-3 relative overflow-hidden shadow-[0_4px_20px_rgba(244,63,94,0.15)]"
            >
              {/* Left neon indicator bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-pink-500 shadow-[0_0_8px_#f43f5e]" />

              <div className="flex items-center gap-2.5 min-w-0 pl-1.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                  🎉
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-rose-300 tracking-wider flex items-center gap-1.5 truncate">
                    <MapPin className="h-2.5 w-2.5 text-rose-400 shrink-0" />
                    <span>Public Holiday</span>
                    <span className="text-rose-400/60">·</span>
                    <span className="text-zinc-300">{formattedSelectedDate}</span>
                  </p>
                  <p className="text-xs text-white font-bold truncate mt-0.5">
                    {selectedHolidayInfo.name}
                    {selectedHolidayInfo.localName && selectedHolidayInfo.localName !== selectedHolidayInfo.name && (
                      <span className="text-[10px] text-rose-300/80 ml-1.5 font-medium italic">
                        ({selectedHolidayInfo.localName})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-rose-400/90 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  Observed
                </span>
              </div>
            </motion.div>
          ) : selectedDay !== null ? (
            <motion.div
              key={`reg-${selectedDay}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl py-1.5 px-3 text-center text-[10px] font-medium text-zinc-400 flex items-center justify-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
              <span>{formattedSelectedDate} — Regular Business Day (No Public Holidays)</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Modern Bottom Status Bar ── */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedDay(today.getDate());
            }}
            className="text-[11px] text-zinc-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors group/today"
          >
            <div className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 group-hover/today:bg-indigo-500/20 transition-colors">
              <Calendar className="h-3 w-3 text-indigo-400" />
            </div>
            <span>Today</span>
          </button>
          
          <div className="text-xs font-bold text-zinc-200 capitalize flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">Current:</span>
            <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-indigo-200">
              {formattedToday}
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
