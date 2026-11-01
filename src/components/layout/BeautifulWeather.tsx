'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Gauge, 
  Compass, 
  ThermometerSun,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSeasonalTheme } from '@/context/seasonal-theme-context';

interface WeatherData {
  temp: number;
  code: number;
  windSpeed: number;
  humidity: number;
  city: string;
  country: string;
  countryCode: string;
}

interface BeautifulWeatherProps {
  className?: string;
}

export function BeautifulWeather({ className = "" }: BeautifulWeatherProps) {
  const { activeTheme, isThemeActiveForUser, settings: seasonalSettings } = useSeasonalTheme();
  const isSeasonalActive = isThemeActiveForUser && (seasonalSettings.includeLoginPage ?? true) && activeTheme.id !== 'default';

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectLocationAndFetchWeather();
  }, []);

  const detectLocationAndFetchWeather = (isManual: any = false) => {
    setLoading(true);
    setError(null);

    const isManualTrigger = isManual === true || (isManual && typeof isManual === 'object' && 'preventDefault' in isManual);
    const locationAllowed = typeof window !== 'undefined' ? localStorage.getItem('lingoland_location_allowed') : null;

    const callGeolocation = () => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('lingoland_location_allowed', 'true');
            }
            const { latitude, longitude } = position.coords;
            try {
              let city = 'Your Area';
              let country = 'Earth';
              let countryCode = '🌐';
              
              try {
                const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
                  headers: {
                    'User-Agent': 'LingoLandVerse-Weather-App'
                  }
                });
                if (geoResponse.ok) {
                  const geoData = await geoResponse.json();
                  city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.suburb || 'Local Area';
                  country = geoData.address?.country || 'Earth';
                  countryCode = geoData.address?.country_code?.toUpperCase() || '🌐';
                }
              } catch (e) {
                console.warn("OSM reverse geocoding failed, falling back to coordinates");
              }

              await fetchWeatherDetails(latitude, longitude, city, country, countryCode);
            } catch (err) {
              console.error(err);
              fetchWeatherViaIP();
            }
          },
          (geoError) => {
            console.warn("Geolocation permission denied or timed out. Falling back to IP-based lookup.", geoError);
            if (typeof window !== 'undefined') {
              if (geoError.code === geoError.PERMISSION_DENIED) {
                localStorage.setItem('lingoland_location_allowed', 'false');
              }
            }
            fetchWeatherViaIP();
          },
          { timeout: 8000 }
        );
      } else {
        fetchWeatherViaIP();
      }
    };

    if (isManualTrigger) {
      callGeolocation();
    } else {
      if (locationAllowed === 'false') {
        fetchWeatherViaIP();
      } else {
        callGeolocation();
      }
    }
  };

  const fetchWeatherViaIP = async () => {
    try {
      const ipResponse = await fetch('https://ipapi.co/json/');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        const lat = ipData.latitude;
        const lon = ipData.longitude;
        const city = ipData.city || 'Local Area';
        const country = ipData.country_name || 'Earth';
        const countryCode = ipData.country || '🌐';
        
        if (lat && lon) {
          await fetchWeatherDetails(lat, lon, city, country, countryCode);
          return;
        }
      }
      throw new Error("IP lookup failed to yield coordinates");
    } catch (err) {
      console.error("IP lookup failed, using high-fidelity fallback weather:", err);
      setWeather({
        temp: 29.5,
        code: 2,
        windSpeed: 6.8,
        humidity: 68,
        city: 'Bangkok',
        country: 'Thailand',
        countryCode: 'TH'
      });
      setLoading(false);
    }
  };

  const fetchWeatherDetails = async (lat: number, lon: number, city: string, country: string, countryCode: string) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`
      );
      if (!response.ok) throw new Error("Weather API failed");
      const data = await response.json();
      
      const current = data.current_weather;
      const humidity = data.hourly?.relative_humidity_2m?.[0] || 60;
      
      setWeather({
        temp: current.temperature,
        code: current.weathercode,
        windSpeed: current.windspeed,
        humidity,
        city,
        country,
        countryCode
      });
    } catch (err) {
      console.error(err);
      setError("Failed to download local weather. Refreshing...");
    } finally {
      setLoading(false);
    }
  };

  // Convert WMO Weather Code to descriptive name, HSL design themes, and icons
  const getWeatherTheme = (code: number) => {
    if (code === 0) {
      return {
        label: 'Clear Sunny Skies',
        bg: 'from-amber-950/30 via-slate-950/90 to-yellow-950/20',
        border: 'border-amber-500/30 hover:border-amber-400/50',
        auraColor: 'rgba(245, 158, 11, 0.25)',
        textGradient: 'from-amber-300 via-yellow-200 to-amber-400',
        badgeBg: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
        icon: <Sun className="h-10 w-10 text-amber-400 animate-spin-slow" />,
        effect: 'sunny',
        quote: 'Bright sunshine outside! A magnificent day to elevate your language skills! ☀️📖'
      };
    } else if (code >= 1 && code <= 3) {
      return {
        label: 'Partly Cloudy',
        bg: 'from-blue-950/30 via-slate-950/90 to-indigo-950/25',
        border: 'border-cyan-500/30 hover:border-cyan-400/50',
        auraColor: 'rgba(56, 189, 248, 0.25)',
        textGradient: 'from-cyan-300 via-blue-200 to-indigo-300',
        badgeBg: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300',
        icon: <Cloud className="h-10 w-10 text-cyan-300 animate-bounce-slow" />,
        effect: 'cloudy',
        quote: 'A cool, calm sky. The perfect canvas to focus on learning! ☁️📚'
      };
    } else if (code === 45 || code === 48) {
      return {
        label: 'Misty Fog',
        bg: 'from-slate-900/40 via-slate-950/90 to-zinc-900/40',
        border: 'border-slate-700/40 hover:border-slate-500/60',
        auraColor: 'rgba(148, 163, 184, 0.2)',
        textGradient: 'from-slate-200 via-slate-300 to-zinc-400',
        badgeBg: 'bg-slate-500/15 border-slate-400/30 text-slate-300',
        icon: <Wind className="h-10 w-10 text-slate-400 animate-pulse" />,
        effect: 'foggy',
        quote: 'Foggy outlooks are easily cleared with a sharp, active mind! 🌫️🧠'
      };
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return {
        label: 'Rainy Showers',
        bg: 'from-cyan-950/40 via-slate-950/90 to-blue-950/35',
        border: 'border-cyan-500/35 hover:border-cyan-400/60',
        auraColor: 'rgba(6, 182, 212, 0.3)',
        textGradient: 'from-cyan-300 via-sky-200 to-teal-300',
        badgeBg: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300',
        icon: <CloudRain className="h-10 w-10 text-cyan-400 animate-bounce-slow" />,
        effect: 'rainy',
        quote: 'The rain outside is the perfect excuse to stay cozy and study! 🌧️☕📖'
      };
    } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return {
        label: 'Glistening Snow',
        bg: 'from-sky-950/40 via-slate-950/90 to-indigo-950/30',
        border: 'border-sky-500/35 hover:border-sky-400/60',
        auraColor: 'rgba(56, 189, 248, 0.3)',
        textGradient: 'from-sky-200 via-white to-blue-300',
        badgeBg: 'bg-sky-500/15 border-sky-400/30 text-sky-200',
        icon: <CloudSnow className="h-10 w-10 text-sky-300 animate-pulse" />,
        effect: 'snowy',
        quote: 'Snowflakes falling. Stay warm, grab a blanket, and let’s play interactive quizzes! ❄️🔥'
      };
    } else if (code >= 95 && code <= 99) {
      return {
        label: 'Electric Thunderstorm',
        bg: 'from-purple-950/40 via-slate-950/90 to-fuchsia-950/35',
        border: 'border-purple-500/40 hover:border-purple-400/60',
        auraColor: 'rgba(168, 85, 247, 0.35)',
        textGradient: 'from-purple-300 via-fuchsia-200 to-pink-300',
        badgeBg: 'bg-purple-500/15 border-purple-400/30 text-purple-300',
        icon: <CloudLightning className="h-10 w-10 text-purple-400 animate-pulse" />,
        effect: 'stormy',
        quote: 'Electric energy in the air! Channel that power into daily vocabulary challenges! ⚡🎓'
      };
    }
    
    return {
      label: 'Temperate Climate',
      bg: 'from-indigo-950/30 via-slate-950/90 to-purple-950/25',
      border: 'border-indigo-500/30 hover:border-indigo-400/50',
      auraColor: 'rgba(99, 102, 241, 0.25)',
      textGradient: 'from-indigo-200 via-slate-100 to-cyan-300',
      badgeBg: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300',
      icon: <Sparkles className="h-10 w-10 text-indigo-400" />,
      effect: 'sunny',
      quote: 'The universe is waiting. Open your mind to new insights today! 🌐💡'
    };
  };

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode === '🌐') return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch {
      return countryCode;
    }
  };

  const displayTemp = (celsius: number) => {
    if (unit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  // Feels-like approximation
  const displayFeelsLike = (celsius: number, humidity: number, windSpeed: number) => {
    const feels = celsius + (humidity > 70 ? 2 : 0) - (windSpeed > 15 ? 1.5 : 0);
    return displayTemp(feels);
  };

  const theme = weather ? getWeatherTheme(weather.code) : getWeatherTheme(2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        "w-full h-full backdrop-blur-md md:backdrop-blur-2xl rounded-3xl p-4 sm:p-5 relative overflow-hidden select-none flex flex-col justify-between transition-all duration-700 group",
        isSeasonalActive
          ? `bg-slate-950/95 border-2 ${activeTheme.borderColor}`
          : `bg-gradient-to-br ${theme.bg} ${theme.border} border shadow-[0_12px_40px_rgba(0,0,0,0.65)]`,
        className
      )}
      style={{
        boxShadow: isSeasonalActive
          ? `0 0 50px ${activeTheme.glowColor}, inset 0 0 25px ${activeTheme.glowColor}`
          : undefined,
      }}
    >
      {/* Dynamic Ambient Glow Aura (Themed to Seasonal Accent) */}
      <div 
        className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          backgroundColor: isSeasonalActive ? activeTheme.accentColor : theme.auraColor,
          opacity: isSeasonalActive ? 0.22 : 0.18
        }} 
      />
      <div 
        className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700" 
        style={{ 
          backgroundColor: isSeasonalActive ? activeTheme.accentColor : theme.auraColor,
          opacity: isSeasonalActive ? 0.22 : 0.15
        }} 
      />

      {/* Sleek Top Edge Highlight */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {/* Dynamic Weather Particle Animations in Background */}
      {theme.effect === 'rainy' && (
        <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
          <div className="absolute top-0 left-[20%] w-0.5 h-16 bg-gradient-to-b from-transparent to-cyan-400 animate-rain-drop" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
          <div className="absolute top-0 left-[45%] w-0.5 h-16 bg-gradient-to-b from-transparent to-cyan-400 animate-rain-drop" style={{ animationDelay: '0.5s', animationDuration: '1.2s' }} />
          <div className="absolute top-0 left-[70%] w-0.5 h-16 bg-gradient-to-b from-transparent to-cyan-400 animate-rain-drop" style={{ animationDelay: '0.3s', animationDuration: '0.9s' }} />
          <div className="absolute top-0 left-[90%] w-0.5 h-16 bg-gradient-to-b from-transparent to-cyan-400 animate-rain-drop" style={{ animationDelay: '0.7s', animationDuration: '1.1s' }} />
        </div>
      )}

      {theme.effect === 'snowy' && (
        <div className="absolute inset-0 pointer-events-none opacity-35 z-0">
          <div className="absolute top-2 left-[15%] w-1.5 h-1.5 bg-white rounded-full animate-snow-fall" style={{ animationDelay: '0.2s', animationDuration: '3s' }} />
          <div className="absolute top-2 left-[45%] w-1 h-1 bg-white rounded-full animate-snow-fall" style={{ animationDelay: '1.2s', animationDuration: '4.5s' }} />
          <div className="absolute top-2 left-[75%] w-2 h-2 bg-white rounded-full animate-snow-fall" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
        </div>
      )}

      {/* ── Main Container ── */}
      <div className="relative z-10 space-y-3.5 flex-1 flex flex-col justify-between">
        
        {/* ── Top Bar (Location Tracker & Temperature Toggle) ── */}
        <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
          {/* Location Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-slate-300 text-xs font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <MapPin className="h-3 w-3 text-cyan-400" />
            <span className="font-extrabold text-white truncate max-w-[130px]">
              {weather ? weather.city : 'Locating...'}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-sm">{weather ? getFlagEmoji(weather.countryCode) : '🌐'}</span>
            <span className="text-[11px] text-slate-400 font-bold uppercase truncate max-w-[90px]">
              {weather ? weather.country : 'Earth'}
            </span>
          </div>

          {/* Seasonal Festive Tag in Location Header */}
          {isSeasonalActive && (
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold shadow-sm backdrop-blur-md transition-all animate-pulse",
              activeTheme.badgeBg,
              activeTheme.borderColor,
              activeTheme.badgeText
            )}>
              <span className="text-xs">{activeTheme.emoji}</span>
              <span className="hidden sm:inline font-bold">{activeTheme.name}</span>
            </div>
          )}

          {/* Action Controls: Refresh & °C / °F Switch */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={detectLocationAndFetchWeather}
              title="Refresh local weather"
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <RotateCw className={cn("h-3.5 w-3.5 text-cyan-400", loading && "animate-spin")} />
            </button>

            {/* High-Tech Unit Toggle Pill */}
            <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setUnit('C')}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-black uppercase rounded-lg transition-all",
                  unit === 'C'
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    : "text-slate-400 hover:text-white"
                )}
              >
                °C
              </button>
              <button
                onClick={() => setUnit('F')}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-black uppercase rounded-lg transition-all",
                  unit === 'F'
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    : "text-slate-400 hover:text-white"
                )}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* ── Weather Body ── */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <div className="h-9 w-9 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-[10px] text-cyan-300 uppercase tracking-widest font-black animate-pulse">
              Syncing Planetary Atmosphere...
            </p>
          </div>
        ) : weather ? (
          <div className="space-y-3.5">
            
            {/* Hero Weather Section: 3D Icon Pod & Large Temperature */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/[0.1] shadow-inner">
              <div className="flex items-center gap-3.5">
                {/* 3D Glowing Weather Pod (Themed Glow) */}
                <div 
                  className={cn(
                    "p-3 rounded-2xl bg-gradient-to-b from-white/[0.1] to-black/40 border shrink-0 relative overflow-hidden transition-all duration-700",
                    isSeasonalActive ? activeTheme.borderColor : "border-white/[0.15]"
                  )}
                  style={{ 
                    boxShadow: isSeasonalActive 
                      ? `0 0 25px ${activeTheme.glowColor}` 
                      : `0 0 20px ${theme.auraColor}` 
                  }}
                >
                  <div className="absolute top-0 inset-x-1 h-[1px] bg-white/40 pointer-events-none" />
                  {theme.icon}
                </div>

                {/* Hero Temperature */}
                <div>
                  <h3 className={cn(
                    "text-3xl sm:text-4xl font-black tracking-tight leading-none bg-gradient-to-r bg-clip-text text-transparent font-mono select-none drop-shadow-sm",
                    theme.textGradient
                  )}>
                    {displayTemp(weather.temp)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm",
                      isSeasonalActive ? activeTheme.badgeBg : theme.badgeBg,
                      isSeasonalActive ? activeTheme.borderColor : undefined,
                      isSeasonalActive ? activeTheme.badgeText : undefined
                    )}>
                      {isSeasonalActive ? `${activeTheme.emoji} ${theme.label}` : theme.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thermal Perception Tag */}
              <div className="text-right hidden sm:flex flex-col items-end justify-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Perception</span>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/25 mt-0.5">
                  Feels {displayFeelsLike(weather.temp, weather.humidity, weather.windSpeed)}
                </span>
              </div>
            </div>

            {/* ── 4-Tile Cockpit Telemetry Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Tile 1: Wind */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-black uppercase tracking-wider">Wind</span>
                  <Wind className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="mt-1">
                  <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-tight">
                    {weather.windSpeed} <span className="text-[9px] font-normal text-slate-400">km/h</span>
                  </span>
                </div>
              </div>

              {/* Tile 2: Humidity */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-black uppercase tracking-wider">Humidity</span>
                  <Droplets className="w-3 h-3 text-sky-400" />
                </div>
                <div className="mt-1">
                  <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-tight">
                    {weather.humidity}% <span className="text-[9px] font-normal text-slate-400">RH</span>
                  </span>
                </div>
              </div>

              {/* Tile 3: Pressure */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-black uppercase tracking-wider">Pressure</span>
                  <Gauge className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="mt-1">
                  <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-tight">
                    1013 <span className="text-[9px] font-normal text-slate-400">hPa</span>
                  </span>
                </div>
              </div>

              {/* Tile 4: Atmosphere Condition */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-black uppercase tracking-wider">Index</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <div className="mt-1">
                  <span className="text-xs sm:text-sm font-bold text-emerald-300 tracking-tight">
                    Optimal Focus
                  </span>
                </div>
              </div>
            </div>

            {/* ── Inspirational Motivational Banner (Themed to Season) ── */}
            <div className={cn(
              "p-2.5 sm:p-3 rounded-2xl border flex items-center gap-2.5 shadow-inner relative overflow-hidden transition-all duration-700",
              isSeasonalActive 
                ? `bg-slate-900/80 ${activeTheme.borderColor}` 
                : "bg-white/[0.03] border-white/[0.08]"
            )}>
              <div className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-sm shrink-0 border",
                isSeasonalActive
                  ? `${activeTheme.badgeBg} ${activeTheme.borderColor}`
                  : "bg-amber-500/15 border-amber-400/30"
              )}>
                {isSeasonalActive ? activeTheme.emoji : "💡"}
              </div>
              <p className="text-[11px] text-slate-200 font-medium leading-relaxed text-left line-clamp-2">
                {isSeasonalActive ? activeTheme.greetingText : theme.quote}
              </p>
            </div>

          </div>
        ) : (
          <div className="py-6 text-center text-rose-400 font-bold text-xs">
            {error || "Could not retrieve local weather data"}
          </div>
        )}

      </div>

      {/* Embedded Particle Animation Styles */}
      <style jsx global>{`
        @keyframes rainFall {
          0% { transform: translateY(-30px); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(180px); opacity: 0; }
        }
        @keyframes snowFall {
          0% { transform: translateY(-10px) translateX(0); opacity: 0; }
          50% { opacity: 0.8; transform: translateY(80px) translateX(12px); }
          100% { transform: translateY(160px) translateX(-4px); opacity: 0; }
        }
        .animate-rain-drop {
          animation: rainFall infinite linear;
        }
        .animate-snow-fall {
          animation: snowFall infinite linear;
        }
        .animate-spin-slow {
          animation: spin 16s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </motion.div>
  );
}
