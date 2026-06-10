'use client';

import React, { type Dispatch, type SetStateAction, useMemo, useState, useRef, useEffect } from 'react';
import {
  Search,
  Tv,
  Radio,
  Globe,
  Heart,
  Layers,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type Mode,
  type ViewType,
  type CountryMeta,
  countryCodeToFlag,
  getCategories,
  getCategoryIcon,
} from '@/lib/famelack-types';

interface SidebarProps {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  view: ViewType;
  setView: Dispatch<SetStateAction<ViewType>>;
  selectedCountry: string | null;
  setSelectedCountry: Dispatch<SetStateAction<string | null>>;
  selectedCategory: string | null;
  setSelectedCategory: Dispatch<SetStateAction<string | null>>;
  metadata: Record<string, CountryMeta>;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  showFootballHighlights: boolean;
  showWorldCup: boolean;
  onShowFootballHighlights: () => void;
  onShowWorldCup: () => void;
  onShowWorldView: () => void;
  isDark?: boolean;
}

export default function Sidebar({
  mode,
  setMode,
  view,
  setView,
  selectedCountry,
  setSelectedCountry,
  selectedCategory,
  setSelectedCategory,
  metadata,
  showFavoritesOnly,
  setShowFavoritesOnly,
  sidebarOpen,
  setSidebarOpen,
  showFootballHighlights,
  showWorldCup,
  onShowFootballHighlights,
  onShowWorldCup,
  onShowWorldView,
  isDark = true,
}: SidebarProps) {
  const [showAbout, setShowAbout] = useState(false);
  const categories = useMemo(() => getCategories(mode), [mode]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);

  const sortedCountries = useMemo(() => {
    return Object.entries(metadata)
      .filter(([, m]) => m.hasChannels)
      .sort(([, a], [, b]) => b.channelCount - a.channelCount);
  }, [metadata]);

  /* Separate Bangladesh from the list for special placement */
  const { bangladeshEntry, otherCountries } = useMemo(() => {
    const bd = sortedCountries.find(([code]) => code === 'bd');
    const others = sortedCountries.filter(([code]) => code !== 'bd');
    return { bangladeshEntry: bd as [string, CountryMeta] | undefined, otherCountries: others };
  }, [sortedCountries]);

  const handleSelectCountry = (code: string) => {
    if (selectedCountry === code) {
      setSelectedCountry(null);
    } else {
      setSelectedCountry(code);
      setSelectedCategory(null);
      setShowFavoritesOnly(false);
      setView('countries');
    }
    setSidebarOpen(false);
  };

  const handleSelectCategory = (cat: string) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
      setSelectedCountry(null);
      setShowFavoritesOnly(false);
      setView('categories');
    }
    setSidebarOpen(false);
  };

  const handleShowFavorites = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
    setSelectedCountry(null);
    setSelectedCategory(null);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        role="navigation"
        aria-label="Main navigation"
        className={`
          fixed top-0 left-0 z-50 h-full omni-sidebar md:relative md:z-auto
          flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDark ? 'omni-glass-sidebar' : ''}
        `}
        style={isDark ? {
          minHeight: '100dvh',
        } : {
          minHeight: '100dvh',
          background: '#ffffff',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* ── Logo Header ── */}
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 safe-top ${isDark ? '' : ''}`}
          style={{
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center ${isDark ? 'omni-glass-icon-circle' : ''}`}
              style={isDark ? {
                boxShadow: '0 2px 12px rgba(108,132,232,0.3)',
              } : {
                background: '#6C84E8',
                boxShadow: '0 2px 8px rgba(108,132,232,0.25)',
              }}
            >
              <Tv className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isDark ? 'text-[#6C84E8]' : 'text-white'}`} />
            </div>
            <div>
              <span className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'omni-text-primary' : 'text-[#1a1a2e]'}`}>
                Omni Play
              </span>
              <p className={`text-[8px] sm:text-[9px] uppercase tracking-[0.2em] -mt-0.5 ${isDark ? 'text-[#6C84E8]/60' : 'text-[#6C84E8]/60'}`}>
                Streaming
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded-lg transition-all duration-200 ${isDark ? 'omni-glass-btn-hover omni-text-muted' : 'text-[#9ca3af] hover:text-[#1a1a2e] hover:bg-[#f5f7fa]'}`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── TV / Radio Toggle — Pill Buttons ── */}
        <div className={`px-4 sm:px-5 py-3 sm:py-4`} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}>
          <div className={`flex rounded-lg sm:rounded-xl p-1 gap-1 ${isDark ? 'omni-glass-pill-track' : ''}`} style={isDark ? {} : { background: '#f0f2f5' }}>
            <motion.button
              onClick={() => { setMode('tv'); setSelectedCountry(null); setSelectedCategory(null); }}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
                mode === 'tv'
                  ? isDark ? 'omni-glass-pill-active' : 'omni-pill-active'
                  : isDark ? 'omni-text-muted hover:text-white/90' : 'text-[#6b7280] hover:text-[#2D2D44]'
              }`}
              layout
            >
              <Tv className="w-3 sm:w-3.5 sm:h-3.5" />
              TV
            </motion.button>
            <motion.button
              onClick={() => { setMode('radio'); setSelectedCountry(null); setSelectedCategory(null); }}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
                mode === 'radio'
                  ? isDark ? 'omni-glass-pill-active' : 'omni-pill-active'
                  : isDark ? 'omni-text-muted hover:text-white/90' : 'text-[#6b7280] hover:text-[#2D2D44]'
              }`}
              layout
            >
              <Radio className="w-3 sm:w-3.5 sm:h-3.5" />
              Radio
            </motion.button>
          </div>
        </div>

        {/* ── Countries / Categories Toggle ── */}
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}>
          <div className={`flex gap-1 p-1 rounded-lg sm:rounded-xl ${isDark ? 'omni-glass-pill-track' : ''}`} style={isDark ? {} : { background: '#f5f7fa' }}>
            <motion.button
              onClick={() => { setView('countries'); setShowFavoritesOnly(false); }}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 ${
                view === 'countries' && !showFavoritesOnly
                  ? isDark ? 'omni-glass-pill-active' : 'omni-pill-active'
                  : isDark ? 'omni-text-muted hover:text-white/90' : 'text-[#6b7280] hover:text-[#2D2D44]'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <Globe className="w-3 sm:w-3.5 sm:h-3.5" />
              Countries
            </motion.button>
            <motion.button
              onClick={() => { setView('categories'); setShowFavoritesOnly(false); }}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 ${
                view === 'categories' && !showFavoritesOnly
                  ? isDark ? 'omni-glass-pill-active' : 'omni-pill-active'
                  : isDark ? 'omni-text-muted hover:text-white/90' : 'text-[#6b7280] hover:text-[#2D2D44]'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              <Layers className="w-3 sm:w-3.5 sm:h-3.5" />
              Categories
            </motion.button>
          </div>
        </div>

        {/* ── FIFA 2026 — Stunning Calligraphy Style ── */}
        <div className="px-3.5 sm:px-4 pt-2.5 sm:pt-3 pb-1">
          <motion.button
            onClick={() => {
              onShowWorldCup();
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-xl overflow-hidden relative transition-all duration-200"
            style={showWorldCup && !showFootballHighlights && !selectedCountry && !selectedCategory && !showFavoritesOnly ? {
              background: 'linear-gradient(135deg, rgba(26,107,60,0.08) 0%, rgba(232,163,23,0.08) 100%)',
              border: '1px solid rgba(232,163,23,0.2)',
            } : {
              border: '1px solid transparent',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Subtle gold shimmer */}
            <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity" style={{
              background: 'linear-gradient(110deg, transparent 30%, rgba(232,163,23,0.04) 50%, transparent 70%)',
            }} />
            <div className="flex items-center gap-2 relative z-10">
              <motion.div
                animate={showWorldCup && !showFootballHighlights && !selectedCountry && !selectedCategory ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <span className="text-lg sm:text-xl">🏆</span>
              </motion.div>
              <span className="text-sm sm:text-base font-bold tracking-tight" style={{
                fontFamily: '"Playfair Display", "Georgia", serif',
                fontStyle: 'italic',
                background: showWorldCup && !showFootballHighlights && !selectedCountry && !selectedCategory && !showFavoritesOnly
                  ? 'linear-gradient(135deg, #E8A317 0%, #FFD700 40%, #FFF8DC 50%, #FFD700 60%, #E8A317 100%)'
                  : isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)' : 'linear-gradient(135deg, #1a1a2e 0%, #6b7280 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                FIFA 2026
              </span>
            </div>
            {showWorldCup && !showFootballHighlights && !selectedCountry && !selectedCategory && !showFavoritesOnly && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-semibold relative z-10"
                style={{ background: 'rgba(232, 163, 23, 0.1)', color: '#E8A317' }}
              >
                Live
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* ── Football Zone Button ── */}
        <div className="px-3.5 sm:px-4 pt-1 sm:pt-2 pb-1">
          <motion.button
            onClick={() => {
              onShowFootballHighlights();
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
              showFootballHighlights
                ? isDark ? 'omni-football-active' : 'text-[#E8A317]'
                : isDark ? 'omni-text-secondary hover:text-[#E8A317] hover:bg-white/5' : 'text-[#6b7280] hover:text-[#E8A317] hover:bg-[#f5f7fa]'
            }`}
            style={showFootballHighlights ? {
              background: 'rgba(232, 163, 23, 0.06)',
              border: '1px solid rgba(232, 163, 23, 0.12)',
            } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={showFootballHighlights ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span className="text-base">⚽</span>
            </motion.div>
            Football Zone
            {showFootballHighlights && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(232, 163, 23, 0.1)', color: '#E8A317' }}
              >
                Active
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* ── World View Button ── */}
        <div className="px-3.5 sm:px-4 pt-1 sm:pt-2 pb-1">
          <motion.button
            onClick={() => {
              onShowWorldView();
              setView('countries');
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
              !showFootballHighlights && !showWorldCup && !selectedCountry && !selectedCategory && !showFavoritesOnly
                ? isDark ? 'omni-football-active' : 'text-[#6C84E8]'
                : isDark ? 'omni-text-secondary hover:text-[#6C84E8] hover:bg-white/5' : 'text-[#6b7280] hover:text-[#6C84E8] hover:bg-[#f5f7fa]'
            }`}
            style={!showFootballHighlights && !showWorldCup && !selectedCountry && !selectedCategory && !showFavoritesOnly ? {
              background: 'rgba(108,132,232,0.06)',
              border: '1px solid rgba(108,132,232,0.12)',
            } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={!showFootballHighlights && !showWorldCup && !selectedCountry && !selectedCategory && !showFavoritesOnly ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Globe className="w-4 h-4" />
            </motion.div>
            World View
            {!showFootballHighlights && !showWorldCup && !selectedCountry && !selectedCategory && !showFavoritesOnly && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(108,132,232,0.1)', color: '#6C84E8' }}
              >
                Active
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* ── Favorites Button ── */}
        <div className="px-3.5 sm:px-4 pt-1 sm:pt-2 pb-1">
          <motion.button
            onClick={handleShowFavorites}
            className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
              showFavoritesOnly
                ? 'text-[#4CAF50]'
                : isDark ? 'omni-text-secondary hover:text-white/90 hover:bg-white/5' : 'text-[#6b7280] hover:text-[#2D2D44] hover:bg-[#f5f7fa]'
            }`}
            style={showFavoritesOnly ? {
              background: 'rgba(76, 175, 80, 0.06)',
              border: '1px solid rgba(76, 175, 80, 0.12)',
            } : {}}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={showFavoritesOnly ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${
                  showFavoritesOnly ? 'fill-[#4CAF50] text-[#4CAF50]' : ''
                }`}
              />
            </motion.div>
            Favorites
            {showFavoritesOnly && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}
              >
                Active
              </motion.span>
            )}
          </motion.button>
        </div>

        {/* ── Scrollable List ── */}
        <div className={`flex-1 overflow-y-auto mt-2 sm:mt-3 px-2 pb-4 ${isDark ? 'omni-glass-scrollbar' : 'omni-scrollbar'}`}>
          {/* ── My Country Card (Bangladesh) ── */}
          <div className="px-1.5 sm:px-2 pt-0.5 pb-2">
            <MyCountryCard
              onSelect={() => handleSelectCountry('bd')}
              isDark={isDark}
            />
          </div>
          <AnimatePresence mode="wait">
            {!showFavoritesOnly && view === 'countries' && (
              <motion.div
                key="countries"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CountryList
                  countries={otherCountries}
                  bangladeshEntry={bangladeshEntry}
                  selected={selectedCountry}
                  onSelect={handleSelectCountry}
                  isDark={isDark}
                />
              </motion.div>
            )}
            {!showFavoritesOnly && view === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryList
                  categories={categories}
                  mode={mode}
                  selected={selectedCategory}
                  onSelect={handleSelectCategory}
                  isDark={isDark}
                />
              </motion.div>
            )}
            {showFavoritesOnly && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="px-3 py-10 text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'rgba(76, 175, 80, 0.08)',
                    border: '1px solid rgba(76, 175, 80, 0.12)',
                  }}
                >
                  <Heart className="w-7 h-7 text-[#4CAF50]" />
                </div>
                <p className={`text-sm font-semibold ${isDark ? 'omni-text-primary' : 'text-[#1a1a2e]'}`}>Your Favorites</p>
                <p className={`text-xs mt-1.5 leading-relaxed max-w-[200px] mx-auto ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`}>
                  Play a channel and tap the heart icon to save it here
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── About Section ── */}
        <div
          className="px-4 sm:px-5 py-2.5 sm:py-3.5 safe-bottom"
          style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}
        >
          <button
            onClick={() => setShowAbout(true)}
            className={`flex items-center gap-2 text-[11px] transition-colors duration-200 group ${isDark ? 'omni-text-muted hover:text-white/60' : 'text-[#9ca3af] hover:text-[#6b7280]'}`}
            aria-label="About Omni Play"
          >
            <Info className={`w-3.5 h-3.5 transition-colors ${isDark ? 'group-hover:text-[#6C84E8]/60' : 'group-hover:text-[#6C84E8]/60'}`} />
            About Omni Play
          </button>
        </div>
        {/* About Modal */}
        <AnimatePresence>
          {showAbout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center p-4"
              style={isDark ? { background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' } : { background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowAbout(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`${isDark ? 'omni-glass-modal' : 'bg-white'} rounded-2xl p-6 max-w-xs w-full`}
                style={isDark ? {} : { boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#6C84E8', boxShadow: '0 2px 8px rgba(108,132,232,0.25)' }}>
                    <Tv className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? 'omni-text-primary' : 'text-[#1a1a2e]'}`}>Omni Play</h3>
                    <p className={`text-[10px] ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`}>v1.0 — Streaming Dashboard</p>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'omni-text-secondary' : 'text-[#6b7280]'}`}>
                  Browse and watch live TV &amp; radio channels from around the world. Features a 3D globe for country selection, HLS streaming, favorites, and more.
                </p>
                <button
                  onClick={() => setShowAbout(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white"
                  style={{ background: '#6C84E8' }}
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}

const MY_COUNTRY_CHANNELS = [
  { name: 'T-Sports', color: '#006a4e' },
  { name: 'Gazi TV', color: '#FFD700' },
  { name: 'Channel 9', color: '#4CAF50' },
  { name: 'ATN News', color: '#f44336' },
  { name: 'Channel i', color: '#e91e63' },
  { name: 'NTV', color: '#2196F3' },
  { name: 'Somoy TV', color: '#FF9800' },
  { name: 'Independent TV', color: '#9C27B0' },
  { name: 'Maasranga TV', color: '#00BCD4' },
  { name: 'Deepto TV', color: '#607D8B' },
];

function MyCountryCard({ onSelect, isDark = true }: { onSelect: () => void; isDark?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
      className="relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(0,106,78,0.15) 0%, rgba(0,106,78,0.05) 100%)'
          : 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
        border: isDark
          ? '1px solid rgba(0,106,78,0.2)'
          : '1px solid rgba(0,106,78,0.15)',
        boxShadow: isDark
          ? '0 2px 12px rgba(0,106,78,0.1)'
          : '0 2px 8px rgba(0,106,78,0.06)',
      }}
    >
      {/* Green shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isDark
          ? 'linear-gradient(110deg, transparent 30%, rgba(0,106,78,0.08) 50%, transparent 70%)'
          : 'linear-gradient(110deg, transparent 30%, rgba(0,106,78,0.06) 50%, transparent 70%)',
        animation: 'shimmer 3s ease-in-out infinite',
      }} />

      {/* Main content */}
      <div className="relative flex items-center gap-2.5 px-3 py-2.5 sm:py-3">
        <span className="text-2xl sm:text-3xl leading-none flex-shrink-0">🇧🇩</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={isDark ? 'text-[10px] sm:text-xs font-bold text-[#4CAF50]' : 'text-[10px] sm:text-xs font-bold text-[#2E7D32]'}>
              My Country
            </span>
            <span className="text-[8px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{
              background: isDark ? 'rgba(244,67,54,0.12)' : 'rgba(244,67,54,0.08)',
              color: '#f44336',
            }}>
              ❤️ BD
            </span>
          </div>
          <p className={isDark ? 'text-[9px] sm:text-[10px] font-medium text-green-400/70' : 'text-[9px] sm:text-[10px] font-medium text-[#66BB6A]'}>
            {MY_COUNTRY_CHANNELS.length} channels available
          </p>
        </div>
        <motion.button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          whileTap={{ scale: 0.9 }}
          className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
        >
          {expanded && <ChevronUp className="w-3.5 h-3.5 text-[#4CAF50]" />}
          {!expanded && <ChevronDown className="w-3.5 h-3.5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }} />}
        </motion.button>
      </div>

      {/* Expanded channel list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2.5 space-y-1" style={{ borderTop: isDark ? '1px solid rgba(0,106,78,0.1)' : '1px solid rgba(0,106,78,0.08)' }}>
              {MY_COUNTRY_CHANNELS.map((ch) => (
                <div key={ch.name} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                  <span className={isDark ? 'text-[10px] sm:text-[11px] font-medium omni-text-secondary' : 'text-[10px] sm:text-[11px] font-medium text-[#424242]'}>
                    {ch.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CountryList({
  countries,
  bangladeshEntry,
  selected,
  onSelect,
  isDark = true,
}: {
  countries: [string, CountryMeta][];
  bangladeshEntry?: [string, CountryMeta];
  selected: string | null;
  onSelect: (code: string) => void;
  isDark?: boolean;
}) {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [bdExpanded, setBdExpanded] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bdChannels = useMemo(() => [
    { name: 'ATN News', type: 'news' },
    { name: 'Channel i', type: 'general' },
    { name: 'Gazi TV', type: 'sports' },
    { name: 'NTV', type: 'general' },
    { name: 'Somoy TV', type: 'news' },
    { name: 'Maasranga TV', type: 'entertainment' },
    { name: 'Independent TV', type: 'news' },
    { name: 'Deepto TV', type: 'entertainment' },
  ] as const, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 200);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return countries;
    const q = debouncedSearch.toLowerCase();
    return countries.filter(
      ([code, m]) =>
        m.country.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        m.capital.toLowerCase().includes(q)
    );
  }, [countries, debouncedSearch]);

  /* When searching, also check if Bangladesh matches search */
  const bdMatchesSearch = !debouncedSearch.trim() || (bangladeshEntry && (
    bangladeshEntry[1].country.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    'bd'.includes(debouncedSearch.toLowerCase()) ||
    bangladeshEntry[1].capital.toLowerCase().includes(debouncedSearch.toLowerCase())
  ));

  return (
    <div>
      {/* Bangladesh — My Country expandable card */}
      {bangladeshEntry && bdMatchesSearch && (
        <div className="mb-3">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-xl overflow-hidden relative"
            style={{
              background: selected === bangladeshEntry[0]
                ? 'linear-gradient(135deg, rgba(0,106,78,0.14) 0%, rgba(0,106,78,0.06) 100%)'
                : 'linear-gradient(135deg, rgba(0,106,78,0.06) 0%, rgba(0,106,78,0.02) 100%)',
              border: `1px solid ${selected === bangladeshEntry[0] ? 'rgba(0,106,78,0.35)' : 'rgba(0,106,78,0.18)'}`,
              boxShadow: selected === bangladeshEntry[0]
                ? '0 2px 12px rgba(0,106,78,0.15), 0 0 24px rgba(0,106,78,0.08)'
                : '0 1px 6px rgba(0,106,78,0.08)',
            }}
          >
            {/* Green shimmer sweep */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{ zIndex: 0 }}
            >
              <div className="bd-card-shimmer absolute inset-0" />
            </div>

            {/* Main clickable row */}
            <button
              onClick={() => {
                onSelect(bangladeshEntry[0]);
                setBdExpanded(!bdExpanded);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 sm:py-3 text-sm transition-all duration-200 text-left relative z-10 ${
                selected === bangladeshEntry[0]
                  ? ''
                  : 'hover:opacity-90'
              }`}
            >
              {/* Subtle green glow behind flag */}
              <div
                className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(0,106,78,0.12) 0%, transparent 70%)',
                }}
              />
              <span className="text-lg flex-shrink-0 relative z-10">
                {countryCodeToFlag(bangladeshEntry[0])}
              </span>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="truncate text-xs font-semibold" style={{ color: '#006a4e' }}>
                    {bangladeshEntry[1].country}
                  </div>
                  <span
                    className="text-[7px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: 'rgba(0,106,78,0.12)',
                      color: '#006a4e',
                    }}
                  >
                    HOME
                  </span>
                </div>
                <div className="text-[9px] mt-0.5 font-medium" style={{ color: 'rgba(0,106,78,0.5)' }}>
                  My Country
                </div>
              </div>
              <span
                className="text-[10px] flex-shrink-0 tabular-nums relative z-10 font-medium"
                style={{ color: '#006a4e' }}
              >
                {bangladeshEntry[1].channelCount}
              </span>
              {/* Chevron toggle */}
              <motion.div
                animate={{ rotate: bdExpanded ? 180 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="ml-0.5 flex-shrink-0 relative z-10"
              >
                <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(0,106,78,0.5)' }} />
              </motion.div>
            </button>

            {/* Expandable channel pills */}
            <AnimatePresence initial={false}>
              {bdExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden relative z-10"
                >
                  <div className="px-3 pb-3 pt-0.5">
                    <div
                      className="w-full h-px mb-2"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(0,106,78,0.12), transparent)',
                      }}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {bdChannels.map((ch, i) => (
                        <motion.span
                          key={ch.name}
                          initial={{ opacity: 0, scale: 0.85, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.85, y: 4 }}
                          transition={{
                            duration: 0.2,
                            delay: i * 0.04,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium cursor-default select-none"
                          style={{
                            background: 'rgba(0,106,78,0.05)',
                            color: '#006a4e',
                            border: '1px solid rgba(0,106,78,0.1)',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background:
                                ch.type === 'news'
                                  ? '#ef4444'
                                  : ch.type === 'sports'
                                    ? '#f59e0b'
                                    : '#6C84E8',
                            }}
                          />
                          {ch.name}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {/* Separator line */}
          <div
            className="mx-3 mt-2 mb-1"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,106,78,0.15), rgba(0,0,0,0.04), transparent)',
              height: '1px',
            }}
          />
        </div>
      )}
      <div className="px-2 pb-2 sm:pb-2.5">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`} />
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search countries"
            className={`w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs ${isDark ? 'omni-glass-input' : 'omni-input text-[#1a1a2e]'}`}
          />
        </div>
      </div>
      <div className="space-y-0.5">
        {filtered.map(([code, meta], index) => (
          <motion.button
            key={code}
            onClick={() => onSelect(code)}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: Math.min(index * 0.015, 0.3) }}
            className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 text-left ${
              selected === code
                ? isDark ? 'omni-glass-sidebar-active' : 'omni-sidebar-active'
                : isDark ? 'omni-glass-slide-hover' : 'text-[#2D2D44] omni-slide-hover hover:bg-[#f5f7fa]'
            }`}
          >
            <span className="text-base flex-shrink-0">
              {countryCodeToFlag(code)}
            </span>
            <div className="flex-1 min-w-0 relative z-10">
              <div className="truncate text-xs font-medium">{meta.country}</div>
            </div>
            <span className={`text-[10px] flex-shrink-0 tabular-nums relative z-10 ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`}>
              {meta.channelCount}
            </span>
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-8 text-center"
          >
            <p className={`text-xs ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`}>No countries found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CategoryList({
  categories,
  mode,
  selected,
  onSelect,
  isDark = true,
}: {
  categories: readonly string[];
  mode: Mode;
  selected: string | null;
  onSelect: (cat: string) => void;
  isDark?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      {categories.map((cat, index) => (
        <motion.button
          key={cat}
          onClick={() => onSelect(cat)}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: Math.min(index * 0.015, 0.3) }}
          className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm transition-all duration-200 text-left ${
            selected === cat
              ? isDark ? 'omni-glass-sidebar-active' : 'omni-sidebar-active'
              : isDark ? 'omni-glass-slide-hover' : 'text-[#2D2D44] omni-slide-hover hover:bg-[#f5f7fa]'
          }`}
        >
          <span className="text-base flex-shrink-0 relative z-10">
            {getCategoryIcon(cat, mode)}
          </span>
          <span className="capitalize text-xs font-medium relative z-10">
            {cat.replace(/-/g, ' ')}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
