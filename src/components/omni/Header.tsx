'use client';

import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Radio, Shuffle, Search, Menu, X } from 'lucide-react';
import { type Mode, type CountryMeta, countryCodeToFlag, getCategoryIcon } from '@/lib/famelack-types';

interface HeaderProps {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  selectedCountry: string | null;
  selectedCategory: string | null;
  metadata: Record<string, CountryMeta>;
  onRandomChannel: () => void;
  searchOpen: boolean;
  setSearchOpen: Dispatch<SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  showFootballHighlights?: boolean;
  showWorldCup?: boolean;
  isDark?: boolean;
}

export default function Header({
  mode,
  setMode,
  selectedCountry,
  selectedCategory,
  metadata,
  onRandomChannel,
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
  sidebarOpen,
  setSidebarOpen,
  showFootballHighlights,
  showWorldCup,
  isDark = true,
}: HeaderProps) {
  const breadcrumb = useMemo(() => {
    if (showFootballHighlights) {
      return {
        icon: '⚽',
        label: 'Football Zone',
        sub: 'Live matches & highlights',
      };
    }
    if (showWorldCup) {
      return {
        icon: '🏆',
        label: 'FIFA World Cup 2026',
        sub: 'United States · Mexico · Canada',
      };
    }
    if (selectedCountry && metadata[selectedCountry]) {
      return {
        icon: countryCodeToFlag(selectedCountry),
        label: metadata[selectedCountry].country,
        sub: metadata[selectedCountry].capital,
      };
    }
    if (selectedCategory) {
      return {
        icon: getCategoryIcon(selectedCategory, mode),
        label: selectedCategory.replace(/-/g, ' '),
        sub: null,
      };
    }
    return {
      icon: mode === 'tv' ? '📺' : '📻',
      label: mode === 'tv' ? 'TV Channels' : 'Radio Stations',
      sub: null,
    };
  }, [mode, selectedCountry, selectedCategory, metadata, showFootballHighlights, showWorldCup]);

  return (
    <header className={`sticky top-0 z-30 safe-top ${isDark ? 'omni-glass-header' : 'omni-glass'}`}>
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-4">
        {/* Mobile menu button */}
        <motion.button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileTap={{ scale: 0.92 }}
          className={`md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 ${
            isDark
              ? 'omni-glass-btn-hover omni-text-muted'
              : 'text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f7fa]'
          }`}
        >
          {sidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
        </motion.button>

        {/* Mode badge — blue pill (clickable toggle) */}
        <motion.button
          onClick={() => {
            const newMode = mode === 'tv' ? 'radio' : 'tv';
            setMode(newMode);
          }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer"
          style={{
            background: '#6C84E8',
            color: '#ffffff',
          }}
          title={`Switch to ${mode === 'tv' ? 'Radio' : 'TV'}`}
        >
          {mode === 'tv' ? (
            <Tv className="w-3 h-3" />
          ) : (
            <Radio className="w-3 h-3" />
          )}
          {mode}
        </motion.button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
          <span className="text-base sm:text-lg leading-none">{breadcrumb.icon}</span>
          <div className="min-w-0">
            <p
              className={`text-xs sm:text-sm font-semibold truncate capitalize ${
                isDark ? 'omni-text-primary' : 'text-[#1a1a2e]'
              }`}
            >
              {breadcrumb.label}
            </p>
            {breadcrumb.sub && (
              <p
                className={`text-[9px] sm:text-[10px] truncate mt-0.5 ${
                  isDark ? 'omni-text-secondary' : 'text-[#9ca3af]'
                }`}
              >
                {breadcrumb.sub}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Search toggle */}
          <motion.button
            onClick={() => setSearchOpen(!searchOpen)}
            whileTap={{ scale: 0.92 }}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${
              searchOpen
                ? isDark
                  ? 'text-[#6C84E8] bg-[#6C84E8]/15'
                  : 'text-[#6C84E8] bg-[#E8EDFF]'
                : isDark
                  ? 'omni-glass-btn-hover omni-text-muted'
                  : 'text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f5f7fa]'
            }`}
          >
            <Search className="w-4 h-4" />
          </motion.button>

          {/* Random channel */}
          <motion.button
            onClick={onRandomChannel}
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.4 }}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${
              isDark
                ? 'omni-glass-btn-hover omni-text-muted hover:text-[#8B6CC4]'
                : 'text-[#6b7280] hover:text-[#8B6CC4] hover:bg-[#f5f7fa]'
            }`}
            title="Random Channel"
          >
            <Shuffle className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Subtle accent line */}
      <div className={isDark ? 'omni-glass-header-line' : 'omni-header-line'} />

      {/* Search bar — smooth expand */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-5 pb-3 sm:pb-4 pt-2 sm:pt-2.5">
              <div className="relative">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`} />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className={`${isDark ? 'omni-glass-input' : 'omni-input'} w-full pl-10 pr-10 py-2.5 rounded-full text-sm`}
                  style={isDark ? { color: 'rgba(255,255,255,0.92)' } : { color: '#1a1a2e' }}
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                        isDark ? 'omni-text-muted hover:text-white/60' : 'text-[#9ca3af] hover:text-[#6b7280]'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
