'use client';

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (nanoid: string) => void;
  removeFavorite: (nanoid: string) => void;
  toggleFavorite: (nanoid: string) => void;
  isFavorite: (nanoid: string) => boolean;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const STORAGE_KEY = 'omni-play-favorites';


function saveFavorites(favs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {
    // Storage might be full or unavailable
  }
}

function getInitialFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(getInitialFavorites);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const addFavorite = useCallback((nanoid: string) => {
    setFavorites(prev => {
      if (prev.includes(nanoid)) return prev;
      const next = [...prev, nanoid];
      saveFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((nanoid: string) => {
    setFavorites(prev => {
      const next = prev.filter(f => f !== nanoid);
      saveFavorites(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((nanoid: string) => {
    setFavorites(prev => {
      const next = prev.includes(nanoid)
        ? prev.filter(f => f !== nanoid)
        : [...prev, nanoid];
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((nanoid: string) => {
    return favorites.includes(nanoid);
  }, [favorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        showFavoritesOnly,
        setShowFavoritesOnly,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
