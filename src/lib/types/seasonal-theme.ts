export type SeasonalThemeId = 
  | 'default'
  | 'halloween'
  | 'christmas'
  | 'new_year'
  | 'songkran'
  | 'lunar_new_year'
  | 'valentine';

export interface SeasonalThemeDefinition {
  id: SeasonalThemeId;
  name: string;
  emoji: string;
  subtitle: string;
  defaultBadgeText: string;
  defaultCountries: string[]; // e.g. ['TH'] for Songkran, ['*'] for worldwide
  particleType: 'none' | 'snow' | 'water_splashes' | 'halloween_bats' | 'confetti' | 'hearts' | 'lanterns';
  accentColor: string; // Tailwind color or hex
  glowColor: string; // rgba or hex
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  greetingText: string;
}

export interface SeasonalThemeSettings {
  enabled: boolean;
  activeThemeId: SeasonalThemeId;
  targetScope: 'worldwide' | 'country_specific';
  targetCountries: string[]; // ISO country codes, e.g. ['TH']
  customBadgeText?: string;
  customBannerImageUrl?: string;
  customHeadline?: string;
  customMessage?: string;
  floatingParticles: boolean;
  headerBadge: boolean;
  ambientGlow: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export const SEASONAL_THEME_PRESETS: Record<SeasonalThemeId, SeasonalThemeDefinition> = {
  default: {
    id: 'default',
    name: 'Cosmic Universe (Default)',
    emoji: '🌌',
    subtitle: 'Standard clean deep-space celestial design',
    defaultBadgeText: '🌌 Welcome to LingoLandVerse',
    defaultCountries: ['*'],
    particleType: 'none',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'border-cyan-500/20',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-200 border-cyan-400/30',
    greetingText: 'Explore the Language Universe',
  },
  halloween: {
    id: 'halloween',
    name: 'Halloween Spooktacular',
    emoji: '🎃',
    subtitle: 'Spooky pumpkins, floating bats & eerie violet accents',
    defaultBadgeText: '🎃 Happy Halloween! Spooky Learning Season',
    defaultCountries: ['*'],
    particleType: 'halloween_bats',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.25)',
    borderColor: 'border-orange-500/40',
    badgeBg: 'bg-orange-950/90',
    badgeText: 'text-orange-200 border-orange-500/40 shadow-orange-500/20',
    greetingText: '🎃 Treat yourself to new language skills this Halloween!',
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas & Winter Holiday',
    emoji: '🎄',
    subtitle: 'Gentle falling snowflakes, festive emerald & ruby glow',
    defaultBadgeText: '❄️ Merry Christmas & Happy Holidays!',
    defaultCountries: ['*'],
    particleType: 'snow',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.22)',
    borderColor: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/90',
    badgeText: 'text-emerald-200 border-emerald-500/40 shadow-emerald-500/20',
    greetingText: '🎄 Season\'s Greetings from LingoLandVerse!',
  },
  new_year: {
    id: 'new_year',
    name: 'New Year Celebration',
    emoji: '✨',
    subtitle: 'Golden champagne sparkles, festive countdown confetti',
    defaultBadgeText: '✨ Happy New Year 2027! New Goals & New Words',
    defaultCountries: ['*'],
    particleType: 'confetti',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.25)',
    borderColor: 'border-yellow-500/40',
    badgeBg: 'bg-amber-950/90',
    badgeText: 'text-amber-200 border-amber-500/40 shadow-yellow-500/20',
    greetingText: '✨ Celebrate the New Year with new language milestones!',
  },
  songkran: {
    id: 'songkran',
    name: 'Songkran Water Festival (Thailand)',
    emoji: '💦',
    subtitle: 'Water splash particles, tropical turquoise aqua accents',
    defaultBadgeText: '💦 สุขสันต์วันสงกรานต์! Happy Songkran Festival',
    defaultCountries: ['TH'],
    particleType: 'water_splashes',
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    borderColor: 'border-cyan-400/50',
    badgeBg: 'bg-cyan-950/90',
    badgeText: 'text-cyan-200 border-cyan-400/40 shadow-cyan-500/20',
    greetingText: '💦 สุขสันต์วันสงกรานต์! Splash into language learning!',
  },
  lunar_new_year: {
    id: 'lunar_new_year',
    name: 'Lunar New Year / Spring Festival',
    emoji: '🧧',
    subtitle: 'Imperial red lanterns & auspicious golden prosperity glow',
    defaultBadgeText: '🧧 新年快乐! Happy Lunar New Year',
    defaultCountries: ['CN', 'TW', 'HK', 'SG', 'MY', 'VN', 'TH'],
    particleType: 'lanterns',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: 'border-red-500/40',
    badgeBg: 'bg-red-950/90',
    badgeText: 'text-red-200 border-red-500/40 shadow-red-500/20',
    greetingText: '🧧 Wishing you prosperity and joy this Spring Festival!',
  },
  valentine: {
    id: 'valentine',
    name: 'Valentine\'s & Friendship Day',
    emoji: '💖',
    subtitle: 'Romantic rose glow & gentle floating heart sparkles',
    defaultBadgeText: '💖 Happy Valentine\'s Day! Season of Love & Words',
    defaultCountries: ['*'],
    particleType: 'hearts',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    borderColor: 'border-pink-500/40',
    badgeBg: 'bg-pink-950/90',
    badgeText: 'text-pink-200 border-pink-500/40 shadow-pink-500/20',
    greetingText: '💖 Spread kindness and love through the gift of language!',
  },
};

export const DEFAULT_SEASONAL_SETTINGS: SeasonalThemeSettings = {
  enabled: false,
  activeThemeId: 'default',
  targetScope: 'worldwide',
  targetCountries: ['*'],
  floatingParticles: true,
  headerBadge: true,
  ambientGlow: true,
};
