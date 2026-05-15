'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/apiClient';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  adminEmail: string;
  defaultLanguage: string;
  defaultEra: string;
  booksPerPage: number;
  mapStyle: string;
  displayTheme: 'system' | 'light' | 'dark';
  fontFamily: string;
  fontScale: number;
  density: number;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Charting the Years',
  tagline: 'Interactive atlas of historical literature',
  adminEmail: '',
  defaultLanguage: 'English',
  defaultEra: 'All',
  booksPerPage: 20,
  mapStyle: 'Parchment',
  displayTheme: 'system',
  fontFamily: '',
  fontScale: 1,
  density: 1,
};

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ success: boolean; data: SiteSettings }>('/api/settings')
      .then((res) => {
        if (res.data.success) {
          setSettings({ ...DEFAULT_SETTINGS, ...res.data.data });
        }
      })
      .catch((err) => {
        console.error('[SettingsContext] Failed to fetch settings', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
