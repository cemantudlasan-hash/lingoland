import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Timezone → ISO 3166-1 alpha-2 Country Code ─────────────────────────────
export const TIMEZONE_TO_COUNTRY: Record<string, string> = {
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
  'America/Honolulu': 'US', 'America/Detroit': 'US', 'America/Indiana/Indianapolis': 'US',
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

// ─── Country Display Info ───────────────────────────────────────────────────
export const COUNTRY_INFO: Record<string, { name: string; flag: string }> = {
  TH: { name: 'Thailand', flag: '🇹🇭' },
  US: { name: 'United States', flag: '🇺🇸' },
  GB: { name: 'United Kingdom', flag: '🇬🇧' },
  CA: { name: 'Canada', flag: '🇨🇦' },
  AU: { name: 'Australia', flag: '🇦🇺' },
  JP: { name: 'Japan', flag: '🇯🇵' },
  KR: { name: 'South Korea', flag: '🇰🇷' },
  SG: { name: 'Singapore', flag: '🇸🇬' },
  MY: { name: 'Malaysia', flag: '🇲🇾' },
  PH: { name: 'Philippines', flag: '🇵🇭' },
  ID: { name: 'Indonesia', flag: '🇮🇩' },
  VN: { name: 'Vietnam', flag: '🇻🇳' },
  CN: { name: 'China', flag: '🇨🇳' },
  IN: { name: 'India', flag: '🇮🇳' },
  DE: { name: 'Germany', flag: '🇩🇪' },
  FR: { name: 'France', flag: '🇫🇷' },
  ES: { name: 'Spain', flag: '🇪🇸' },
  IT: { name: 'Italy', flag: '🇮🇹' },
  NL: { name: 'Netherlands', flag: '🇳🇱' },
  NZ: { name: 'New Zealand', flag: '🇳🇿' },
  BR: { name: 'Brazil', flag: '🇧🇷' },
  MX: { name: 'Mexico', flag: '🇲🇽' },
};

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_INFO).map(code => ({
  code,
  ...COUNTRY_INFO[code]
}));

