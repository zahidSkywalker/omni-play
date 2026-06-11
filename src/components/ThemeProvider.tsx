"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

interface ThemeContextValue {
  theme: "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

/**
 * ThemeProvider — Dark-only, no toggle.
 * Kept as a wrapper for backward compatibility with useTheme() consumers.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
