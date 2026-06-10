'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Sidebar from '@/components/omni/Sidebar';
import Header from '@/components/omni/Header';
import ChannelList from '@/components/omni/ChannelList';
import { FavoritesProvider, useFavorites } from '@/components/omni/FavoritesManager';
import { BackgroundThemeProvider, useBackgroundTheme, type BackgroundTheme } from '@/hooks/useBackgroundTheme';
import { type Channel, type Mode, type ViewType, type CountryMeta } from '@/lib/famelack-types';

const Player = dynamic(() => import('@/components/omni/Player'), { ssr: false });
const WorldCupSection = dynamic(() => import('@/components/omni/WorldCupSection'), { ssr: false });
const FootballHighlights = dynamic(() => import('@/components/omni/FootballHighlights'), { ssr: false });

function OmniPlayApp() {
  const { favorites, toggleFavorite, isFavorite, showFavoritesOnly, setShowFavoritesOnly } = useFavorites();

  // Core state
  const [mode, setMode] = useState<Mode>('tv');
  const [view, setView] = useState<ViewType>('countries');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, CountryMeta>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [showWorldCup, setShowWorldCup] = useState(true);
  const [showFootballHighlights, setShowFootballHighlights] = useState(false);
  const { theme: bgTheme, setTheme: setBgTheme, isDark } = useBackgroundTheme();

  // Body scroll lock when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('omni-body-lock');
    } else {
      document.body.classList.remove('omni-body-lock');
    }
    return () => {
      document.body.classList.remove('omni-body-lock');
    };
  }, [sidebarOpen]);

  // Fetch metadata on mount and mode change
  useEffect(() => {
    let cancelled = false;
    async function fetchMetadata() {
      if (!cancelled) setMetadataLoading(true);
      try {
        const res = await fetch(`/api/famelack?type=${mode}&view=metadata`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setMetadata(data);
        } else if (!cancelled) {
          setError('Failed to load country list');
        }
      } catch {
        if (!cancelled) setError('Network error — check your connection');
      } finally {
        if (!cancelled) setMetadataLoading(false);
      }
    }
    fetchMetadata();
    return () => { cancelled = true; };
  }, [mode]);

  // Fetch channels when country/category selection changes
  useEffect(() => {
    if (!selectedCountry && !selectedCategory) {
      return;
    }

    let cancelled = false;

    async function fetchChannels() {
      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);
      try {
        let url: string;
        if (selectedCountry) {
          url = `/api/famelack?type=${mode}&view=country&id=${selectedCountry}`;
        } else if (selectedCategory) {
          url = `/api/famelack?type=${mode}&view=category&id=${selectedCategory}`;
        } else {
          return;
        }

        const res = await fetch(url);
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) {
              setChannels([]);
              setError('No channels found for this selection');
            }
          } else {
            if (!cancelled) setError('Failed to load channels');
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setChannels(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChannels();
    return () => { cancelled = true; };
  }, [mode, selectedCountry, selectedCategory]);

  // Reset state on mode change
  const handleModeChange = useCallback((newMode: Mode | ((prev: Mode) => Mode)) => {
    const resolvedMode = typeof newMode === 'function' ? newMode(mode) : newMode;
    setMode(resolvedMode);
    setSelectedCountry(null);
    setSelectedCategory(null);
    setChannels([]);
    setCurrentChannel(null);
    setIsPlayerOpen(false);
    setSearchQuery('');
  }, [mode]);

  const handleChannelSelect = useCallback((channel: Channel) => {
    setCurrentChannel(channel);
    setIsPlayerOpen(true);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setIsPlayerOpen(false);
    setCurrentChannel(null);
  }, []);

  // Football Zone / FIFA / WorldCup -> white background, everything else -> navy
  useEffect(() => {
    if ((showFootballHighlights || showWorldCup) && !selectedCountry && !selectedCategory && !showFavoritesOnly) {
      setBgTheme('sky');
    } else {
      setBgTheme('navy');
    }
  }, [showFootballHighlights, showWorldCup, selectedCountry, selectedCategory, showFavoritesOnly, setBgTheme]);

  const bgClass = useMemo(() => {
    if (bgTheme === 'cosmic') return 'omni-bg-navy omni-bg-cosmic';
    return 'omni-bg-navy';
  }, [bgTheme]);

  const handleRandomChannel = useCallback(() => {
    if (channels.length === 0) return;
    const randomIndex = Math.floor(Math.random() * channels.length);
    handleChannelSelect(channels[randomIndex]);
  }, [channels, handleChannelSelect]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-dvh flex flex-col overflow-hidden"
    >
      {/* Cinematic Background Layer */}
      <div className={`omni-bg-layer omni-bg-layer-active ${bgClass}`} />

      <div className="flex flex-1 overflow-hidden relative z-10 max-w-[1600px] w-full mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.92)' : '#1a1a2e' }}>
        {/* Sidebar */}
        <Sidebar
          mode={mode}
          setMode={handleModeChange}
          view={view}
          setView={setView}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          metadata={metadata}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showFootballHighlights={showFootballHighlights}
          showWorldCup={showWorldCup}
          onShowFootballHighlights={() => { setShowFootballHighlights(true); setShowWorldCup(false); setSelectedCountry(null); setSelectedCategory(null); setShowFavoritesOnly(false); }}
          onShowWorldCup={() => { setShowWorldCup(true); setShowFootballHighlights(false); setSelectedCountry(null); setSelectedCategory(null); setShowFavoritesOnly(false); }}
          onShowWorldView={() => { setShowWorldCup(false); setShowFootballHighlights(false); setSelectedCountry(null); setSelectedCategory(null); setShowFavoritesOnly(false); setView('countries'); }}
          isDark={isDark}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header
            mode={mode}
            setMode={handleModeChange}
            selectedCountry={selectedCountry}
            selectedCategory={selectedCategory}
            metadata={metadata}
            onRandomChannel={handleRandomChannel}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            showFootballHighlights={showFootballHighlights}
            showWorldCup={showWorldCup}
            isDark={isDark}
          />

          {/* Metadata loading skeleton */}
          {metadataLoading && !error && (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#6C84E8]/30 border-t-[#6C84E8] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[10px] sm:text-xs text-[#6C84E8]/60 font-medium">Loading channels...</p>
              </div>
            </div>
          )}

          {/* Error banner — clean blue background */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 sm:px-6 py-2.5 sm:py-3"
              style={{
                background: '#E8EDFF',
                borderBottom: '1px solid rgba(108,132,232,0.1)',
              }}
            >
              <p className="text-[10px] sm:text-xs text-[#6C84E8] text-center font-medium">{error}</p>
            </motion.div>
          )}

          {/* Channel list / empty state / World Cup section / Football Highlights section */}
          {!metadataLoading && (
            showFootballHighlights && !selectedCountry && !selectedCategory && !showFavoritesOnly ? (
              <FootballHighlights
                mode={mode}
                onChannelSelect={handleChannelSelect}
                onClose={() => setShowFootballHighlights(false)}
                isDark={isDark}
                isCosmic={bgTheme === 'cosmic'}
              />
            ) : showWorldCup && !selectedCountry && !selectedCategory && !showFavoritesOnly ? (
              <WorldCupSection
                mode={mode}
                onChannelSelect={handleChannelSelect}
                onClose={() => setShowWorldCup(false)}
              />
            ) : (
              <ChannelList
                mode={mode}
                view={view}
                selectedCountry={selectedCountry}
                selectedCategory={selectedCategory}
                setSelectedCountry={setSelectedCountry}
                metadata={metadata}
                channels={channels}
                loading={loading}
                searchQuery={searchQuery}
                showFavoritesOnly={showFavoritesOnly}
                favoriteIds={favorites}
                currentChannel={currentChannel}
                onChannelSelect={handleChannelSelect}
                onShowWorldCup={() => setShowWorldCup(true)}
                onShowFootballHighlights={() => { setShowFootballHighlights(true); setShowWorldCup(false); }}
                isDark={isDark}
              />
            )
          )}
          {/* Player */}
          {isPlayerOpen && currentChannel && (
            <Player
              channel={currentChannel}
              isFavorite={isFavorite(currentChannel.nanoid)}
              onToggleFavorite={toggleFavorite}
              onClose={handleClosePlayer}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function OmniPlayPage() {
  return (
    <BackgroundThemeProvider>
      <FavoritesProvider>
        <OmniPlayApp />
      </FavoritesProvider>
    </BackgroundThemeProvider>
  );
}