// ─── Static Fallback Holidays Dataset ───────────────────────────────────────
export const THAI_AND_INTERNATIONAL_HOLIDAYS = [
  // 2024 Holidays
  { date: '2024-01-01', name: "New Year's Day", type: 'international', country: 'TH' },
  { date: '2024-02-24', name: 'Makha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2024-04-06', name: 'Chakri Day', type: 'thai_public', country: 'TH' },
  { date: '2024-04-08', name: 'Chakri Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2024-04-13', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2024-04-14', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2024-04-15', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2024-04-16', name: 'Songkran Festival (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2024-05-01', name: 'Labour Day', type: 'thai_public', country: 'TH' },
  { date: '2024-05-04', name: 'Coronation Day', type: 'thai_public', country: 'TH' },
  { date: '2024-05-06', name: 'Coronation Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2024-05-22', name: 'Visakha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2024-06-03', name: "Queen Suthida's Birthday", type: 'thai_public', country: 'TH' },
  { date: '2024-07-20', name: 'Asalha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2024-07-22', name: 'Asalha Bucha Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2024-07-28', name: "King Vajiralongkorn's Birthday", type: 'thai_public', country: 'TH' },
  { date: '2024-07-29', name: "King Vajiralongkorn's Birthday (Observed)", type: 'thai_public', country: 'TH' },
  { date: '2024-08-12', name: "Mother's Day", type: 'thai_public', country: 'TH' },
  { date: '2024-10-13', name: 'King Bhumibol Memorial Day', type: 'thai_public', country: 'TH' },
  { date: '2024-10-14', name: 'King Bhumibol Memorial Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2024-10-23', name: 'Chulalongkorn Day', type: 'thai_public', country: 'TH' },
  { date: '2024-10-31', name: 'Halloween', type: 'international_observance', country: 'TH' },
  { date: '2024-12-05', name: "Father's Day", type: 'thai_public', country: 'TH' },
  { date: '2024-12-10', name: 'Constitution Day', type: 'thai_public', country: 'TH' },
  { date: '2024-12-25', name: 'Christmas Day', type: 'international', country: 'TH' },
  { date: '2024-12-31', name: "New Year's Eve", type: 'international', country: 'TH' },

  // 2025 Holidays (Thailand)
  { date: '2025-01-01', name: "New Year's Day", type: 'international', country: 'TH' },
  { date: '2025-02-12', name: 'Makha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2025-04-06', name: 'Chakri Day', type: 'thai_public', country: 'TH' },
  { date: '2025-04-07', name: 'Chakri Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2025-04-13', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2025-04-14', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2025-04-15', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2025-04-16', name: 'Songkran Festival (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2025-05-01', name: 'Labour Day', type: 'thai_public', country: 'TH' },
  { date: '2025-05-04', name: 'Coronation Day', type: 'thai_public', country: 'TH' },
  { date: '2025-05-05', name: 'Coronation Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2025-05-11', name: 'Visakha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2025-05-12', name: 'Visakha Bucha Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2025-06-03', name: "Queen Suthida's Birthday", type: 'thai_public', country: 'TH' },
  { date: '2025-07-10', name: 'Asalha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2025-07-11', name: 'Buddhist Lent Day', type: 'thai_public', country: 'TH' },
  { date: '2025-07-28', name: "King Vajiralongkorn's Birthday", type: 'thai_public', country: 'TH' },
  { date: '2025-08-12', name: "Mother's Day", type: 'thai_public', country: 'TH' },
  { date: '2025-10-13', name: 'King Bhumibol Memorial Day', type: 'thai_public', country: 'TH' },
  { date: '2025-10-23', name: 'Chulalongkorn Day', type: 'thai_public', country: 'TH' },
  { date: '2025-10-31', name: 'Halloween', type: 'international_observance', country: 'TH' },
  { date: '2025-12-05', name: "Father's Day", type: 'thai_public', country: 'TH' },
  { date: '2025-12-10', name: 'Constitution Day', type: 'thai_public', country: 'TH' },
  { date: '2025-12-25', name: 'Christmas Day', type: 'international', country: 'TH' },
  { date: '2025-12-31', name: "New Year's Eve", type: 'international', country: 'TH' },

  // 2026 Holidays (Thailand - Updated & Accurate)
  { date: '2026-01-01', name: "New Year's Day", type: 'international', country: 'TH' },
  { date: '2026-03-03', name: 'Makha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2026-04-06', name: 'Chakri Memorial Day', type: 'thai_public', country: 'TH' },
  { date: '2026-04-13', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2026-04-14', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2026-04-15', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2026-05-01', name: 'National Labour Day', type: 'thai_public', country: 'TH' },
  { date: '2026-05-04', name: 'Coronation Day', type: 'thai_public', country: 'TH' },
  { date: '2026-05-31', name: 'Visakha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2026-06-01', name: 'Visakha Bucha Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2026-06-03', name: "HM Queen Suthida's Birthday", type: 'thai_public', country: 'TH' },
  { date: '2026-07-28', name: "HM King Vajiralongkorn's Birthday", type: 'thai_public', country: 'TH' },
  { date: '2026-07-29', name: 'Asalha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2026-07-30', name: 'Buddhist Lent Day', type: 'thai_public', country: 'TH' },
  { date: '2026-08-12', name: "HM Queen Sirikit's Birthday / Mother's Day", type: 'thai_public', country: 'TH' },
  { date: '2026-10-13', name: 'King Bhumibol Memorial Day', type: 'thai_public', country: 'TH' },
  { date: '2026-10-23', name: 'Chulalongkorn Day', type: 'thai_public', country: 'TH' },
  { date: '2026-10-31', name: 'Halloween', type: 'international_observance', country: 'TH' },
  { date: '2026-12-05', name: "King Bhumibol's Birthday / Father's Day", type: 'thai_public', country: 'TH' },
  { date: '2026-12-07', name: "Father's Day (Observed)", type: 'thai_public', country: 'TH' },
  { date: '2026-12-10', name: 'Constitution Day', type: 'thai_public', country: 'TH' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'international', country: 'TH' },
  { date: '2026-12-31', name: "New Year's Eve", type: 'international', country: 'TH' },

  // 2027 Holidays (Thailand)
  { date: '2027-01-01', name: "New Year's Day", type: 'international', country: 'TH' },
  { date: '2027-02-21', name: 'Makha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2027-02-22', name: 'Makha Bucha Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2027-04-06', name: 'Chakri Memorial Day', type: 'thai_public', country: 'TH' },
  { date: '2027-04-13', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2027-04-14', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2027-04-15', name: 'Songkran Festival', type: 'thai_public', country: 'TH' },
  { date: '2027-05-01', name: 'Labour Day', type: 'thai_public', country: 'TH' },
  { date: '2027-05-04', name: 'Coronation Day', type: 'thai_public', country: 'TH' },
  { date: '2027-05-20', name: 'Visakha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2027-06-03', name: "HM Queen Suthida's Birthday", type: 'thai_public', country: 'TH' },
  { date: '2027-07-18', name: 'Asalha Bucha Day', type: 'thai_public', country: 'TH' },
  { date: '2027-07-19', name: 'Asalha Bucha Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2027-07-28', name: "HM King Vajiralongkorn's Birthday", type: 'thai_public', country: 'TH' },
  { date: '2027-08-12', name: "Mother's Day", type: 'thai_public', country: 'TH' },
  { date: '2027-10-13', name: 'King Bhumibol Memorial Day', type: 'thai_public', country: 'TH' },
  { date: '2027-10-23', name: 'Chulalongkorn Day', type: 'thai_public', country: 'TH' },
  { date: '2027-10-25', name: 'Chulalongkorn Day (Observed)', type: 'thai_public', country: 'TH' },
  { date: '2027-12-05', name: "Father's Day", type: 'thai_public', country: 'TH' },
  { date: '2027-12-06', name: "Father's Day (Observed)", type: 'thai_public', country: 'TH' },
  { date: '2027-12-10', name: 'Constitution Day', type: 'thai_public', country: 'TH' },
  { date: '2027-12-25', name: 'Christmas Day', type: 'international', country: 'TH' },
  { date: '2027-12-31', name: "New Year's Eve", type: 'international', country: 'TH' },

  // USA Holidays (2025 & 2026)
  { date: '2025-01-01', name: "New Year's Day", type: 'public', country: 'US' },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day', type: 'public', country: 'US' },
  { date: '2025-02-17', name: "Presidents' Day", type: 'public', country: 'US' },
  { date: '2025-05-26', name: 'Memorial Day', type: 'public', country: 'US' },
  { date: '2025-06-19', name: 'Juneteenth National Independence Day', type: 'public', country: 'US' },
  { date: '2025-07-04', name: 'Independence Day', type: 'public', country: 'US' },
  { date: '2025-09-01', name: 'Labor Day', type: 'public', country: 'US' },
  { date: '2025-10-13', name: 'Columbus Day', type: 'public', country: 'US' },
  { date: '2025-11-11', name: 'Veterans Day', type: 'public', country: 'US' },
  { date: '2025-11-27', name: 'Thanksgiving Day', type: 'public', country: 'US' },
  { date: '2025-12-25', name: 'Christmas Day', type: 'public', country: 'US' },

  { date: '2026-01-01', name: "New Year's Day", type: 'public', country: 'US' },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', type: 'public', country: 'US' },
  { date: '2026-02-16', name: "Presidents' Day", type: 'public', country: 'US' },
  { date: '2026-05-25', name: 'Memorial Day', type: 'public', country: 'US' },
  { date: '2026-06-19', name: 'Juneteenth National Independence Day', type: 'public', country: 'US' },
  { date: '2026-07-04', name: 'Independence Day', type: 'public', country: 'US' },
  { date: '2026-09-07', name: 'Labor Day', type: 'public', country: 'US' },
  { date: '2026-10-12', name: 'Columbus Day', type: 'public', country: 'US' },
  { date: '2026-11-11', name: 'Veterans Day', type: 'public', country: 'US' },
  { date: '2026-11-26', name: 'Thanksgiving Day', type: 'public', country: 'US' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'public', country: 'US' },
];

export type ApiHolidayRaw = { date: string; name: string; localName: string; types: string[] };
export type HolidayEntry = { name: string; localName?: string };

// ─── Fetch Public Holidays (API + Cache + Fallback) ─────────────────────────
export async function fetchPublicHolidays(year: number, countryCode: string): Promise<Record<string, HolidayEntry[]>> {
  const cacheKey = `ll_holidays_${year}_${countryCode}`;

  try {
    const cached = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    if (cached) {
      const parsed: ApiHolidayRaw[] = JSON.parse(cached);
      const converted: Record<string, HolidayEntry[]> = {};
      parsed.forEach(h => {
        if (!converted[h.date]) converted[h.date] = [];
        converted[h.date].push({ name: h.name, localName: h.localName });
      });
      return converted;
    }
  } catch {}

  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiHolidayRaw[] = await res.json();

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch {}

    const converted: Record<string, HolidayEntry[]> = {};
    data.forEach(h => {
      if (!converted[h.date]) converted[h.date] = [];
      converted[h.date].push({ name: h.name, localName: h.localName });
    });
    return converted;
  } catch (err) {
    console.warn(`Holidays API failed for ${countryCode}-${year}, utilizing fallback dataset:`, err);
    // Fall back to local hardcoded database
    const converted: Record<string, HolidayEntry[]> = {};
    THAI_AND_INTERNATIONAL_HOLIDAYS.forEach(h => {
      const [hYear] = h.date.split('-').map(Number);
      const matchesCountry = h.country ? h.country === countryCode : (countryCode === 'TH');
      if (hYear === year && matchesCountry) {
        if (!converted[h.date]) converted[h.date] = [];
        converted[h.date].push({ name: h.name });
      }
    });
    return converted;
  }
}

// ─── Detect User Country ────────────────────────────────────────────────────
export async function detectUserCountry(): Promise<{ countryCode: string; timezone: string }> {
  const browserTimezone = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'Asia/Bangkok';

  let detectedCountry = TIMEZONE_TO_COUNTRY[browserTimezone] || 'TH';

  try {
    const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.countryCode) {
        detectedCountry = data.countryCode;
      }
    }
  } catch {}

  return { countryCode: detectedCountry, timezone: browserTimezone };
}

// ─── React Hook: useCountryHolidays ──────────────────────────────────────────
export function useCountryHolidays(targetYear?: number) {
  const [currentYear, setCurrentYear] = useState<number>(targetYear || new Date().getFullYear());
  const [countryCode, setCountryCode] = useState<string>('TH');
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  const [holidays, setHolidays] = useState<Record<string, HolidayEntry[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetected, setIsDetected] = useState<boolean>(false);

  useEffect(() => {
    if (targetYear && targetYear !== currentYear) {
      setCurrentYear(targetYear);
    }
  }, [targetYear, currentYear]);

  // Initial Country Detection
  useEffect(() => {
    detectUserCountry().then(({ countryCode: detected, timezone }) => {
      setCountryCode(detected);
      setUserTimezone(timezone);
      setIsDetected(true);
    });
  }, []);

  // Fetch Holidays when Year or CountryCode changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchPublicHolidays(currentYear, countryCode).then(data => {
      if (isMounted) {
        setHolidays(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentYear, countryCode]);

  const countryInfo = COUNTRY_INFO[countryCode] || { name: countryCode, flag: '🌐' };

  return {
    countryCode,
    setCountryCode,
    countryInfo,
    supportedCountries: SUPPORTED_COUNTRIES,
    holidaysMap: holidays,
    isLoading,
    isDetected,
    userTimezone,
    currentYear,
  };
}
