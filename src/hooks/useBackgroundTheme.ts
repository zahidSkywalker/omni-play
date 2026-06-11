'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type BackgroundTheme = 'navy' | 'cosmic' | 'sky';

interface BackgroundThemeContextType {
  theme: BackgroundTheme;
  setTheme: (theme: BackgroundTheme) => void;
  isDark: boolean;
}

const BackgroundThemeContext = createContext<BackgroundThemeContextType>({
  theme: 'navy',
  setTheme: () => {},
  isDark: true,
});

export function BackgroundThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BackgroundTheme>('navy');

  const setTheme = useCallback((newTheme: BackgroundTheme) => {
    setThemeState(newTheme);
  }, []);

  const isDark = theme !== 'sky';

  return (
    <BackgroundThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </BackgroundThemeContext.Provider>
  );
}

export function useBackgroundTheme() {
  return useContext(BackgroundThemeContext);
}
