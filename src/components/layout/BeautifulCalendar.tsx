'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Globe, Clock, ChevronLeft, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { THAI_AND_INTERNATIONAL_HOLIDAYS } from '@/lib/holidays';

// ─── Comprehensive Timezone → ISO 3166-1 alpha-2 Country Code ─────────────────
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Southeast Asia
  'Asia/Bangkok': 'TH', 'Asia/Phnom_Penh': 'KH', 'Asia/Vientiane': 'LA',
  'Asia/Yangon': 'MM', 'Asia/Rangoon': 'MM',
  'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID',
  'Asia/Manila': 'PH', 'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY',
  'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN',
  // East Asia
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN', 'Asia/Urumqi': 'CN', 'Asia/Chongqing': 'CN',
  'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW', 'Asia/Macau': 'MO',
  'Asia/Ulaanbaatar': 'MN',
  // South Asia
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD',
  'Asia/Colombo': 'LK', 'Asia/Kathmandu': 'NP', 'Asia/Thimphu': 'BT',
  // Central / West Asia
  'Asia/Almaty': 'KZ', 'Asia/Tashkent': 'UZ', 'Asia/Kabul': 'AF',
  'Asia/Tehran': 'IR', 'Asia/Dubai': 'AE', 'Asia/Muscat': 'OM',
  'Asia/Riyadh': 'SA', 'Asia/Kuwait': 'KW', 'Asia/Baghdad': 'IQ',
  'Asia/Beirut': 'LB', 'Asia/Damascus': 'SY', 'Asia/Amman': 'JO',
  'Asia/Jerusalem': 'IL', 'Asia/Nicosia': 'CY',
  // Europe
  'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT', 'Europe/Madrid': 'ES', 'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE', 'Europe/Zurich': 'CH', 'Europe/Vienna': 'AT',
  'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG', 'Europe/Athens': 'GR',
  'Europe/Helsinki': 'FI', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK', 'Europe/Dublin': 'IE', 'Europe/Lisbon': 'PT',
  'Europe/Moscow': 'RU', 'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA',
  'Europe/Minsk': 'BY', 'Europe/Riga': 'LV', 'Europe/Tallinn': 'EE',
  'Europe/Vilnius': 'LT', 'Europe/Bratislava': 'SK', 'Europe/Ljubljana': 'SI',
  'Europe/Zagreb': 'HR', 'Europe/Belgrade': 'RS', 'Europe/Skopje': 'MK',
  'Europe/Sarajevo': 'BA', 'Europe/Podgorica': 'ME', 'Europe/Tirane': 'AL',
  'Europe/Reykjavik': 'IS', 'Europe/Luxembourg': 'LU', 'Europe/Valletta': 'MT',
  // Americas
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'America/Honolulu': 'US', 'America/Detroit': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Montreal': 'CA',
  'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA',
  'America/Mexico_City': 'MX', 'America/Bogota': 'CO', 'America/Lima': 'PE',
  'America/Santiago': 'CL', 'America/Argentina/Buenos_Aires': 'AR',
  'America/Sao_Paulo': 'BR', 'America/Manaus': 'BR', 'America/Fortaleza': 'BR',
  'America/Caracas': 'VE', 'America/Guayaquil': 'EC', 'America/La_Paz': 'BO',
  'America/Asuncion': 'PY', 'America/Montevideo': 'UY', 'America/Havana': 'CU',
  'America/Panama': 'PA', 'America/Costa_Rica': 'CR', 'America/Guatemala': 'GT',
  'America/Belize': 'BZ', 'America/Tegucigalpa': 'HN', 'America/Managua': 'NI',
  'America/El_Salvador': 'SV', 'America/Santo_Domingo': 'DO', 'America/Jamaica': 'JM',
  'America/Port-au-Prince': 'HT', 'America/Nassau': 'BS', 'America/Barbados': 'BB',
  'America/Trinidad': 'TT',
  // Africa
  'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA', 'Africa/Accra': 'GH', 'Africa/Casablanca': 'MA',
  'Africa/Tunis': 'TN', 'Africa/Algiers': 'DZ', 'Africa/Addis_Ababa': 'ET',
  'Africa/Dar_es_Salaam': 'TZ', 'Africa/Kampala': 'UG', 'Africa/Khartoum': 'SD',
  'Africa/Abidjan': 'CI', 'Africa/Dakar': 'SN', 'Africa/Kinshasa': 'CD',
  'Africa/Lusaka': 'ZM', 'Africa/Harare': 'ZW', 'Africa/Maputo': 'MZ',
  'Africa/Tripoli': 'LY', 'Africa/Kigali': 'RW', 'Africa/Libreville': 'GA',
  // Pacific / Oceania
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Australia/Darwin': 'AU',
  'Australia/Hobart': 'AU',
  'Pacific/Auckland': 'NZ', 'Pacific/Fiji': 'FJ', 'Pacific/Port_Moresby': 'PG',
  'Pacific/Guam': 'GU', 'Pacific/Apia': 'WS', 'Pacific/Tongatapu': 'TO',
};

