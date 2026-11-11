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
  // Americas
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'America/Honolulu': 'US', 'America/Detroit': 'US', 'America/Indiana/Indianapolis': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Montreal': 'CA',
  'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX',
  // Pacific / Oceania
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Australia/Darwin': 'AU',
  'Pacific/Auckland': 'NZ', 'Pacific/Fiji': 'FJ',
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

export interface StaticHolidayItem {
  date: string; // YYYY-MM-DD
  name: string;
  localName?: string;
  type: string;
  country: string; // ISO 2-letter code
}

// ─── Static Verified Holidays Dataset (Strictly Country-Tagged) ─────────────
export const THAI_AND_INTERNATIONAL_HOLIDAYS: StaticHolidayItem[] = [
  // ── 2024 Thailand ──
  { date: '2024-01-01', name: "New Year's Day", localName: 'วันขึ้นปีใหม่', type: 'international', country: 'TH' },
  { date: '2024-02-24', name: 'Makha Bucha Day', localName: 'วันมาฆบูชา', type: 'thai_public', country: 'TH' },
  { date: '2024-04-06', name: 'Chakri Memorial Day', localName: 'วันจักรี', type: 'thai_public', country: 'TH' },
  { date: '2024-04-08', name: 'Chakri Day (Observed)', localName: 'วันหยุดชดเชยวันจักรี', type: 'thai_public', country: 'TH' },
  { date: '2024-04-13', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2024-04-14', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2024-04-15', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2024-04-16', name: 'Songkran Festival (Observed)', localName: 'วันหยุดชดเชยวันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2024-05-01', name: 'National Labour Day', localName: 'วันแรงงานแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2024-05-04', name: 'Coronation Day', localName: 'วันฉัตรมงคล', type: 'thai_public', country: 'TH' },
  { date: '2024-05-06', name: 'Coronation Day (Observed)', localName: 'วันหยุดชดเชยวันฉัตรมงคล', type: 'thai_public', country: 'TH' },
  { date: '2024-05-22', name: 'Visakha Bucha Day', localName: 'วันวิสาขบูชา', type: 'thai_public', country: 'TH' },
  { date: '2024-06-03', name: "HM Queen Suthida's Birthday", localName: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี', type: 'thai_public', country: 'TH' },
  { date: '2024-07-20', name: 'Asalha Bucha Day', localName: 'วันอาสาฬหบูชา', type: 'thai_public', country: 'TH' },
  { date: '2024-07-22', name: 'Asalha Bucha Day (Observed)', localName: 'วันหยุดชดเชยวันอาสาฬหบูชา', type: 'thai_public', country: 'TH' },
  { date: '2024-07-28', name: "HM King Vajiralongkorn's Birthday", localName: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', type: 'thai_public', country: 'TH' },
  { date: '2024-07-29', name: "King's Birthday (Observed)", localName: 'วันหยุดชดเชยวันเฉลิมพระชนมพรรษา', type: 'thai_public', country: 'TH' },
  { date: '2024-08-12', name: "HM Queen Sirikit's Birthday / Mother's Day", localName: 'วันแม่แห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2024-10-13', name: 'King Bhumibol Memorial Day', localName: 'วันนวมินทรมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2024-10-14', name: 'King Bhumibol Memorial Day (Observed)', localName: 'วันหยุดชดเชยวันนวมินทรมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2024-10-23', name: 'King Chulalongkorn Day', localName: 'วันปิยมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2024-11-15', name: 'Loy Krathong Festival', localName: 'วันลอยกระทง', type: 'thai_observance', country: 'TH' },
  { date: '2024-12-05', name: "King Bhumibol's Birthday / Father's Day", localName: 'วันพ่อแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2024-12-10', name: 'Constitution Day', localName: 'วันรัฐธรรมนูญ', type: 'thai_public', country: 'TH' },
  { date: '2024-12-31', name: "New Year's Eve", localName: 'วันสิ้นปี', type: 'international', country: 'TH' },

  // ── 2025 Thailand ──
  { date: '2025-01-01', name: "New Year's Day", localName: 'วันขึ้นปีใหม่', type: 'international', country: 'TH' },
  { date: '2025-02-12', name: 'Makha Bucha Day', localName: 'วันมาฆบูชา', type: 'thai_public', country: 'TH' },
  { date: '2025-04-06', name: 'Chakri Memorial Day', localName: 'วันจักรี', type: 'thai_public', country: 'TH' },
  { date: '2025-04-07', name: 'Chakri Day (Observed)', localName: 'วันหยุดชดเชยวันจักรี', type: 'thai_public', country: 'TH' },
  { date: '2025-04-13', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2025-04-14', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2025-04-15', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2025-04-16', name: 'Songkran Festival (Observed)', localName: 'วันหยุดชดเชยวันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2025-05-01', name: 'National Labour Day', localName: 'วันแรงงานแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2025-05-04', name: 'Coronation Day', localName: 'วันฉัตรมงคล', type: 'thai_public', country: 'TH' },
  { date: '2025-05-05', name: 'Coronation Day (Observed)', localName: 'วันหยุดชดเชยวันฉัตรมงคล', type: 'thai_public', country: 'TH' },
  { date: '2025-05-11', name: 'Visakha Bucha Day', localName: 'วันวิสาขบูชา', type: 'thai_public', country: 'TH' },
  { date: '2025-05-12', name: 'Visakha Bucha Day (Observed)', localName: 'วันหยุดชดเชยวันวิสาขบูชา', type: 'thai_public', country: 'TH' },
  { date: '2025-06-03', name: "HM Queen Suthida's Birthday", localName: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี', type: 'thai_public', country: 'TH' },
  { date: '2025-07-10', name: 'Asalha Bucha Day', localName: 'วันอาสาฬหบูชา', type: 'thai_public', country: 'TH' },
  { date: '2025-07-11', name: 'Buddhist Lent Day', localName: 'วันเข้าพรรษา', type: 'thai_public', country: 'TH' },
  { date: '2025-07-28', name: "HM King Vajiralongkorn's Birthday", localName: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', type: 'thai_public', country: 'TH' },
  { date: '2025-08-12', name: "HM Queen Sirikit's Birthday / Mother's Day", localName: 'วันแม่แห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2025-10-13', name: 'King Bhumibol Memorial Day', localName: 'วันนวมินทรมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2025-10-23', name: 'King Chulalongkorn Day', localName: 'วันปิยมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2025-11-05', name: 'Loy Krathong Festival', localName: 'วันลอยกระทง', type: 'thai_observance', country: 'TH' },
  { date: '2025-12-05', name: "King Bhumibol's Birthday / Father's Day", localName: 'วันพ่อแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2025-12-10', name: 'Constitution Day', localName: 'วันรัฐธรรมนูญ', type: 'thai_public', country: 'TH' },
  { date: '2025-12-31', name: "New Year's Eve", localName: 'วันสิ้นปี', type: 'international', country: 'TH' },

  // ── 2026 Thailand (Official & Cultural) ──
  { date: '2026-01-01', name: "New Year's Day", localName: 'วันขึ้นปีใหม่', type: 'international', country: 'TH' },
  { date: '2026-03-03', name: 'Makha Bucha Day', localName: 'วันมาฆบูชา', type: 'thai_public', country: 'TH' },
  { date: '2026-04-06', name: 'Chakri Memorial Day', localName: 'วันจักรี', type: 'thai_public', country: 'TH' },
  { date: '2026-04-13', name: 'Songkran Festival Day 1', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2026-04-14', name: 'Songkran Festival Day 2', localName: 'วันสงกรานต์ / วันครอบครัว', type: 'thai_public', country: 'TH' },
  { date: '2026-04-15', name: 'Songkran Festival Day 3', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2026-05-01', name: 'National Labour Day', localName: 'วันแรงงานแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2026-05-04', name: 'Coronation Day', localName: 'วันฉัตรมงคล', type: 'thai_public', country: 'TH' },
  { date: '2026-05-31', name: 'Visakha Bucha Day', localName: 'วันวิสาขบูชา', type: 'thai_public', country: 'TH' },
  { date: '2026-06-01', name: 'Visakha Bucha Day (Observed)', localName: 'วันหยุดชดเชยวันวิสาขบูชา', type: 'thai_public', country: 'TH' },
  { date: '2026-06-03', name: "HM Queen Suthida's Birthday", localName: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี', type: 'thai_public', country: 'TH' },
  { date: '2026-07-28', name: "HM King Vajiralongkorn's Birthday", localName: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', type: 'thai_public', country: 'TH' },
  { date: '2026-07-29', name: 'Asalha Bucha Day', localName: 'วันอาสาฬหบูชา', type: 'thai_public', country: 'TH' },
  { date: '2026-07-30', name: 'Buddhist Lent Day', localName: 'วันเข้าพรรษา', type: 'thai_public', country: 'TH' },
  { date: '2026-08-12', name: "HM Queen Sirikit The Queen Mother's Birthday / Mother's Day", localName: 'วันแม่แห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2026-10-13', name: 'King Bhumibol Adulyadej The Great Memorial Day', localName: 'วันนวมินทรมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2026-10-23', name: 'King Chulalongkorn Memorial Day', localName: 'วันปิยมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2026-11-24', name: 'Loy Krathong Festival', localName: 'วันลอยกระทง', type: 'thai_observance', country: 'TH' },
  { date: '2026-12-05', name: "King Bhumibol's Birthday / Father's Day", localName: 'วันพ่อแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2026-12-07', name: "Father's Day (Observed)", localName: 'วันหยุดชดเชยวันพ่อแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2026-12-10', name: 'Constitution Day', localName: 'วันรัฐธรรมนูญ', type: 'thai_public', country: 'TH' },
  { date: '2026-12-31', name: "New Year's Eve", localName: 'วันสิ้นปี', type: 'international', country: 'TH' },

  // ── 2027 Thailand ──
  { date: '2027-01-01', name: "New Year's Day", localName: 'วันขึ้นปีใหม่', type: 'international', country: 'TH' },
  { date: '2027-02-21', name: 'Makha Bucha Day', localName: 'วันมาฆบูชา', type: 'thai_public', country: 'TH' },
  { date: '2027-02-22', name: 'Makha Bucha Day (Observed)', localName: 'วันหยุดชดเชยวันมาฆบูชา', type: 'thai_public', country: 'TH' },
  { date: '2027-04-06', name: 'Chakri Memorial Day', localName: 'วันจักรี', type: 'thai_public', country: 'TH' },
  { date: '2027-04-13', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2027-04-14', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2027-04-15', name: 'Songkran Festival', localName: 'วันสงกรานต์', type: 'thai_public', country: 'TH' },
  { date: '2027-05-01', name: 'National Labour Day', localName: 'วันแรงงานแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2027-05-04', name: 'Coronation Day', localName: 'วันฉัตรมงคล', type: 'thai_public', country: 'TH' },
  { date: '2027-05-20', name: 'Visakha Bucha Day', localName: 'วันวิสาขบูชา', type: 'thai_public', country: 'TH' },
  { date: '2027-06-03', name: "HM Queen Suthida's Birthday", localName: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี', type: 'thai_public', country: 'TH' },
  { date: '2027-07-18', name: 'Asalha Bucha Day', localName: 'วันอาสาฬหบูชา', type: 'thai_public', country: 'TH' },
  { date: '2027-07-19', name: 'Asalha Bucha Day (Observed)', localName: 'วันหยุดชดเชยวันอาสาฬหบูชา', type: 'thai_public', country: 'TH' },
  { date: '2027-07-28', name: "HM King Vajiralongkorn's Birthday", localName: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', type: 'thai_public', country: 'TH' },
  { date: '2027-08-12', name: "HM Queen Sirikit's Birthday / Mother's Day", localName: 'วันแม่แห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2027-10-13', name: 'King Bhumibol Memorial Day', localName: 'วันนวมินทรมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2027-10-23', name: 'King Chulalongkorn Day', localName: 'วันปิยมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2027-10-25', name: 'Chulalongkorn Day (Observed)', localName: 'วันหยุดชดเชยวันปิยมหาราช', type: 'thai_public', country: 'TH' },
  { date: '2027-11-13', name: 'Loy Krathong Festival', localName: 'วันลอยกระทง', type: 'thai_observance', country: 'TH' },
  { date: '2027-12-05', name: "King Bhumibol's Birthday / Father's Day", localName: 'วันพ่อแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2027-12-06', name: "Father's Day (Observed)", localName: 'วันหยุดชดเชยวันพ่อแห่งชาติ', type: 'thai_public', country: 'TH' },
  { date: '2027-12-10', name: 'Constitution Day', localName: 'วันรัฐธรรมนูญ', type: 'thai_public', country: 'TH' },
  { date: '2027-12-31', name: "New Year's Eve", localName: 'วันสิ้นปี', type: 'international', country: 'TH' },

  // ── United States (US Only) ──
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

  // ── United Kingdom (GB Only) ──
  { date: '2026-01-01', name: "New Year's Day", type: 'public', country: 'GB' },
  { date: '2026-04-03', name: 'Good Friday', type: 'public', country: 'GB' },
  { date: '2026-04-06', name: 'Easter Monday', type: 'public', country: 'GB' },
  { date: '2026-05-04', name: 'Early May Bank Holiday', type: 'public', country: 'GB' },
  { date: '2026-05-25', name: 'Spring Bank Holiday', type: 'public', country: 'GB' },
  { date: '2026-08-31', name: 'Summer Bank Holiday', type: 'public', country: 'GB' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'public', country: 'GB' },
  { date: '2026-12-28', name: 'Boxing Day (Observed)', type: 'public', country: 'GB' },

  // ── Japan (JP Only) ──
  { date: '2026-01-01', name: "New Year's Day", localName: '元日', type: 'public', country: 'JP' },
  { date: '2026-01-12', name: 'Coming of Age Day', localName: '成人の日', type: 'public', country: 'JP' },
  { date: '2026-02-11', name: 'National Foundation Day', localName: '建国記念の日', type: 'public', country: 'JP' },
  { date: '2026-02-23', name: "Emperor's Birthday", localName: '天皇誕生日', type: 'public', country: 'JP' },
  { date: '2026-03-20', name: 'Vernal Equinox Day', localName: '春分の日', type: 'public', country: 'JP' },
  { date: '2026-04-29', name: 'Showa Day', localName: '昭和の日', type: 'public', country: 'JP' },
  { date: '2026-05-03', name: 'Constitution Memorial Day', localName: '憲法記念日', type: 'public', country: 'JP' },
  { date: '2026-05-04', name: 'Greenery Day', localName: 'みどりの日', type: 'public', country: 'JP' },
  { date: '2026-05-05', name: "Children's Day", localName: 'こどもの日', type: 'public', country: 'JP' },
  { date: '2026-07-20', name: 'Marine Day', localName: '海の日', type: 'public', country: 'JP' },
  { date: '2026-08-11', name: 'Mountain Day', localName: '山の日', type: 'public', country: 'JP' },
  { date: '2026-09-21', name: 'Respect for the Aged Day', localName: '敬老の日', type: 'public', country: 'JP' },
  { date: '2026-09-23', name: 'Autumnal Equinox Day', localName: '秋分の日', type: 'public', country: 'JP' },
  { date: '2026-10-12', name: 'Sports Day', localName: 'スポーツの日', type: 'public', country: 'JP' },
  { date: '2026-11-03', name: 'Culture Day', localName: '文化の日', type: 'public', country: 'JP' },
  { date: '2026-11-23', name: 'Labor Thanksgiving Day', localName: '勤労感謝の日', type: 'public', country: 'JP' },

  // ── Philippines (PH Only) ──
  { date: '2026-01-01', name: "New Year's Day", type: 'public', country: 'PH' },
  { date: '2026-04-02', name: 'Maundy Thursday', type: 'public', country: 'PH' },
  { date: '2026-04-03', name: 'Good Friday', type: 'public', country: 'PH' },
  { date: '2026-04-09', name: 'Araw ng Kagitingan', type: 'public', country: 'PH' },
  { date: '2026-05-01', name: 'Labor Day', type: 'public', country: 'PH' },
  { date: '2026-06-12', name: 'Independence Day', type: 'public', country: 'PH' },
  { date: '2026-08-31', name: 'National Heroes Day', type: 'public', country: 'PH' },
  { date: '2026-11-30', name: 'Bonifacio Day', type: 'public', country: 'PH' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'public', country: 'PH' },
  { date: '2026-12-30', name: 'Rizal Day', type: 'public', country: 'PH' },
];

export type ApiHolidayRaw = { date: string; name: string; localName: string; types?: string[] };
export type HolidayEntry = { name: string; localName?: string };

// ─── Fetch Public Holidays (Strictly Location-Isolated) ──────────────────────
export async function fetchPublicHolidays(year: number, countryCode: string): Promise<Record<string, HolidayEntry[]>> {
  const normCode = (countryCode || 'TH').toUpperCase();
  const cacheKey = `ll_holidays_${year}_${normCode}`;

  // 1. Session Storage Cache check
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

  // 2. If Thailand (TH), strictly use verified Thai official dataset (Nager.Date has no TH support)
  if (normCode === 'TH') {
    const converted: Record<string, HolidayEntry[]> = {};
    THAI_AND_INTERNATIONAL_HOLIDAYS.forEach(h => {
      const [hYear] = h.date.split('-').map(Number);
      if (hYear === year && h.country === 'TH') {
        if (!converted[h.date]) converted[h.date] = [];
        converted[h.date].push({ name: h.name, localName: h.localName || h.name });
      }
    });

    try {
      if (typeof sessionStorage !== 'undefined') {
        const payload = Object.entries(converted).flatMap(([date, entries]) =>
          entries.map(e => ({ date, name: e.name, localName: e.localName }))
        );
        sessionStorage.setItem(cacheKey, JSON.stringify(payload));
      }
    } catch {}

    return converted;
  }

  // 3. For other countries, attempt Nager.Date API
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${normCode}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiHolidayRaw[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty holiday list');

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
    console.warn(`Holidays API unavailable for ${normCode}-${year}, applying country-specific fallback:`, err);
    // Strict fallback: ONLY holidays that match normCode exactly!
    const converted: Record<string, HolidayEntry[]> = {};
    THAI_AND_INTERNATIONAL_HOLIDAYS.forEach(h => {
      const [hYear] = h.date.split('-').map(Number);
      if (hYear === year && h.country === normCode) {
        if (!converted[h.date]) converted[h.date] = [];
        converted[h.date].push({ name: h.name, localName: h.localName || h.name });
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
    const res = await fetch('/api/geo', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.country && data.country !== 'UNKNOWN') {
        detectedCountry = data.country.toUpperCase();
      }
    }
  } catch {}

  return { countryCode: detectedCountry, timezone: browserTimezone };
}

// ─── React Hook: useCountryHolidays ──────────────────────────────────────────
export function useCountryHolidays(targetYear?: number) {
  const [currentYear, setCurrentYear] = useState<number>(targetYear || new Date().getFullYear());
  const [countryCode, setCountryCode] = useState<string>('TH');
  const [userTimezone, setUserTimezone] = useState<string>('Asia/Bangkok');
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
