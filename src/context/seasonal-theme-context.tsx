'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, type FirestoreError } from 'firebase/firestore';
import { useUserCountry } from '@/hooks/use-user-country';
import {
  SeasonalThemeSettings,
  SeasonalThemeDefinition,
  SeasonalThemeId,
  DEFAULT_SEASONAL_SETTINGS,
  SEASONAL_THEME_PRESETS,
} from '@/lib/types/seasonal-theme';

interface SeasonalThemeContextType {
  settings: SeasonalThemeSettings;
  activeTheme: SeasonalThemeDefinition;
  isThemeActiveForUser: boolean;
  userCountry: string;
  isGeoLoading: boolean;
  isDismissed: boolean;
  toggleDismiss: () => void;
  adminPreviewThemeId: SeasonalThemeId | null;
  setAdminPreviewThemeId: (themeId: SeasonalThemeId | null) => void;
}

const SeasonalThemeContext = createContext<SeasonalThemeContextType>({
  settings: DEFAULT_SEASONAL_SETTINGS,
  activeTheme: SEASONAL_THEME_PRESETS.default,
  isThemeActiveForUser: false,
  userCountry: 'UNKNOWN',
  isGeoLoading: true,
  isDismissed: false,
  toggleDismiss: () => {},
  adminPreviewThemeId: null,
  setAdminPreviewThemeId: () => {},
});

const PARTICLES_DISMISS_KEY = 'lingoland_seasonal_particles_dismissed';

export function SeasonalThemeProvider({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  const { country: userCountry, isLoading: isGeoLoading } = useUserCountry();
  const [settings, setSettings] = useState<SeasonalThemeSettings>(DEFAULT_SEASONAL_SETTINGS);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [adminPreviewThemeId, setAdminPreviewThemeId] = useState<SeasonalThemeId | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PARTICLES_DISMISS_KEY);
      if (stored === 'true') {
        setIsDismissed(true);
      }
    } catch (e) {}
  }, []);

  const toggleDismiss = () => {
    setIsDismissed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PARTICLES_DISMISS_KEY, String(next));
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    if (!firestore) return;

    const themeDocRef = doc(firestore, 'announcements', 'seasonal_theme');
    const unsubscribe = onSnapshot(
      themeDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<SeasonalThemeSettings>;
          setSettings({
            enabled: data.enabled ?? false,
            activeThemeId: data.activeThemeId ?? 'default',
            targetScope: data.targetScope ?? 'worldwide',
            targetCountries: Array.isArray(data.targetCountries) ? data.targetCountries : ['*'],
            customBadgeText: data.customBadgeText,
            customBannerImageUrl: data.customBannerImageUrl,
            customHeadline: data.customHeadline,
            customMessage: data.customMessage,
            floatingParticles: data.floatingParticles ?? true,
            headerBadge: data.headerBadge ?? true,
            ambientGlow: data.ambientGlow ?? true,
            includeLoginPage: data.includeLoginPage ?? true,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          });
        } else {
          setSettings(DEFAULT_SEASONAL_SETTINGS);
        }
      },
      (error: FirestoreError) => {
        console.warn('Seasonal theme Firestore listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  const { activeTheme, isThemeActiveForUser } = useMemo(() => {
    if (adminPreviewThemeId && adminPreviewThemeId !== 'default') {
      const previewPreset = SEASONAL_THEME_PRESETS[adminPreviewThemeId] || SEASONAL_THEME_PRESETS.default;
      return {
        activeTheme: previewPreset,
        isThemeActiveForUser: true,
      };
    }

    if (!settings.enabled || settings.activeThemeId === 'default') {
      return {
        activeTheme: SEASONAL_THEME_PRESETS.default,
        isThemeActiveForUser: false,
      };
    }

    let matchesCountry = false;
    if (settings.targetScope === 'worldwide') {
      matchesCountry = true;
    } else if (settings.targetScope === 'country_specific') {
      const targets = settings.targetCountries.map((c) => c.trim().toUpperCase());
      if (targets.includes('*') || targets.includes('ALL')) {
        matchesCountry = true;
      } else if (userCountry && userCountry !== 'UNKNOWN') {
        matchesCountry = targets.includes(userCountry.toUpperCase());
      } else {
        matchesCountry = false;
      }
    }

    if (matchesCountry) {
      const preset = SEASONAL_THEME_PRESETS[settings.activeThemeId] || SEASONAL_THEME_PRESETS.default;
      return {
        activeTheme: preset,
        isThemeActiveForUser: true,
      };
    }

    return {
      activeTheme: SEASONAL_THEME_PRESETS.default,
      isThemeActiveForUser: false,
    };
  }, [settings, userCountry, adminPreviewThemeId]);

  return (
    <SeasonalThemeContext.Provider
      value={{
        settings,
        activeTheme,
        isThemeActiveForUser,
        userCountry,
        isGeoLoading,
        isDismissed,
        toggleDismiss,
        adminPreviewThemeId,
        setAdminPreviewThemeId,
      }}
    >
      {children}
    </SeasonalThemeContext.Provider>
  );
}

export function useSeasonalTheme() {
  return useContext(SeasonalThemeContext);
}