// ─── Country Display Info (flag + name) ───────────────────────────────────────
const COUNTRY_INFO: Record<string, { name: string; flag: string }> = {
  TH: { name: 'Thailand', flag: '🇹🇭' }, PH: { name: 'Philippines', flag: '🇵🇭' },
  ID: { name: 'Indonesia', flag: '🇮🇩' }, SG: { name: 'Singapore', flag: '🇸🇬' },
  MY: { name: 'Malaysia', flag: '🇲🇾' }, VN: { name: 'Vietnam', flag: '🇻🇳' },
  KH: { name: 'Cambodia', flag: '🇰🇭' }, LA: { name: 'Laos', flag: '🇱🇦' },
  MM: { name: 'Myanmar', flag: '🇲🇲' }, BN: { name: 'Brunei', flag: '🇧🇳' },
  JP: { name: 'Japan', flag: '🇯🇵' }, KR: { name: 'South Korea', flag: '🇰🇷' },
  CN: { name: 'China', flag: '🇨🇳' }, HK: { name: 'Hong Kong', flag: '🇭🇰' },
  TW: { name: 'Taiwan', flag: '🇹🇼' }, MN: { name: 'Mongolia', flag: '🇲🇳' },
  MO: { name: 'Macau', flag: '🇲🇴' },
  IN: { name: 'India', flag: '🇮🇳' }, PK: { name: 'Pakistan', flag: '🇵🇰' },
  BD: { name: 'Bangladesh', flag: '🇧🇩' }, LK: { name: 'Sri Lanka', flag: '🇱🇰' },
  NP: { name: 'Nepal', flag: '🇳🇵' }, BT: { name: 'Bhutan', flag: '🇧🇹' },
  AU: { name: 'Australia', flag: '🇦🇺' }, NZ: { name: 'New Zealand', flag: '🇳🇿' },
  PG: { name: 'Papua New Guinea', flag: '🇵🇬' }, FJ: { name: 'Fiji', flag: '🇫🇯' },
  US: { name: 'United States', flag: '🇺🇸' }, CA: { name: 'Canada', flag: '🇨🇦' },
  MX: { name: 'Mexico', flag: '🇲🇽' }, BR: { name: 'Brazil', flag: '🇧🇷' },
  AR: { name: 'Argentina', flag: '🇦🇷' }, CL: { name: 'Chile', flag: '🇨🇱' },
  CO: { name: 'Colombia', flag: '🇨🇴' }, PE: { name: 'Peru', flag: '🇵🇪' },
  VE: { name: 'Venezuela', flag: '🇻🇪' }, EC: { name: 'Ecuador', flag: '🇪🇨' },
  BO: { name: 'Bolivia', flag: '🇧🇴' }, PY: { name: 'Paraguay', flag: '🇵🇾' },
  UY: { name: 'Uruguay', flag: '🇺🇾' }, CU: { name: 'Cuba', flag: '🇨🇺' },
  GT: { name: 'Guatemala', flag: '🇬🇹' }, HN: { name: 'Honduras', flag: '🇭🇳' },
  SV: { name: 'El Salvador', flag: '🇸🇻' }, NI: { name: 'Nicaragua', flag: '🇳🇮' },
  CR: { name: 'Costa Rica', flag: '🇨🇷' }, PA: { name: 'Panama', flag: '🇵🇦' },
  DO: { name: 'Dominican Rep.', flag: '🇩🇴' }, JM: { name: 'Jamaica', flag: '🇯🇲' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' }, FR: { name: 'France', flag: '🇫🇷' },
  DE: { name: 'Germany', flag: '🇩🇪' }, IT: { name: 'Italy', flag: '🇮🇹' },
  ES: { name: 'Spain', flag: '🇪🇸' }, NL: { name: 'Netherlands', flag: '🇳🇱' },
  BE: { name: 'Belgium', flag: '🇧🇪' }, CH: { name: 'Switzerland', flag: '🇨🇭' },
  AT: { name: 'Austria', flag: '🇦🇹' }, PL: { name: 'Poland', flag: '🇵🇱' },
  PT: { name: 'Portugal', flag: '🇵🇹' }, SE: { name: 'Sweden', flag: '🇸🇪' },
  NO: { name: 'Norway', flag: '🇳🇴' }, DK: { name: 'Denmark', flag: '🇩🇰' },
  FI: { name: 'Finland', flag: '🇫🇮' }, IE: { name: 'Ireland', flag: '🇮🇪' },
  RU: { name: 'Russia', flag: '🇷🇺' }, UA: { name: 'Ukraine', flag: '🇺🇦' },
  GR: { name: 'Greece', flag: '🇬🇷' }, CZ: { name: 'Czechia', flag: '🇨🇿' },
  HU: { name: 'Hungary', flag: '🇭🇺' }, RO: { name: 'Romania', flag: '🇷🇴' },
  BG: { name: 'Bulgaria', flag: '🇧🇬' }, HR: { name: 'Croatia', flag: '🇭🇷' },
  RS: { name: 'Serbia', flag: '🇷🇸' }, SK: { name: 'Slovakia', flag: '🇸🇰' },
  SI: { name: 'Slovenia', flag: '🇸🇮' }, BY: { name: 'Belarus', flag: '🇧🇾' },
  EE: { name: 'Estonia', flag: '🇪🇪' }, LV: { name: 'Latvia', flag: '🇱🇻' },
  LT: { name: 'Lithuania', flag: '🇱🇹' }, IS: { name: 'Iceland', flag: '🇮🇸' },
  LU: { name: 'Luxembourg', flag: '🇱🇺' }, MT: { name: 'Malta', flag: '🇲🇹' },
  ZA: { name: 'South Africa', flag: '🇿🇦' }, NG: { name: 'Nigeria', flag: '🇳🇬' },
  EG: { name: 'Egypt', flag: '🇪🇬' }, KE: { name: 'Kenya', flag: '🇰🇪' },
  ET: { name: 'Ethiopia', flag: '🇪🇹' }, TZ: { name: 'Tanzania', flag: '🇹🇿' },
  GH: { name: 'Ghana', flag: '🇬🇭' }, MA: { name: 'Morocco', flag: '🇲🇦' },
  DZ: { name: 'Algeria', flag: '🇩🇿' }, TN: { name: 'Tunisia', flag: '🇹🇳' },
  AE: { name: 'UAE', flag: '🇦🇪' }, SA: { name: 'Saudi Arabia', flag: '🇸🇦' },
  IL: { name: 'Israel', flag: '🇮🇱' }, IQ: { name: 'Iraq', flag: '🇮🇶' },
  IR: { name: 'Iran', flag: '🇮🇷' }, JO: { name: 'Jordan', flag: '🇯🇴' },
};

type ApiHolidayRaw = { date: string; name: string; localName: string; types: string[] };
type HolidayEntry = { name: string; localName?: string };

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
        // Match by exact year for 2024-2026; allow any year beyond for future-proofing
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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full bg-gradient-to-br from-indigo-950/20 via-zinc-950/80 to-purple-950/20 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">

        {/* ── Header: locale / country / timezone ── */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider flex-wrap">
            <Globe className="h-3.5 w-3.5 text-indigo-400 animate-pulse flex-shrink-0" />
            <span>{userLocale}</span>
            <span className="opacity-40">|</span>
            <span className="flex items-center gap-1">
              <span className="text-sm leading-none">{countryInfo.flag}</span>
              <span className="text-[10px] text-indigo-300">{countryInfo.name}</span>
            </span>
            {isLoadingHolidays && (
              <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
            )}
            {usingFallback && !isLoadingHolidays && (
              <span className="text-[9px] text-zinc-500 italic normal-case">offline data</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-zinc-400 text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/15 flex-shrink-0">
            <Clock className="h-3 w-3 text-indigo-400" />
            <span>{userTimezone.split('/').pop()?.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* ── Month navigation ── */}
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-black tracking-tight capitalize select-none">
            {monthName}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost" size="icon"
              onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Weekday labels ── */}
        <div className="grid grid-cols-7 gap-1 text-center text-zinc-500 text-xs font-black uppercase tracking-wider">
          {weekdays.map((d, i) => <div key={i} className="py-1">{d}</div>)}
        </div>

        {/* ── Day cells ── */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} className="aspect-square" />;

            const isToday =
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;
            const isSelected = selectedDay === day;
            const holiday = activeMonthHolidays[day];

            return (
              <motion.button
                key={`d-${day}`}
                onHoverStart={() => setHoveredDay(day)}
                onHoverEnd={() => setHoveredDay(null)}
                onClick={() => setSelectedDay(day)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-all duration-300 relative',
                  isToday
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/20'
                    : isSelected
                    ? holiday
                      ? 'bg-rose-950/80 text-rose-200 border-rose-500/60 shadow-inner shadow-rose-500/20 animate-pulse'
                      : 'bg-indigo-950/80 text-indigo-200 border-indigo-500/40 shadow-inner'
                    : holiday
                    ? 'bg-rose-950/30 text-rose-300 border-rose-500/30 hover:border-rose-400/50 shadow-sm'
                    : 'bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 border-zinc-900 hover:border-zinc-700/50'
                )}
              >
                <span>{day}</span>
                {holiday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute bottom-1.5 shadow-md shadow-rose-500/50 animate-pulse" />
                )}
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

        {/* ── Holiday info banner ── */}
        <AnimatePresence mode="wait">
          {selectedHolidayInfo ? (
            <motion.div
              key={`hol-${selectedDay}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-3 flex gap-2.5 items-start relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-rose-500/5 blur-md pointer-events-none" />
              <div className="text-xl p-1.5 bg-rose-500/10 rounded-lg flex-shrink-0">🎈</div>
              <div>
                <p className="text-[10px] font-extrabold uppercase text-rose-300 tracking-wider mb-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-rose-400" />
                  Public Holiday · {formattedSelectedDate}
                </p>
                <p className="text-xs text-rose-100 font-bold leading-normal">
                  {selectedHolidayInfo.name}
                </p>
                {selectedHolidayInfo.localName &&
                 selectedHolidayInfo.localName !== selectedHolidayInfo.name && (
                  <p className="text-[10px] text-rose-300/70 mt-0.5 italic">
                    {selectedHolidayInfo.localName}
                  </p>
                )}
              </div>
            </motion.div>
          ) : selectedDay !== null ? (
            <motion.div
              key={`reg-${selectedDay}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-zinc-900/20 border border-white/5 rounded-2xl p-3 text-center text-[11px] font-semibold text-zinc-400"
            >
              {formattedSelectedDate} — No public holidays
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Footer: today's date ── */}
        <div className="pt-2 border-t border-white/5 flex flex-col gap-1 items-center">
          <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
            <Calendar className="h-3 w-3 text-indigo-400" />
            Today
          </p>
          <p className="text-xs text-indigo-200 font-bold text-center capitalize leading-relaxed">
            {formattedToday}
          </p>
        </div>

      </div>
    </motion.div>
  );
}
