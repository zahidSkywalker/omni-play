'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Lock, Tv, Radio, ChevronRight, Heart, Search, Trophy, ArrowLeft } from 'lucide-react';
import {
  type Channel,
  type Mode,
  type ViewType,
  type CountryMeta,
  countryCodeToFlag,
  LANGUAGE_NAMES,
} from '@/lib/famelack-types';

// Dynamic import for GlobeSelector (canvas globe, no external deps)
const GlobeSelector = dynamic(() => import('./GlobeSelector'), {
  ssr: false,
  loading: () => null,
});

interface ChannelListProps {
  mode: Mode;
  view: ViewType;
  selectedCountry: string | null;
  selectedCategory: string | null;
  setSelectedCountry: (code: string | null) => void;
  metadata: Record<string, CountryMeta>;
  channels: Channel[];
  loading: boolean;
  searchQuery: string;
  showFavoritesOnly: boolean;
  favoriteIds: string[];
  currentChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onShowWorldCup?: () => void;
  onShowFootballHighlights?: () => void;
  isDark?: boolean;
}

export default function ChannelList({
  mode,
  view,
  selectedCountry,
  selectedCategory,
  setSelectedCountry,
  metadata,
  channels,
  loading,
  searchQuery,
  showFavoritesOnly,
  favoriteIds,
  currentChannel,
  onChannelSelect,
  onShowWorldCup,
  onShowFootballHighlights,
  isDark = true,
}: ChannelListProps) {
  const [localTime, setLocalTime] = useState<string>('');
  const meta = selectedCountry ? metadata[selectedCountry] : null;

  // Local time ticker
  useEffect(() => {
    if (!meta?.timeZone) {
      return;
    }

    let active = true;

    function tick() {
      if (!active) return;
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: meta!.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        setLocalTime(formatter.format(new Date()));
      } catch {
        // ignore
      }
    }

    // Use setTimeout(0) to defer setState out of the effect body
    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 10000);

    return () => {
      active = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [meta]);

  const filteredChannels = useMemo(() => {
    let result = channels;

    if (showFavoritesOnly) {
      result = result.filter(ch => favoriteIds.includes(ch.nanoid));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        ch =>
          ch.name.toLowerCase().includes(q) ||
          ch.languages.some(l => (LANGUAGE_NAMES[l] || l).toLowerCase().includes(q)) ||
          ch.country.toLowerCase().includes(q)
      );
    }

    return result;
  }, [channels, searchQuery, showFavoritesOnly, favoriteIds]);

  if (!loading && !selectedCountry && !selectedCategory && !showFavoritesOnly) {
    if (view === 'countries') {
      return (
        <div className="flex-1 flex flex-col relative">
          {onShowWorldCup && mode === 'tv' && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onShowWorldCup}
              whileTap={{ scale: 0.95 }}
              className="absolute top-3 left-3 z-20 min-w-[44px] min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-200"
              style={isDark ? {
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(8px)',
                color: '#E8A317',
              } : {
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(8px)',
                color: '#E8A317',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <Trophy className="w-3 h-3" />
              <span className="hidden sm:inline">World Cup</span>
            </motion.button>
          )}
          {onShowFootballHighlights && mode === 'tv' && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              onClick={onShowFootballHighlights}
              whileTap={{ scale: 0.95 }}
              className={`absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-200 ${
                isDark ? 'omni-glass-card' : ''
              }`}
              style={isDark ? {
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(8px)',
                color: '#E8A317',
              } : {
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(8px)',
                color: '#E8A317',
              }}
            >
              <span>⚽</span>
              <span className="hidden sm:inline">Football</span>
            </motion.button>
          )}
          <GlobeSelector
            metadata={metadata}
            selectedCountry={selectedCountry}
            onSelectCountry={(code: string) => setSelectedCountry(code === selectedCountry ? null : code)}
            mode={mode}
          />
        </div>
      );
    }

    // Fallback empty state for categories view (countries uses GlobeSelector above) - responsive
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-center max-w-xs sm:max-w-sm"
        >
          <div
            className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 ${
              isDark ? 'omni-glass-icon-circle' : ''
            }`}
            style={isDark ? {
              background: 'rgba(108, 132, 232, 0.12)',
              border: '1px solid rgba(108, 132, 232, 0.15)',
              boxShadow: '0 4px 16px rgba(108, 132, 232, 0.1)',
            } : {
              background: '#E8EDFF',
              border: '1px solid rgba(108, 132, 232, 0.1)',
              boxShadow: '0 4px 16px rgba(108, 132, 232, 0.06)',
            }}
          >
            {mode === 'tv' ? (
              <Tv className="w-8 h-8 sm:w-10 sm:h-10 text-[#6C84E8]" />
            ) : (
              <Radio className="w-8 h-8 sm:w-10 sm:h-10 text-[#8B6CC4]" />
            )}
          </div>
          <h2 className={`text-base sm:text-lg font-bold mb-2 ${isDark ? 'omni-text-primary' : 'text-[#1a1a2e]'}`}>
            Select a <span className="omni-gradient-text">Category</span>
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'omni-text-secondary' : 'text-[#6b7280]'}`}>
            Choose a category to discover content from around the world.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Loading state: clean skeleton ──
  if (loading) {
    return (
      <div className="flex-1 p-2 sm:p-4">
        {/* Skeleton header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-3 sm:mb-5 rounded-xl sm:rounded-2xl p-3 sm:p-4 ${isDark ? 'omni-glass-card' : ''}`}
          style={isDark ? {} : {
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className={`h-4 w-32 sm:h-5 sm:w-40 ${isDark ? 'omni-glass-shimmer' : 'omni-shimmer'} mb-2`} />
          <div className={`h-2.5 w-24 sm:h-3 sm:w-28 ${isDark ? 'omni-glass-shimmer' : 'omni-shimmer'}`} />
        </motion.div>
        {/* Skeleton items with stagger */}
        <div className="space-y-1.5 sm:space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className={`h-14 sm:h-16 rounded-xl sm:rounded-2xl ${isDark ? 'omni-glass-shimmer' : 'omni-shimmer'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── My Country Header — Bangladesh Special ── */}
      {meta && selectedCountry === 'bd' && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mx-2 mt-2 mb-2 overflow-hidden"
        >
          {/* Green gradient hero card */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, #006a4e 0%, #00875a 30%, #006a4e 60%, #004d38 100%)',
            boxShadow: '0 4px 24px rgba(0,106,78,0.2), 0 1px 4px rgba(0,106,78,0.1)',
          }}>
            {/* Decorative pattern overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px), radial-gradient(circle at 60% 80%, #ffffff 1px, transparent 1px)`,
              backgroundSize: '60px 60px, 40px 40px, 80px 80px',
            }} />
            {/* Radial glow behind flag */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none" style={{
              background: 'radial-gradient(circle, rgba(244,42,65,0.15) 0%, transparent 70%)',
            }} />
            {/* Content */}
            <div className="relative px-4 sm:px-5 py-4 sm:py-5 flex items-center gap-3.5 sm:gap-4">
              {/* Large flag */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden" style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}>
                  <span className="text-3xl sm:text-4xl">🇧🇩</span>
                  {/* Subtle pulse ring */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-green-300/20 animate-ping" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">{meta.country}</h2>
                  <span className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 tracking-wider uppercase" style={{
                    background: 'rgba(244,42,65,0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(244,42,65,0.2)',
                  }}>My Country</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 mt-1">
                  <span className="text-[10px] sm:text-[11px] text-white/60">{meta.capital}</span>
                  {localTime && (
                    <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-300/80">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {localTime}
                    </span>
                  )}
                </div>
              </div>
              {/* Channel count */}
              <div className="flex-shrink-0 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center" style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                }}>
                  <span className="text-sm sm:text-base font-bold text-white tabular-nums">{filteredChannels.length}</span>
                  <span className="text-[7px] sm:text-[8px] text-white/50 uppercase tracking-wider font-semibold">Channels</span>
                </div>
              </div>
            </div>
            {/* Bottom accent line */}
            <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #f42a41 30%, #006a4e 60%, transparent 100%)' }} />
          </div>
        </motion.div>
      )}

      {/* ── Country Header (non-Bangladesh) ── */}
      {meta && selectedCountry !== 'bd' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center gap-2.5 sm:gap-3.5 px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl mx-2 mt-2 mb-1 ${
            isDark ? 'omni-glass-card' : ''
          }`}
          style={isDark ? {} : {
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <span className="text-2xl sm:text-3xl leading-none">
            {countryCodeToFlag(selectedCountry!)}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className={`text-xs sm:text-sm font-bold truncate ${isDark ? 'omni-text-primary' : 'text-[#1a1a2e]'}`}>
              {meta.country}
            </h2>
            <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
              <span className={`text-[10px] sm:text-[11px] ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`}>{meta.capital}</span>
              {localTime && (
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#6C84E8]/70">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {localTime}
                </span>
              )}
            </div>
          </div>
          <span
            className="text-[10px] sm:text-[11px] font-semibold tabular-nums px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
            style={{
              background: isDark ? 'rgba(108,132,232,0.15)' : '#E8EDFF',
              color: '#6C84E8',
            }}
          >
            {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
          </span>
        </motion.div>
      )}

      {/* ── Category Header ── */}
      {selectedCategory && !selectedCountry && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl mx-2 mt-2 mb-1 ${
            isDark ? 'omni-glass-card' : ''
          }`}
          style={isDark ? {} : {
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <h2 className={`text-xs sm:text-sm font-bold capitalize flex-1 ${isDark ? 'omni-text-primary' : 'text-[#1a1a2e]'}`}>
            {selectedCategory.replace(/-/g, ' ')}
          </h2>
          <span
            className="text-[10px] sm:text-[11px] font-semibold tabular-nums px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
            style={{
              background: isDark ? 'rgba(139,108,196,0.15)' : '#E8EDFF',
              color: '#8B6CC4',
            }}
          >
            {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
          </span>
        </motion.div>
      )}

      {/* ── Favorites Header ── */}
      {showFavoritesOnly && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl mx-2 mt-2 mb-1"
          style={{
            background: isDark ? 'rgba(76, 175, 80, 0.08)' : 'rgba(76, 175, 80, 0.04)',
            border: isDark ? '1px solid rgba(76, 175, 80, 0.12)' : '1px solid rgba(76, 175, 80, 0.08)',
          }}
        >
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4CAF50] fill-[#4CAF50]" />
          <h2 className={`text-xs sm:text-sm font-bold text-[#4CAF50]`}>Favorites</h2>
          <span
            className="text-[10px] sm:text-[11px] font-semibold tabular-nums px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ml-auto"
            style={{
              background: isDark ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.08)',
              color: '#4CAF50',
            }}
          >
            {filteredChannels.length} saved
          </span>
        </motion.div>
      )}

      {/* ── Channel List ── */}
      <div className={`flex-1 overflow-y-auto p-2 sm:p-3 ${isDark ? 'omni-glass-scrollbar' : 'omni-scrollbar'}`}>
        <AnimatePresence mode="sync">
          {filteredChannels.length > 0 ? (
            filteredChannels.map((channel, index) => {
              const isActive = currentChannel?.nanoid === channel.nanoid;
              const isFav = favoriteIds.includes(channel.nanoid);

              return (
                <motion.button
                  key={channel.nanoid}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.025, 0.4),
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  onClick={() => onChannelSelect(channel)}
                  className={`w-full flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-left group mb-1 sm:mb-1.5 transition-all duration-200 ${
                    isActive
                      ? isDark ? 'omni-glass-card-active' : 'omni-card-active'
                      : isDark ? 'omni-glass-card' : 'omni-card'
                  }`}
                >
                  {/* Channel icon */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? isDark ? '' : 'shadow-md shadow-[#6C84E8]/10'
                        : isDark ? '' : 'group-hover:shadow-sm'
                    }`}
                    style={isActive
                      ? isDark
                        ? { background: 'rgba(108,132,232,0.15)', border: '1px solid rgba(108,132,232,0.2)' }
                        : { background: '#E8EDFF', border: '1px solid rgba(108, 132, 232, 0.15)' }
                      : isDark
                        ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }
                        : { background: '#f5f7fa', border: '1px solid rgba(0,0,0,0.04)' }
                    }
                  >
                    <span className="text-xs sm:text-sm">{countryCodeToFlag(channel.country)}</span>
                  </div>

                  {/* Channel info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm truncate font-semibold leading-tight ${isDark ? 'omni-text-primary' : 'text-[#1a1a2e]'}`}>
                      {channel.name}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
                      {channel.languages.slice(0, 2).map(lang => (
                        <span
                          key={lang}
                          className="text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-full font-medium"
                          style={{
                            background: isDark ? 'rgba(108,132,232,0.15)' : '#E8EDFF',
                            color: '#6C84E8',
                          }}
                        >
                          {LANGUAGE_NAMES[lang] || lang}
                        </span>
                      ))}
                      {channel.isGeoBlocked && (
                        <span className="flex items-center gap-0.5 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: '#f59e0b' }}>
                          <Lock className="w-2.5 h-2.5" />
                          <span className="hidden sm:inline">Geo</span><span className="sm:hidden">G</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Favorite + Chevron */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    {isFav && (
                      <Heart className="w-3 h-3 text-[#4CAF50] fill-[#4CAF50]" />
                    )}
                    <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                      isActive
                        ? 'text-[#6C84E8]'
                        : isDark ? 'omni-text-muted group-hover:text-white/60' : 'text-[#d1d5db] group-hover:text-[#9ca3af]'
                    }`} />
                  </div>
                </motion.button>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4 sm:px-6"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 ${
                  isDark ? 'omni-glass-icon-circle' : ''
                }`}
                style={isDark ? {
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                } : {
                  background: '#f5f7fa',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <Search className={`w-6 h-6 ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`} />
              </div>
              <p className={`text-xs sm:text-sm font-medium ${isDark ? 'omni-text-secondary' : 'text-[#6b7280]'}`}>
                {searchQuery ? 'No channels match your search' :
                 showFavoritesOnly ? 'No favorites yet — tap the heart to save' :
                 'No channels found'}
              </p>
              <p className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 ${isDark ? 'omni-text-muted' : 'text-[#9ca3af]'}`}>
                {searchQuery ? 'Try a different keyword or clear the search' : ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
