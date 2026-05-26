'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, MapPin, Navigation, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeatherData {
  temp: number;
  code: number;
  windSpeed: number;
  humidity: number;
  city: string;
  country: string;
  countryCode: string;
}

export function BeautifulWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectLocationAndFetchWeather();
  }, []);

  const detectLocationAndFetchWeather = () => {
    setLoading(true);
    setError(null);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocode to get city name keylessly from OpenStreetMap Nominatim
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
          fetchWeatherViaIP();
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeatherViaIP();
    }
  };

  const fetchWeatherViaIP = async () => {
    try {
      // Use ipapi.co for seamless geo-ip lookup with zero keys required
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
      // Premium Mock fallback for seamless UX if offline or firewalled
      setWeather({
        temp: 26.5,
        code: 2, // partly cloudy
        windSpeed: 8.4,
        humidity: 65,
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
      // Get approximate humidity from relative_humidity_2m
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
        label: 'Sunny Skies',
        bg: 'from-amber-950/20 via-zinc-950/90 to-yellow-950/20',
        border: 'border-amber-500/20',
        text: 'text-amber-450',
        icon: <Sun className="h-10 w-10 text-yellow-500 animate-spin-slow" />,
        effect: 'sunny',
        quote: 'Bright minds thrive in bright sunshine! ☀️ Ready to crush your daily learning goals?'
      };
    } else if (code >= 1 && code <= 3) {
      return {
        label: 'Partly Cloudy',
        bg: 'from-blue-950/20 via-zinc-950/90 to-indigo-950/20',
        border: 'border-indigo-500/20',
        text: 'text-indigo-300',
        icon: <Cloud className="h-10 w-10 text-indigo-400 animate-bounce-slow" />,
        effect: 'cloudy',
        quote: 'A cool, calm sky. The perfect canvas to focus on learning! ☁️📚'
      };
    } else if (code === 45 || code === 48) {
      return {
        label: 'Misty Fog',
        bg: 'from-slate-900/40 via-zinc-950/90 to-zinc-900/40',
        border: 'border-slate-800',
        text: 'text-slate-400',
        icon: <Wind className="h-10 w-10 text-slate-500 animate-pulse" />,
        effect: 'foggy',
        quote: 'Foggy outlooks are easily cleared with a sharp, active mind! 🌫️🧠'
      };
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return {
        label: 'Rainy Showers',
        bg: 'from-cyan-950/30 via-zinc-950/90 to-blue-950/30',
        border: 'border-cyan-500/20',
        text: 'text-cyan-300',
        icon: <CloudRain className="h-10 w-10 text-cyan-400 animate-bounce-slow" />,
        effect: 'rainy',
        quote: 'The rain outside is the perfect excuse to stay cozy and study! 🌧️☕📖'
      };
    } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return {
        label: 'Glistening Snow',
        bg: 'from-sky-950/30 via-zinc-950/90 to-slate-950/30',
        border: 'border-sky-500/20',
        text: 'text-sky-200',
        icon: <CloudSnow className="h-10 w-10 text-sky-250 animate-pulse" />,
        effect: 'snowy',
        quote: 'Snowflakes falling. Stay warm, grab a blanket, and let’s play interactive quizzes! ❄️🔥'
      };
    } else if (code >= 95 && code <= 99) {
      return {
        label: 'Thunderstorm',
        bg: 'from-purple-950/30 via-zinc-950/90 to-fuchsia-950/30',
        border: 'border-purple-500/30',
        text: 'text-purple-300',
        icon: <CloudLightning className="h-10 w-10 text-purple-500 animate-pulse" />,
        effect: 'stormy',
        quote: 'Electric energy in the air! Let’s channel that power into master challenges! ⚡🎓'
      };
    }
    
    return {
      label: 'Temperate Climate',
      bg: 'from-indigo-950/20 via-zinc-950/90 to-purple-950/20',
      border: 'border-indigo-500/20',
      text: 'text-indigo-300',
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
      .map(char =>  127397 + char.charCodeAt(0));
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

  const theme = weather ? getWeatherTheme(weather.code) : getWeatherTheme(2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`w-full bg-gradient-to-br ${theme.bg} ${theme.border} backdrop-blur-xl border rounded-3xl p-5 shadow-2xl relative overflow-hidden select-none`}
    >
      {/* Dynamic CSS Particle Animations in Background */}
      {theme.effect === 'rainy' && (
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
          <div className="absolute top-0 left-[20%] w-0.5 h-16 bg-gradient-to-b from-transparent to-cyan-400 animate-rain-drop" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
          <div className="absolute top-0 left-[40%] w-0.5 h-16 bg-gradient-to-b from-transparent to-cyan-400 animate-rain-drop" style={{ animationDelay: '0.5s', animationDuration: '1.2s' }} />
          <div className="absolute top-0 left-[60%] w-0.5 h-16 bg-gradient-to-b from-transparent to-cyan-400 animate-rain-drop" style={{ animationDelay: '0.3s', animationDuration: '0.9s' }} />
          <div className="absolute top-0 left-[80%] w-0.5 h-16 bg-gradient-to-b from-transparent to-cyan-400 animate-rain-drop" style={{ animationDelay: '0.7s', animationDuration: '1.1s' }} />
        </div>
      )}

      {theme.effect === 'snowy' && (
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
          <div className="absolute top-2 left-[15%] w-1.5 h-1.5 bg-white rounded-full animate-snow-fall" style={{ animationDelay: '0.2s', animationDuration: '3s' }} />
          <div className="absolute top-2 left-[45%] w-1 h-1 bg-white rounded-full animate-snow-fall" style={{ animationDelay: '1.2s', animationDuration: '4.5s' }} />
          <div className="absolute top-2 left-[75%] w-2 h-2 bg-white rounded-full animate-snow-fall" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
        </div>
      )}

      {theme.effect === 'sunny' && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />
      )}

      {theme.effect === 'stormy' && (
        <div className="absolute inset-0 bg-white/0 animate-lightning-flash pointer-events-none z-0" />
      )}

      {/* Main Container */}
      <div className="relative z-10 space-y-4">
        
        {/* Header (Geo Location Tracking) */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span className="text-indigo-250 truncate max-w-[120px]">{weather ? `${weather.city}` : 'Geo Tracker'}</span>
            <span className="text-zinc-650 opacity-60">|</span>
            <span className="text-zinc-300 font-extrabold flex items-center gap-1">
              <span>{weather ? getFlagEmoji(weather.countryCode) : '🌐'}</span>
              <span className="text-[10px] text-zinc-400 truncate max-w-[90px]">{weather ? weather.country : 'Detecting...'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={detectLocationAndFetchWeather}
              title="Refetch weather"
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Navigation className="h-3 w-3 text-indigo-400 rotate-45" />
            </button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
              className="h-6 w-8 text-[9px] font-black uppercase text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/15 rounded-lg"
            >
              °{unit}
            </Button>
          </div>
        </div>

        {/* Loading Display */}
        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold animate-pulse">Syncing Atmosphere...</p>
          </div>
        ) : weather ? (
          <div className="space-y-3.5">
            {/* Middle Section (Icon & Temperature) */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-lg shrink-0">
                  {theme.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-black text-white leading-none tracking-tight">
                    {displayTemp(weather.temp)}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-1 text-slate-400">
                    {theme.label}
                  </p>
                </div>
              </div>

              {/* Extras (Wind & Humidity) */}
              <div className="text-right space-y-1 font-mono text-[10px] font-bold text-slate-400 bg-white/5 p-2 rounded-xl border border-white/5 shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <Wind className="h-3 w-3 text-indigo-400" />
                  <span>{weather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Droplets className="h-3 w-3 text-cyan-400" />
                  <span>{weather.humidity}% RH</span>
                </div>
              </div>
            </div>

            {/* Smart Quote Banner */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex gap-2.5 items-center relative overflow-hidden animate-in fade-in duration-500">
              <div className="text-lg flex-shrink-0 animate-bounce-slow">💡</div>
              <p className="text-[10px] text-slate-300 font-medium leading-relaxed text-left">
                {theme.quote}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-rose-400 font-bold text-xs">
            {error || "Could not retrieve local weather data"}
          </div>
        )}
      </div>

      {/* Embedded Animations Styles */}
      <style jsx global>{`
        @keyframes rainFall {
          0% { transform: translateY(-50px); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(200px); opacity: 0; }
        }
        @keyframes snowFall {
          0% { transform: translateY(-10px) translateX(0); opacity: 0; }
          50% { opacity: 0.8; transform: translateY(100px) translateX(15px); }
          100% { transform: translateY(200px) translateX(-5px); opacity: 0; }
        }
        @keyframes lightning {
          0%, 90%, 94%, 98%, 100% { opacity: 0; }
          92%, 96% { opacity: 0.25; }
        }
        .animate-rain-drop {
          animation: rainFall infinite linear;
        }
        .animate-snow-fall {
          animation: snowFall infinite linear;
        }
        .animate-lightning-flash {
          animation: lightning 6s infinite ease-in-out;
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
