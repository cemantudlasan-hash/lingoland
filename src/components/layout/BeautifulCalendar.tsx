'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Loader2, 
  Sparkles,
  PartyPopper,
  BookmarkCheck,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSeasonalTheme } from '@/context/seasonal-theme-context';
import {
  THAI_AND_INTERNATIONAL_HOLIDAYS,
  TIMEZONE_TO_COUNTRY,
  COUNTRY_INFO,
  type ApiHolidayRaw,
  type HolidayEntry
} from '@/lib/holidays';

export function BeautifulCalendar() {
  const { activeTheme, isThemeActiveForUser, settings: seasonalSettings } = useSeasonalTheme();
  const isSeasonalActive = isThemeActiveForUser && (seasonalSettings?.includeLoginPage ?? true) && activeTheme.id !== 'default';

  const [today, setToday] = useState(new Date());
  const [currentDayString, setCurrentDayString] = useState(new Date().toDateString());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Live Digital Clock state (ticks every second)
  const [liveClock, setLiveClock] = useState<string>('');

  // API holiday data: keyed by "YYYY-MM-DD"
  const [apiHolidays, setApiHolidays] = useState<Record<string, HolidayEntry[]>>({});
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const fetchedKeys = useRef<Set<string>>(new Set());

  // Locale & Timezone detection
  const [userLocale, setUserLocale] = useState('en-US');
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [countryCode, setCountryCode] = useState<string | null>(null);

  const countryInfo = useMemo(() =>
    (countryCode && COUNTRY_INFO[countryCode]) || { name: 'International', flag: '🌐' },
    [countryCode]
  );

  // Initialize client environment & live clock
  useEffect(() => {
    const browserLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    const browserTimezone = typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'Asia/Bangkok';
    const browserCountry = TIMEZONE_TO_COUNTRY[browserTimezone] ?? 'TH';

    setUserLocale(browserLocale);
    setUserTimezone(browserTimezone);
    setCountryCode(browserCountry);

    // Live clock ticker
    const updateClock = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat(browserLocale, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: browserTimezone
        }).format(now);
        setLiveClock(formatted);
      } catch {
        const now = new Date();
        setLiveClock(now.toLocaleTimeString());
      }
    };

    updateClock();
    const clockTimer = setInterval(updateClock, 1000);

    // Background IP Geo-location
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

    return () => clearInterval(clockTimer);
  }, []);

  // ─── Fetch holidays from Nager.Date public API ────────────────────────────
  const fetchHolidays = useCallback(async (year: number) => {
    if (!countryCode) return;
    const key = `${year}_${countryCode}`;
    if (fetchedKeys.current.has(key)) return;
    fetchedKeys.current.add(key);

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

      try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}

      const converted: Record<string, HolidayEntry[]> = {};
      data.forEach(h => {
        if (!converted[h.date]) converted[h.date] = [];
        converted[h.date].push({ name: h.name, localName: h.localName });
      });
      setApiHolidays(prev => ({ ...prev, ...converted }));
      setUsingFallback(false);
    } catch {
      setUsingFallback(true);
    } finally {
      setIsLoadingHolidays(false);
    }
  }, [countryCode]);

  useEffect(() => {
    const year = new Date().getFullYear();
    fetchHolidays(year);
    fetchHolidays(year + 1);
  }, [fetchHolidays]);

  useEffect(() => {
    fetchHolidays(viewDate.getFullYear());
  }, [viewDate, fetchHolidays]);

  // Midnight tracker
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

  // Merge API + fallback holidays
  const activeMonthHolidays = useMemo(() => {
    const list: Record<number, HolidayEntry> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (apiHolidays[dateStr]?.length) {
        list[day] = apiHolidays[dateStr][0];
      }
    }

    if (usingFallback || !countryCode || Object.keys(list).length === 0) {
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

  // Compute upcoming holiday in this month for top pill
  const upcomingHolidayInMonth = useMemo(() => {
    const currentDay = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear()
      ? today.getDate()
      : 1;

    for (let d = currentDay; d <= daysInMonth; d++) {
      if (activeMonthHolidays[d]) {
        return { day: d, holiday: activeMonthHolidays[d] };
      }
    }
    // Check earlier in month if none upcoming
    for (let d = 1; d <= daysInMonth; d++) {
      if (activeMonthHolidays[d]) {
        return { day: d, holiday: activeMonthHolidays[d] };
      }
    }
    return null;
  }, [activeMonthHolidays, daysInMonth, viewDate, today]);

  // Holiday Emoji resolver
  const getHolidayEmoji = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('halloween')) return '🎃';
    if (lower.includes('christmas')) return '🎄';
    if (lower.includes('songkran')) return '💦';
    if (lower.includes('new year')) return '🎆';
    if (lower.includes('valentine')) return '💖';
    if (lower.includes('chulalongkorn') || lower.includes('chakri') || lower.includes('coronation')) return '👑';
    if (lower.includes('buddha') || lower.includes('bucha') || lower.includes('lent')) return '🪷';
    if (lower.includes('mother') || lower.includes('queen')) return '👸';
    if (lower.includes('father') || lower.includes('king')) return '🤴';
    if (lower.includes('labour')) return '🛠️';
    if (lower.includes('constitution')) return '📜';
    if (lower.includes('thanksgiving')) return '🦃';
    if (lower.includes('easter')) return '🥚';
    return '🎉';
  };

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

  const isViewingCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        "w-full h-full flex flex-col justify-between backdrop-blur-md md:backdrop-blur-2xl rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all duration-700 select-none group border",
        isSeasonalActive
          ? `bg-slate-950/95 border-2 ${activeTheme.borderColor}`
          : "border border-indigo-500/35 hover:border-indigo-400/50 bg-slate-950/90 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
      )}
      style={{
        boxShadow: isSeasonalActive
          ? `0 0 50px ${activeTheme.glowColor}, inset 0 0 25px ${activeTheme.glowColor}`
          : undefined,
      }}
    >
      {/* ── Ambient Neon Cyber Orbs (Themed to Season) ── */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          backgroundColor: isSeasonalActive ? activeTheme.accentColor : '#6366f1',
          opacity: isSeasonalActive ? 0.22 : 0.15 
        }} 
      />
      <div 
        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          backgroundColor: isSeasonalActive ? activeTheme.accentColor : '#06b6d4',
          opacity: isSeasonalActive ? 0.22 : 0.15 
        }} 
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          backgroundColor: isSeasonalActive ? activeTheme.accentColor : '#a855f7',
          opacity: isSeasonalActive ? 0.14 : 0.10 
        }} 
      />

      {/* ── Sleek Top Edge Highlight ── */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-4">

        {/* ── Top Bar: Location, Status, and Live Digital Clock ── */}
        <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
          {/* Location & Status Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-slate-300 text-xs font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="uppercase text-[10px] text-slate-400 font-mono">{userLocale}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-sm">{countryInfo.flag}</span>
              <span className="text-xs font-bold text-indigo-300">{countryInfo.name}</span>
              {isLoadingHolidays && (
                <Loader2 className="h-3 w-3 animate-spin text-indigo-400 ml-0.5" />
              )}
            </div>
          </div>

          {/* Seasonal Theme Badge in Top Bar */}
          {isSeasonalActive && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-sm backdrop-blur-md transition-all animate-pulse",
              activeTheme.badgeBg,
              activeTheme.borderColor,
              activeTheme.badgeText
            )}>
              <span className="text-sm">{activeTheme.emoji}</span>
              <span className="hidden sm:inline font-bold">{activeTheme.name}</span>
            </div>
          )}

          {/* Right: Live Digital Clock & Timezone */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="tracking-wider">{liveClock || '12:00:00 PM'}</span>
              <span className="text-zinc-500 text-[10px] hidden sm:inline">|</span>
              <span className="text-[10px] text-indigo-300 font-mono hidden sm:inline">
                {userTimezone.split('/').pop()?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Month Title & Navigation Bar ── */}
        <div className="flex items-center justify-between pt-0.5 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent capitalize drop-shadow-sm">
              {monthName}
            </h3>

            {!isViewingCurrentMonth && (
              <button
                type="button"
                onClick={() => {
                  setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedDay(today.getDate());
                }}
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-colors shadow-sm cursor-pointer"
              >
                Reset Today
              </button>
            )}

            {/* Quick Holiday Banner in Month Bar */}
            {upcomingHolidayInMonth && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-semibold">
                <span className="text-sm">{getHolidayEmoji(upcomingHolidayInMonth.holiday.name)}</span>
                <span className="text-[10px] uppercase font-bold text-rose-400">Day {upcomingHolidayInMonth.day}:</span>
                <span className="truncate max-w-[150px]">{upcomingHolidayInMonth.holiday.name}</span>
              </div>
            )}

            {/* Seasonal Celebration Tag in Month Bar */}
            {isSeasonalActive && (
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold shadow-sm transition-all",
                activeTheme.badgeBg,
                activeTheme.borderColor,
                activeTheme.badgeText
              )}>
                <span className="text-sm">{activeTheme.emoji}</span>
                <span className="truncate max-w-[200px]">{seasonalSettings?.customBadgeText || activeTheme.defaultBadgeText}</span>
              </div>
            )}
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
              className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-white bg-white/[0.04] hover:bg-indigo-500/30 hover:border-indigo-400/40 border border-white/5 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
              className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-white bg-white/[0.04] hover:bg-indigo-500/30 hover:border-indigo-400/40 border border-white/5 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Sleek Weekday Bar ── */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          {weekdays.map((d, i) => {
            const isWeekend = i === 0 || i === 6;
            return (
              <div
                key={i}
                className={cn(
                  "py-1 text-center text-[10px] sm:text-xs font-black uppercase tracking-wider",
                  isWeekend ? "text-indigo-400/90 font-extrabold" : "text-slate-400"
                )}
              >
                {d}
              </div>
            );
          })}
        </div>

        {/* ── Calendar Grid (Sleek Modern Glass Cells) ── */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-10 sm:h-12 w-full rounded-2xl bg-white/[0.01] border border-white/[0.02]"
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
            const holidayEmoji = holiday ? getHolidayEmoji(holiday.name) : null;

            const isSeasonalDay = isSeasonalActive && (
              (activeTheme.id === 'halloween' && month === 9 && day === 31) ||
              (activeTheme.id === 'christmas' && month === 11 && day === 25) ||
              (activeTheme.id === 'valentine' && month === 1 && day === 14) ||
              (activeTheme.id === 'songkran' && month === 3 && (day >= 13 && day <= 15)) ||
              (activeTheme.id === 'new_year' && month === 0 && day === 1) ||
              (activeTheme.id === 'lunar_new_year' && month === 0 && (day >= 28 && day <= 31))
            );

            return (
              <motion.button
                key={`day-${day}`}
                onHoverStart={() => setHoveredDay(day)}
                onHoverEnd={() => setHoveredDay(null)}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  'h-10 sm:h-12 w-full rounded-2xl flex flex-col items-center justify-between p-1 sm:p-1.5 text-xs font-bold transition-all duration-200 relative group/cell overflow-hidden cursor-pointer select-none',
                  // Today cell (Hero cyberpunk luminous style)
                  isToday
                    ? isSeasonalActive
                      ? `bg-gradient-to-tr from-purple-800 via-indigo-600 to-amber-500 text-white font-black border-2 ${activeTheme.borderColor} shadow-lg ring-2 ring-amber-400/50`
                      : 'bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white font-black shadow-[0_0_25px_rgba(99,102,241,0.65)] border-2 border-indigo-200 ring-2 ring-indigo-400/50'
                    // Themed holiday day
                    : isSeasonalDay
                    ? `bg-gradient-to-b from-amber-500/25 via-orange-950/60 to-slate-950/80 text-white border-2 ${activeTheme.borderColor} shadow-md animate-pulse`
                    // Selected cell (Luminous frosted ring)
                    : isSelected
                    ? holiday
                      ? 'bg-rose-950/80 text-rose-100 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                      : isSeasonalActive
                      ? `bg-slate-900/90 text-white border-2 ${activeTheme.borderColor} shadow-md`
                      : 'bg-indigo-600/35 text-white border-2 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                    // Public Holiday cell (Warm ruby glass with subtle badge)
                    : holiday
                    ? 'bg-gradient-to-b from-rose-500/20 via-rose-950/40 to-slate-950/70 text-rose-200 border border-rose-500/40 hover:border-rose-400/80 hover:bg-rose-500/30 shadow-sm'
                    // Regular Day cell (Frosted glass squircle)
                    : isWeekend
                    ? isSeasonalActive
                      ? `bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.05] text-slate-200 hover:text-white border border-white/[0.08] hover:${activeTheme.borderColor} shadow-inner`
                      : 'bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.05] text-indigo-200/90 hover:text-white border border-white/[0.08] hover:border-indigo-400/40 shadow-inner'
                    : isSeasonalActive
                    ? `bg-gradient-to-b from-white/[0.04] to-white/[0.015] hover:from-white/[0.1] hover:to-white/[0.04] text-slate-300 hover:text-white border border-white/[0.07] hover:${activeTheme.borderColor} shadow-inner`
                    : 'bg-gradient-to-b from-white/[0.04] to-white/[0.015] hover:from-white/[0.1] hover:to-white/[0.04] text-slate-300 hover:text-white border border-white/[0.07] hover:border-indigo-400/40 shadow-inner'
                )}
              >
                {/* Micro top shine for glossy glass look */}
                {!isToday && (
                  <div className="absolute top-0 inset-x-2 h-[1px] bg-white/[0.15] pointer-events-none" />
                )}

                {/* Day Number */}
                <div className="w-full flex items-center justify-between px-1">
                  <span className={cn(
                    "text-xs sm:text-sm font-mono tracking-tight",
                    isToday ? "font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" : "font-extrabold"
                  )}>
                    {day}
                  </span>

                  {/* Micro Holiday or Seasonal Theme Emoji Badge right in the cell */}
                  {(holiday || isSeasonalDay) && (
                    <span className="text-[11px] sm:text-xs leading-none drop-shadow-sm select-none">
                      {isSeasonalDay ? activeTheme.emoji : holidayEmoji}
                    </span>
                  )}
                </div>

                {/* Bottom Indicator Dot or Accent Pill */}
                <div className="w-full flex items-center justify-center pb-0.5">
                  {isSeasonalDay ? (
                    <span className="h-1 w-3 sm:w-4 rounded-full shadow-sm" style={{ backgroundColor: activeTheme.accentColor }} />
                  ) : holiday ? (
                    <span className="h-1 w-3 sm:w-4 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                  ) : isSelected ? (
                    <span className="h-1 w-2 rounded-full" style={{ backgroundColor: isSeasonalActive ? activeTheme.accentColor : '#6366f1' }} />
                  ) : isToday ? (
                    <span className="h-1 w-3 sm:w-4 rounded-full bg-cyan-200 shadow-[0_0_8px_#a5f3fc]" />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-white/10 group-hover/cell:bg-indigo-400/50 transition-colors" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── Selected Day Interactive Deck (Never Dry!) ── */}
        <AnimatePresence mode="wait">
          {selectedHolidayInfo ? (
            <motion.div
              key={`hol-${selectedDay}`}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-gradient-to-r from-rose-950/60 via-purple-950/40 to-slate-950/60 border border-rose-500/40 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 relative overflow-hidden shadow-[0_4px_25px_rgba(244,63,94,0.2)]"
            >
              {/* Left neon indicator bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-rose-400 to-pink-500 shadow-[0_0_12px_#f43f5e]" />

              <div className="flex items-center gap-3 min-w-0 pl-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/25 border border-rose-500/40 flex items-center justify-center text-lg shadow-sm shrink-0">
                  {getHolidayEmoji(selectedHolidayInfo.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-rose-300 tracking-wider flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 text-rose-400 shrink-0" />
                    <span>Public Holiday</span>
                    <span className="text-rose-400/60">·</span>
                    <span className="text-slate-200 font-bold">{formattedSelectedDate}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-white font-black truncate mt-0.5">
                    {selectedHolidayInfo.name}
                    {selectedHolidayInfo.localName && selectedHolidayInfo.localName !== selectedHolidayInfo.name && (
                      <span className="text-[11px] text-rose-200/80 ml-2 font-medium italic">
                        ({selectedHolidayInfo.localName})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 hidden sm:block">
                <span className="text-[10px] uppercase font-black tracking-wider text-rose-300 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 shadow-sm">
                  Official Observance
                </span>
              </div>
            </motion.div>
          ) : selectedDay !== null ? (
            <motion.div
              key={`reg-${selectedDay}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs text-slate-300 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-white">{formattedSelectedDate}</span>
                  <span className="text-slate-400 text-[11px] ml-2 hidden sm:inline">
                    · Regular Academic Focus Day (No Public Holiday)
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
                  Active Study Streak
                </span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Modern Bottom Status Bar ── */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedDay(today.getDate());
            }}
            className="text-xs text-slate-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-2 transition-colors group/today cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover/today:bg-indigo-500/25 transition-colors">
              <CalendarIcon className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span>Today</span>
          </button>
          
          <div className="text-xs font-bold text-slate-200 capitalize flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">Current Date:</span>
            <span className="px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-indigo-200 shadow-sm">
              {formattedToday}
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
