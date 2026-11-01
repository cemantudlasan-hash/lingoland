'use client';

import { useState, useEffect } from 'react';

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Thailand & Southeast Asia
  'Asia/Bangkok': 'TH',
  'Asia/Phnom_Penh': 'KH',
  'Asia/Vientiane': 'LA',
  'Asia/Manila': 'PH',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Jakarta': 'ID',
  'Asia/Pontianak': 'ID',
  'Asia/Makassar': 'ID',
  'Asia/Jayapura': 'ID',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Saigon': 'VN',
  'Asia/Yangon': 'MM',

  // East Asia
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Taipei': 'TW',
  'Asia/Hong_Kong': 'HK',
  'Asia/Shanghai': 'CN',
  'Asia/Chongqing': 'CN',
  'Asia/Harbin': 'CN',
  'Asia/Urumqi': 'CN',

  // South Asia
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Dhaka': 'BD',
  'Asia/Colombo': 'LK',

  // Americas
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Phoenix': 'US',
  'America/Detroit': 'US',
  'America/Indiana/Indianapolis': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Sao_Paulo': 'BR',
  'America/Mexico_City': 'MX',

  // Europe
  'Europe/London': 'GB',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Helsinki': 'FI',
  'Europe/Athens': 'GR',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH',

  // Oceania
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ',
};

function inferCountryFromClient(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_COUNTRY[tz]) {
      return TIMEZONE_TO_COUNTRY[tz];
    }

    if (typeof navigator !== 'undefined' && navigator.language) {
      const lang = navigator.language;
      const parts = lang.split('-');
      if (parts.length === 2 && parts[1].length === 2) {
        return parts[1].toUpperCase();
      }
      if (lang.toLowerCase() === 'th') return 'TH';
      if (lang.toLowerCase() === 'ja') return 'JP';
      if (lang.toLowerCase() === 'ko') return 'KR';
      if (lang.toLowerCase() === 'vi') return 'VN';
      if (lang.toLowerCase() === 'es') return 'ES';
      if (lang.toLowerCase() === 'fr') return 'FR';
      if (lang.toLowerCase() === 'de') return 'DE';
    }
  } catch (e) {
    // ignore
  }

  return 'UNKNOWN';
}

const STORAGE_KEY = 'lingoland_user_country';

export function useUserCountry() {
  const [country, setCountry] = useState<string>('UNKNOWN');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function detectCountry() {
      // 1. Check session storage cache
      try {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached && cached !== 'UNKNOWN') {
          if (isMounted) {
            setCountry(cached);
            setIsLoading(false);
          }
          return;
        }
      } catch (e) {}

      let detected = 'UNKNOWN';

      // 2. Fetch from Edge/CDN headers
      try {
        const res = await fetch('/api/geo', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.country && data.country !== 'UNKNOWN') {
            detected = data.country.toUpperCase();
          }
        }
      } catch (err) {
        // network or fetch error, fallback to client
      }

      // 3. Fallback to client browser timezone & locale if edge header is missing/local
      if (detected === 'UNKNOWN') {
        detected = inferCountryFromClient();
      }

      if (isMounted) {
        setCountry(detected);
        setIsLoading(false);
        try {
          if (detected !== 'UNKNOWN') {
            sessionStorage.setItem(STORAGE_KEY, detected);
          }
        } catch (e) {}
      }
    }

    detectCountry();

    return () => {
      isMounted = false;
    };
  }, []);

  return { country, isLoading };
}
