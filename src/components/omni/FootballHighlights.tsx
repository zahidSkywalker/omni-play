'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Play, Signal, Clock, Tv, Star,
  Flame, Clapperboard, Calendar, Search,
} from 'lucide-react';
import { type Channel, type Mode, countryCodeToFlag, LANGUAGE_NAMES } from '@/lib/famelack-types';

interface FootballHighlightsProps {
  mode: Mode;
  onChannelSelect: (channel: Channel) => void;
  onClose: () => void;
  isDark?: boolean;
  isCosmic?: boolean;
}

/* ── Football channel filter keywords ── */
const FOOTBALL_FILTER_KEYWORDS = [
  'football', 'soccer', 'futbol', 'futebol', 'sport',
  'espn', 'fox sport', 'sky sport', 'bein', 'canal+',
  'sport tv', 'super sport', 'eurosport', 'nbc sport',
  'tnt sport', 'dsport', 'star sport', 'arena sport',
  'sportklub', 'bbc sport', 'cbs sport', 'dazn',
];

/* ── Live match ticker data ── */
const FOOTBALL_MATCHES = [
  { home: 'Arsenal', hf: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', away: 'Chelsea', af: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', comp: 'EPL', status: 'live' as const, min: "72'", score: '2 - 1' },
  { home: 'Real Madrid', hf: '\u{1F1EA}\u{1F1F8}', away: 'Barcelona', af: '\u{1F1EA}\u{1F1F8}', comp: 'La Liga', status: 'live' as const, min: "45'+1", score: '1 - 1' },
  { home: 'Bayern Munich', hf: '\u{1F1E9}\u{1F1EA}', away: 'Dortmund', af: '\u{1F1E9}\u{1F1EA}', comp: 'Bundesliga', status: 'upcoming' as const, min: '20:30', score: 'vs' },
  { home: 'PSG', hf: '\u{1F1EB}\u{1F1F7}', away: 'Inter Milan', af: '\u{1F1EE}\u{1F1F9}', comp: 'UCL', status: 'live' as const, min: "58'", score: '0 - 2' },
  { home: 'Juventus', hf: '\u{1F1EE}\u{1F1F9}', away: 'AC Milan', af: '\u{1F1EE}\u{1F1F9}', comp: 'Serie A', status: 'ft' as const, min: 'FT', score: '3 - 1' },
  { home: 'Man City', hf: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', away: 'Liverpool', af: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', comp: 'EPL', status: 'upcoming' as const, min: '17:30', score: 'vs' },
  { home: 'Napoli', hf: '\u{1F1EE}\u{1F1F9}', away: 'Roma', af: '\u{1F1EE}\u{1F1F9}', comp: 'Serie A', status: 'live' as const, min: "33'", score: '1 - 0' },
  { home: 'Atletico', hf: '\u{1F1EA}\u{1F1F8}', away: 'Sevilla', af: '\u{1F1EA}\u{1F1F8}', comp: 'La Liga', status: 'upcoming' as const, min: '21:00', score: 'vs' },
];

/* ── Football competitions — verified real broadcasters (famelack API + YouTube live).
    Only channels confirmed to exist in the famelack sports category or direct YouTube links.
    Organized by country within each competition. TV channels first, YouTube last. ── */
const FOOTBALL_COMPS = [
  {
    name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    gradient: 'linear-gradient(135deg, #38003C 0%, #6B2D8E 100%)', accent: '#6B2D8E',
    channels: [
      /* ── Bangladesh 🇧🇩 ── */
      { name: 'T Sports', country: 'bd', terms: ['t sport'] },
      /* ── Middle East ── */
      { name: 'KTV Sport', country: 'kw', terms: ['ktv sport'] },
      { name: 'KTV Sport Plus', country: 'kw', terms: ['ktv sport plus'] },
      { name: 'Bahrain Sports 1', country: 'bh', terms: ['bahrain sport'] },
      { name: 'Bahrain Sports 2', country: 'bh', terms: ['bahrain sport'] },
      { name: 'Oman Sports TV', country: 'om', terms: ['oman sport'] },
      /* ── USA 🇺🇸 ── */
      { name: 'Fox Sports 1', country: 'us', terms: ['fox sport'] },
      { name: 'NBC Sports NOW', country: 'us', terms: ['nbc sport'] },
      { name: 'CBS Sports HQ', country: 'us', terms: ['cbs sport'] },
      { name: 'CBS Sports Golazo', country: 'us', terms: ['golazo'] },
      { name: 'Fubo Sports Network', country: 'us', terms: ['fubo sport'] },
      /* ── Africa ── */
      { name: 'Sports Connect', country: 'za', terms: ['sport connect'] },
      { name: 'Africa 24 Sport', country: 'fr', terms: ['africa 24 sport'] },
      /* ── YouTube Live Football Streams ── */
      { name: 'Football Live 1', country: 'us', terms: [], url: 'https://www.youtube.com/live/rE2Bfl9KmOU' },
      { name: 'Football Live 2', country: 'us', terms: [], url: 'https://www.youtube.com/live/ORzHdV_NVnQ' },
      { name: 'Football Live 3', country: 'us', terms: [], url: 'https://www.youtube.com/live/ul7Fdnt3BtI' },
      { name: 'Football Live 4', country: 'us', terms: [], url: 'https://www.youtube.com/live/mieW9xgHoqg' },
    ],
  },
  {
    name: 'UEFA Champions League', icon: '⭐',
    gradient: 'linear-gradient(135deg, #0A1628 0%, #14274E 100%)', accent: '#14274E',
    channels: [
      /* ── Bangladesh 🇧🇩 ── */
      { name: 'T Sports', country: 'bd', terms: ['t sport'] },
      /* ── Middle East ── */
      { name: 'KTV Sport', country: 'kw', terms: ['ktv sport'] },
      { name: 'Bahrain Sports 1', country: 'bh', terms: ['bahrain sport'] },
      { name: 'Jordan Sport', country: 'jo', terms: ['jordan sport'] },
      /* ── Europe ── */
      { name: 'Rai Sport', country: 'it', terms: ['rai sport'] },
      { name: 'Sportitalia', country: 'it', terms: ['sportitalia'] },
      { name: 'TVR Sport', country: 'ro', terms: ['tvr sport'] },
      /* ── USA 🇺🇸 ── */
      { name: 'CBS Sports HQ', country: 'us', terms: ['cbs sport'] },
      { name: 'CBS Sports Golazo', country: 'us', terms: ['golazo'] },
      { name: 'Fubo Sports Network', country: 'us', terms: ['fubo sport'] },
      { name: 'Stadium', country: 'us', terms: ['stadium'] },
      /* ── Africa ── */
      { name: 'Sports Connect', country: 'za', terms: ['sport connect'] },
      { name: 'Africa 24 Sport', country: 'fr', terms: ['africa 24 sport'] },
      /* ── YouTube Live Football Streams ── */
      { name: 'Football Live 1', country: 'us', terms: [], url: 'https://www.youtube.com/live/rE2Bfl9KmOU' },
      { name: 'Football Live 2', country: 'us', terms: [], url: 'https://www.youtube.com/live/ORzHdV_NVnQ' },
      { name: 'Football Live 5', country: 'us', terms: [], url: 'https://www.youtube.com/live/ntjJKCjNmcE' },
      { name: 'Football Live 6', country: 'us', terms: [], url: 'https://www.youtube.com/live/Ow4TQOqbId0' },
    ],
  },
  {
    name: 'La Liga', icon: '🇪🇸',
    gradient: 'linear-gradient(135deg, #EE8707 0%, #FF4B44 100%)', accent: '#EE8707',
    channels: [
      /* ── Spain 🇪🇸 (famelack verified) ── */
      { name: 'Real Madrid TV', country: 'es', terms: ['real madrid'] },
      { name: 'Teledeporte', country: 'es', terms: ['teledeporte'] },
      { name: 'Esport3', country: 'es', terms: ['esport3'] },
      { name: 'Gol Classics', country: 'es', terms: ['gol classic'] },
      /* ── Middle East ── */
      { name: 'KTV Sport', country: 'kw', terms: ['ktv sport'] },
      { name: 'Bahrain Sports 1', country: 'bh', terms: ['bahrain sport'] },
      /* ── Americas ── */
      { name: 'Fox Deportes', country: 'us', terms: ['fox deporte'] },
      { name: 'CazeTV', country: 'br', terms: ['cazetv'] },
      { name: 'ITV Deportes', country: 'mx', terms: ['itv deporte'] },
      /* ── Africa ── */
      { name: 'Africa 24 Sport', country: 'fr', terms: ['africa 24 sport'] },
      /* ── YouTube Live Football Streams ── */
      { name: 'Football Live 3', country: 'us', terms: [], url: 'https://www.youtube.com/live/ul7Fdnt3BtI' },
      { name: 'Football Live 7', country: 'us', terms: [], url: 'https://www.youtube.com/live/h0rCsHR8mWc' },
    ],
  },
  {
    name: 'Serie A', icon: '🇮🇹',
    gradient: 'linear-gradient(135deg, #024494 0%, #009BDB 100%)', accent: '#024494',
    channels: [
      /* ── Italy 🇮🇹 (famelack verified) ── */
      { name: 'Rai Sport', country: 'it', terms: ['rai sport'] },
      { name: 'Sportitalia', country: 'it', terms: ['sportitalia'] },
      { name: 'Sportitalia Solocalcio', country: 'it', terms: ['solocalcio'] },
      { name: 'ACI Sport TV', country: 'it', terms: ['aci sport'] },
      { name: 'SuperTennis', country: 'it', terms: ['supertennis'] },
      /* ── USA ── */
      { name: 'CBS Sports Golazo', country: 'us', terms: ['golazo'] },
      { name: 'Fubo Sports Network', country: 'us', terms: ['fubo sport'] },
      /* ── YouTube Live Football Streams ── */
      { name: 'Football Live 4', country: 'us', terms: [], url: 'https://www.youtube.com/live/mieW9xgHoqg' },
      { name: 'Football Live 8', country: 'us', terms: [], url: 'https://www.youtube.com/live/bZCHTzEg5fo' },
    ],
  },
  {
    name: 'Bundesliga', icon: '🇩🇪',
    gradient: 'linear-gradient(135deg, #D20515 0%, #D20515 100%)', accent: '#D20515',
    channels: [
      /* ── Europe ── */
      { name: 'World of Freesports', country: 'de', terms: ['freesport'] },
      { name: 'Red Bull TV', country: 'at', terms: ['red bull'] },
      { name: 'TVR Sport', country: 'ro', terms: ['tvr sport'] },
      /* ── USA ── */
      { name: 'Fox Sports 1', country: 'us', terms: ['fox sport'] },
      { name: 'Fubo Sports Network', country: 'us', terms: ['fubo sport'] },
      /* ── YouTube Live Football Streams ── */
      { name: 'Football Live 2', country: 'us', terms: [], url: 'https://www.youtube.com/live/ORzHdV_NVnQ' },
      { name: 'Football Live 5', country: 'us', terms: [], url: 'https://www.youtube.com/live/ntjJKCjNmcE' },
    ],
  },
  {
    name: 'World Cup', icon: '🏆',
    gradient: 'linear-gradient(135deg, #0d3320 0%, #1a6b3c 100%)', accent: '#1a6b3c',
    channels: [
      /* ── Bangladesh 🇧🇩 ── */
      { name: 'T Sports', country: 'bd', terms: ['t sport'] },
      { name: 'RTA Sport', country: 'af', terms: ['rta sport'] },
      /* ── India 🇮🇳 ── */
      { name: 'DD Sports', country: 'in', terms: ['dd sport'] },
      /* ── Middle East ── */
      { name: 'KTV Sport', country: 'kw', terms: ['ktv sport'] },
      { name: 'KTV Sport Plus', country: 'kw', terms: ['ktv sport plus'] },
      { name: 'Bahrain Sports 1', country: 'bh', terms: ['bahrain sport'] },
      { name: 'Bahrain Sports 2', country: 'bh', terms: ['bahrain sport'] },
      { name: 'Jordan Sport', country: 'jo', terms: ['jordan sport'] },
      { name: 'Oman Sports TV', country: 'om', terms: ['oman sport'] },
      { name: 'Al Iraqia Sport', country: 'iq', terms: ['iraqia sport'] },
      /* ── Morocco 🇲🇦 ── */
      { name: 'Arryadia', country: 'ma', terms: ['arryadia'] },
      { name: 'Arryadia HD1', country: 'ma', terms: ['arryadia hd1'] },
      { name: 'Arryadia HD2', country: 'ma', terms: ['arryadia hd2'] },
      { name: 'Arryadia HD3', country: 'ma', terms: ['arryadia hd3'] },
      /* ── Europe ── */
      { name: 'Rai Sport', country: 'it', terms: ['rai sport'] },
      { name: 'Sportitalia', country: 'it', terms: ['sportitalia'] },
      { name: 'Sportitalia Solocalcio', country: 'it', terms: ['solocalcio'] },
      { name: 'Real Madrid TV', country: 'es', terms: ['real madrid'] },
      { name: 'Teledeporte', country: 'es', terms: ['teledeporte'] },
      { name: 'Esport3', country: 'es', terms: ['esport3'] },
      { name: 'TR Sport', country: 'it', terms: ['tr sport'] },
      { name: 'ACI Sport TV', country: 'it', terms: ['aci sport'] },
      { name: 'Futbol', country: 'tj', terms: ['futbol'] },
      { name: 'QazSport', country: 'kz', terms: ['qazsport'] },
      { name: 'TVR Sport', country: 'ro', terms: ['tvr sport'] },
      { name: 'Suspilne Sport', country: 'ua', terms: ['suspilne sport'] },
      { name: 'Red Bull TV', country: 'at', terms: ['red bull'] },
      { name: 'World of Freesports', country: 'de', terms: ['freesport'] },
      /* ── Americas ── */
      { name: 'TyC Sports', country: 'ar', terms: ['tyc sport'] },
      { name: 'CazeTV', country: 'br', terms: ['cazetv'] },
      { name: 'ITV Deportes', country: 'mx', terms: ['itv deporte'] },
      { name: 'Ovacion TV', country: 'pe', terms: ['ovacion'] },
      { name: 'AS3 Sport TV', country: 've', terms: ['as3 sport'] },
      /* ── USA 🇺🇸 (famelack verified) ── */
      { name: 'Fox Sports 1', country: 'us', terms: ['fox sport'] },
      { name: 'Fox Deportes', country: 'us', terms: ['fox deporte'] },
      { name: 'CBS Sports HQ', country: 'us', terms: ['cbs sport'] },
      { name: 'CBS Sports Golazo', country: 'us', terms: ['golazo'] },
      { name: 'NBC Sports NOW', country: 'us', terms: ['nbc sport'] },
      { name: 'FIFA+ United States', country: 'us', terms: ['fifa+'] },
      { name: 'Fubo Sports Network', country: 'us', terms: ['fubo sport'] },
      { name: 'Stadium', country: 'us', terms: ['stadium'] },
      /* ── Africa ── */
      { name: 'Sports Connect', country: 'za', terms: ['sport connect'] },
      { name: 'Africa 24 Sport', country: 'fr', terms: ['africa 24 sport'] },
      /* ── YouTube Live Football Streams (always available) ── */
      { name: 'Football Live 1', country: 'us', terms: [], url: 'https://www.youtube.com/live/rE2Bfl9KmOU' },
      { name: 'Football Live 2', country: 'us', terms: [], url: 'https://www.youtube.com/live/ORzHdV_NVnQ' },
      { name: 'Football Live 3', country: 'us', terms: [], url: 'https://www.youtube.com/live/ul7Fdnt3BtI' },
      { name: 'Football Live 4', country: 'us', terms: [], url: 'https://www.youtube.com/live/mieW9xgHoqg' },
      { name: 'Football Live 5', country: 'us', terms: [], url: 'https://www.youtube.com/live/ntjJKCjNmcE' },
      { name: 'Football Live 6', country: 'us', terms: [], url: 'https://www.youtube.com/live/Ow4TQOqbId0' },
      { name: 'Football Live 7', country: 'us', terms: [], url: 'https://www.youtube.com/live/h0rCsHR8mWc' },
      { name: 'Football Live 8', country: 'us', terms: [], url: 'https://www.youtube.com/live/bZCHTzEg5fo' },
    ],
  },
];

/* ── Top Football Shows ── */
const FOOTBALL_SHOWS = [
  { name: 'Gold Foot', channel: 'YouTube', schedule: 'Daily', desc: 'Multi-league highlights, skills compilations & top goals', icon: '⚡', url: 'https://www.youtube.com/@GoldFoot' },
  { name: 'Score 808', channel: 'YouTube', schedule: 'Daily', desc: 'Quick daily match recaps from all top leagues', icon: '🎬', url: 'https://www.youtube.com/@score808' },
  { name: 'Football Daily', channel: 'YouTube', schedule: 'Daily', desc: 'Daily football news, transfer updates & match analysis', icon: '⚽', url: 'https://www.youtube.com/@FootballDaily' },
  { name: 'ESPN FC', channel: 'ESPN', schedule: 'Weekdays', desc: 'In-depth analysis, interviews & highlights from ESPN', icon: '📺', url: 'https://www.youtube.com/@ESPNFC' },
  { name: 'Match of the Day', channel: 'BBC', schedule: 'Weekly', desc: 'BBC iconic highlights show — Premier League every weekend', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', url: 'https://www.youtube.com/@MatchOfTheDay' },
  { name: 'beIN SPORTS', channel: 'beIN', schedule: 'Live', desc: 'Live matches, highlights & analysis from beIN SPORTS', icon: '🇦🇪', url: 'https://www.youtube.com/@beinsports' },
  { name: 'CBS Golazo', channel: 'CBS', schedule: 'Daily', desc: 'CBS Sports Golazo — Champions League & world football', icon: '🏆', url: 'https://www.youtube.com/@CBSGolazo' },
  { name: 'GOAL', channel: 'YouTube', schedule: 'Daily', desc: 'Goal.com — breaking news, transfer rumors & highlights', icon: '🏖️', url: 'https://www.youtube.com/@goal' },
  { name: 'Football Live Stream 1', channel: 'YouTube', schedule: '24/7 Live', desc: 'Live football matches, WC 2026 qualifiers & league highlights', icon: '📺', url: 'https://www.youtube.com/live/rE2Bfl9KmOU' },
  { name: 'Football Live Stream 2', channel: 'YouTube', schedule: '24/7 Live', desc: 'Live football action — international friendlies & tournaments', icon: '📺', url: 'https://www.youtube.com/live/ORzHdV_NVnQ' },
  { name: 'Football Live Stream 3', channel: 'YouTube', schedule: '24/7 Live', desc: 'Non-stop live football — WC qualifiers, league matches & analysis', icon: '📺', url: 'https://www.youtube.com/live/ul7Fdnt3BtI' },
  { name: 'Football Live Stream 4', channel: 'YouTube', schedule: '24/7 Live', desc: 'Live football coverage — Premier League, La Liga & more', icon: '📺', url: 'https://www.youtube.com/live/mieW9xgHoqg' },
  { name: 'Football Live Stream 5', channel: 'YouTube', schedule: '24/7 Live', desc: 'Round-the-clock football — live matches & post-match analysis', icon: '📺', url: 'https://www.youtube.com/live/ntjJKCjNmcE' },
  { name: 'Football Live Stream 6', channel: 'YouTube', schedule: '24/7 Live', desc: 'Live football streams — UCL, Serie A & Bundesliga action', icon: '📺', url: 'https://www.youtube.com/live/Ow4TQOqbId0' },
  { name: 'Football Live Stream 7', channel: 'YouTube', schedule: '24/7 Live', desc: 'Live football broadcast — FIFA World Cup & continental cups', icon: '📺', url: 'https://www.youtube.com/live/h0rCsHR8mWc' },
  { name: 'Football Live Stream 8', channel: 'YouTube', schedule: '24/7 Live', desc: 'Live football — Copa America, AFCON & major tournaments', icon: '📺', url: 'https://www.youtube.com/live/bZCHTzEg5fo' },
];

/* ── Competition tag colors ── */
const COMP_COLORS: Record<string, { bg: string; text: string }> = {
  'EPL': { bg: 'rgba(107,45,142,0.12)', text: '#6B2D8E' },
  'La Liga': { bg: 'rgba(238,135,7,0.12)', text: '#EE8707' },
  'UCL': { bg: 'rgba(20,39,78,0.15)', text: '#6C84E8' },
  'Serie A': { bg: 'rgba(2,68,148,0.12)', text: '#024494' },
  'Bundesliga': { bg: 'rgba(210,5,21,0.12)', text: '#D20515' },
  'Ligue 1': { bg: 'rgba(0,99,175,0.12)', text: '#0063AF' },
  'WC 2026': { bg: 'rgba(26,107,60,0.12)', text: '#1a6b3c' },
};

export default function FootballHighlights({ mode, onChannelSelect, onClose, isDark = true, isCosmic = false }: FootballHighlightsProps) {
  const [sportsChannels, setSportsChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeShow, setActiveShow] = useState<string | null>(null);

  /* Fetch sports channels */
  useEffect(() => {
    if (mode !== 'tv') return;
    let cancelled = false;
    async function fetchSports() {
      setLoading(true);
      try {
        const res = await fetch('/api/famelack?type=tv&view=category&id=sports');
        if (res.ok && !cancelled) {
          const data = await res.json();
          const channels: Channel[] = Array.isArray(data) ? data : [];
          setSportsChannels(channels);
        }
      } catch { /* empty */ } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSports();
    return () => { cancelled = true; };
  }, [mode]);

  /* Football-filtered channels from the API */
  const footballChannels = useMemo(() => {
    return sportsChannels.filter(ch => {
      const n = ch.name.toLowerCase();
      return FOOTBALL_FILTER_KEYWORDS.some(kw => n.includes(kw));
    });
  }, [sportsChannels]);

  /* Stats */
  const liveMatchCount = useMemo(() => FOOTBALL_MATCHES.filter(m => m.status === 'live').length, []);
  const totalFootballChannels = useMemo(() => footballChannels.length, [footballChannels]);
  const leaguesCovered = FOOTBALL_COMPS.length;

  /* Channel matching helper */
  const getMatchedChannel = useCallback((terms: string[]): Channel | null => {
    for (const term of terms) {
      const m = sportsChannels.find(c => c.name.toLowerCase().includes(term));
      if (m) return m;
    }
    return null;
  }, [sportsChannels]);

  /* Competition-aware channel finder for Watch Live buttons */
  const getChannelForComp = useCallback((comp: string): Channel | null => {
    const compMap: Record<string, string[]> = {
      'EPL': ['sky sport', 'nbc sport', 'bein sport', 'super sport'],
      'Premier League': ['sky sport', 'nbc sport', 'bein sport', 'super sport'],
      'UCL': ['tnt sport', 'cbs sport', 'bein sport', 'dazn'],
      'Champions League': ['tnt sport', 'cbs sport', 'bein sport', 'dazn'],
      'La Liga': ['movistar', 'bein sport', 'espn', 'canal'],
      'Serie A': ['sky sport', 'dazn', 'bein sport', 'espn'],
      'Bundesliga': ['sky sport', 'espn', 'dazn', 'bein sport'],
      'World Cup': ['fox sport', 'telemundo', 'bbc sport', 'bein sport'],
      'WC 2026': ['fox sport', 'telemundo', 'bbc sport', 'bein sport'],
      'Friendly': ['sky sport', 'espn', 'bbc sport', 'fox sport'],
    };
    const terms = compMap[comp];
    if (terms) return getMatchedChannel(terms);
    return getMatchedChannel(['sky sport', 'bein sport', 'espn', 'bbc sport', 'fox sport']);
  }, [getMatchedChannel]);

  /* Get a generic sports channel for "Watch" buttons on match cards */
  const getGenericSportChannel = useCallback((): Channel | null => {
    return sportsChannels.find(c => {
      const n = c.name.toLowerCase();
      return n.includes('sport') || n.includes('espn') || n.includes('bbc');
    }) || null;
  }, [sportsChannels]);

  return (
    <div className="flex-1 overflow-y-auto omni-scrollbar relative">
      {/* ══════════════════════════════════════════════════
          a) HERO BANNER
          ══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{
        minHeight: '220px',
        background: '#0a0f1a',
      }}>
        {/* Hero background image */}
        <div className="absolute inset-0">
          <picture>
            <source srcSet="/football-hero.webp" type="image/webp" />
            <img
              src="/football-hero.jpg"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
              style={{ objectPosition: 'center 30%' }}
            />
          </picture>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(10,15,26,0.35) 0%, rgba(10,15,26,0.50) 40%, rgba(10,15,26,0.70) 100%)',
          }} />
          {/* Subtle golden radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(232,163,23,0.08) 0%, transparent 70%)',
          }} />
        </div>

        {/* Content */}
        <div className="relative px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 text-center">
          {/* Title — FÜTBOL in calligraphic style */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider"
            style={{
              fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
              fontStyle: 'italic',
              lineHeight: 1.1,
            }}
          >
            <span style={{
              background: 'linear-gradient(135deg, #E8A317 0%, #FFD700 40%, #FFF8DC 50%, #FFD700 60%, #E8A317 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 8px rgba(232,163,23,0.3))',
            }}>
              FÜTBOL
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[10px] sm:text-xs text-white/50 mt-1 font-medium tracking-wide"
          >
            Live matches, highlights &amp; football channels
          </motion.p>

          {/* LIVE indicator */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mt-3"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <span className="relative flex items-center justify-center w-3 h-3">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute inset-0 m-auto animate-ping" style={{ animationDuration: '1.2s' }} />
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-wider">Live Now</span>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-4 sm:gap-6 mt-4"
          >
            {[
              { icon: <Signal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: `${liveMatchCount} Live` },
              { icon: <Tv className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: `${totalFootballChannels} Channels` },
              { icon: <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: `${leaguesCovered} Leagues` },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-1 sm:gap-1.5 text-white/50">
                {stat.icon}
                <span className="text-[9px] sm:text-[11px] font-medium">{stat.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SCROLLABLE CONTENT
          ══════════════════════════════════════════════════ */}
      <div className="relative omni-glass-bg">

        {/* ══════════════════════════════════════════════════
            b) LIVE MATCH CARDS
            ══════════════════════════════════════════════════ */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mb-3"
          >
            <Signal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Live &amp; Upcoming</h2>
            <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            }}>
              {liveMatchCount} LIVE
            </span>
          </motion.div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 omni-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {FOOTBALL_MATCHES.map((match, i) => {
              const isLive = match.status === 'live';
              const isFT = match.status === 'ft';
              const compColor = COMP_COLORS[match.comp] || { bg: 'rgba(108,132,232,0.1)', text: '#6C84E8' };

              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    const ch = getChannelForComp(match.comp);
                    if (ch) onChannelSelect(ch);
                    else window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(match.comp + ' highlights today')}`, '_blank');
                  }}
                  className="flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden text-left transition-all min-w-[200px] sm:min-w-[220px]"
                  style={{
                    background: '#ffffff',
                    border: isLive ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(0,0,0,0.04)',
                    boxShadow: isLive ? '0 4px 12px rgba(239,68,68,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Competition tag + status */}
                  <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                    <span className="text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider" style={{
                      background: compColor.bg, color: compColor.text,
                    }}>
                      {match.comp}
                    </span>
                    {isLive && (
                      <div className="flex items-center gap-1">
                        <span className="relative flex items-center justify-center w-3 h-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute inset-0 m-auto animate-ping" style={{ animationDuration: '1s' }} />
                        </span>
                        <span className="text-[7px] font-bold text-red-500">{match.min}</span>
                      </div>
                    )}
                    {isFT && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{
                        background: 'rgba(156,163,175,0.15)', color: '#9ca3af',
                      }}>FT</span>
                    )}
                    {!isLive && !isFT && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{
                        background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                      }}>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2 h-2" />
                          {match.min}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Match info */}
                  <div className="px-3 py-2.5">
                    {/* Home team */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm leading-none">{match.hf}</span>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#1a1a2e] flex-1 truncate">{match.home}</span>
                    </div>
                    {/* Score */}
                    <div className="flex items-center justify-center my-1.5">
                      <span className="text-sm sm:text-lg font-extrabold tabular-nums px-4 py-1 rounded-lg" style={{
                        background: isLive ? 'rgba(239,68,68,0.08)' : isFT ? 'rgba(156,163,175,0.06)' : 'rgba(34,197,94,0.06)',
                        color: isLive ? '#ef4444' : isFT ? '#9ca3af' : '#22c55e',
                      }}>
                        {match.score}
                      </span>
                    </div>
                    {/* Away team */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm leading-none">{match.af}</span>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#1a1a2e] flex-1 truncate">{match.away}</span>
                    </div>
                  </div>

                  {/* Watch button */}
                  <div className="px-3 pb-3">
                    <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold" style={{
                      background: isLive ? '#6C84E8' : '#f5f7fa',
                      color: isLive ? '#ffffff' : '#6C84E8',
                    }}>
                      <Play className="w-2.5 h-2.5" fill={isLive ? 'currentColor' : 'none'} stroke={isLive ? 'none' : 'currentColor'} />
                      {isLive ? 'Watch Live' : 'Set Reminder'}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            c) FOOTBALL CHANNEL GRID BY LEAGUE
            ══════════════════════════════════════════════════ */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 mb-3"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8A317]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Channels by League</h2>
          </motion.div>

          {FOOTBALL_COMPS.map((comp, ci) => (
            <div key={comp.name} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{comp.icon}</span>
                <h3 className="text-[10px] sm:text-xs font-bold text-[#1a1a2e]">{comp.name}</h3>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.06), transparent)' }} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {comp.channels.map((bc) => {
                  const matched = getMatchedChannel(bc.terms);
                  const hasUrl = 'url' in bc && typeof bc.url === 'string';
                  return (
                    <motion.button
                      key={`${comp.name}-${bc.name}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 + ci * 0.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (hasUrl) window.open((bc as { url: string }).url, '_blank');
                        else if (matched) onChannelSelect(matched);
                      }}
                      className="flex-shrink-0 rounded-xl overflow-hidden text-left transition-all"
                      style={{
                        width: '160px',
                        opacity: 1,
                        cursor: 'pointer',
                      }}
                    >
                      <div className="relative h-[56px] flex items-center justify-between px-3" style={{ background: comp.gradient }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight truncate">{bc.name}</p>
                          <p className="text-[8px] text-white/50 mt-0.5 font-medium">{hasUrl ? 'Watch on YouTube' : matched ? 'Watch Now' : 'Search Online'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2" style={{
                          background: 'rgba(255,255,255,0.12)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                          <span className="text-sm">{countryCodeToFlag(bc.country)}</span>
                        </div>
                        <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-2.5 h-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute inset-0 m-auto animate-ping" style={{ animationDuration: '1.5s' }} />
                        </span>
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between" style={{
                        background: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.04)',
                        borderTop: `2px solid ${comp.accent}`,
                      }}>
                        <span className="text-[8px] font-bold uppercase tracking-wider" style={{
                          color: hasUrl ? '#ef4444' : matched ? '#6C84E8' : '#9ca3af',
                          background: hasUrl ? '#fef2f2' : matched ? '#E8EDFF' : '#f5f7fa',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {hasUrl ? 'YouTube' : matched ? 'Watch' : 'Search'}
                        </span>
                        {hasUrl ? <Play className="w-3 h-3 text-[#ef4444]" fill="currentColor" /> : matched ? <Play className="w-3 h-3 text-[#6C84E8]" fill="currentColor" /> : <Search className="w-3 h-3 text-[#9ca3af]" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            d) ALL FOOTBALL CHANNELS GRID
            ══════════════════════════════════════════════════ */}
        {footballChannels.length > 0 && (
          <div className="px-3 sm:px-4 pt-5 sm:pt-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-between mb-3"
            >
              <div className="flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6C84E8]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">All Football Channels</h2>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                background: '#E8EDFF', color: '#6C84E8',
              }}>
                {footballChannels.length} found
              </span>
            </motion.div>

            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 sm:h-28 rounded-xl sm:rounded-2xl omni-shimmer" />
                ))}
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {footballChannels.slice(0, 24).map((channel, i) => (
                  <motion.button
                    key={channel.nanoid}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.75 + Math.min(i * 0.03, 0.5) }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onChannelSelect(channel)}
                    className="rounded-xl sm:rounded-2xl overflow-hidden text-left transition-all group"
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.04)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Header with flag */}
                    <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                        background: '#f5f7fa',
                        border: '1px solid rgba(0,0,0,0.04)',
                      }}>
                        <span className="text-xs sm:text-sm">{countryCodeToFlag(channel.country)}</span>
                      </div>
                      <p className="text-[9px] sm:text-[11px] font-bold text-[#1a1a2e] truncate leading-tight flex-1">{channel.name}</p>
                    </div>

                    {/* Language badges */}
                    <div className="flex items-center gap-1 px-3 pb-1.5 flex-wrap">
                      {channel.languages.slice(0, 2).map(lang => (
                        <span key={lang} className="text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full font-medium" style={{
                          background: '#E8EDFF', color: '#6C84E8',
                        }}>
                          {LANGUAGE_NAMES[lang] || lang}
                        </span>
                      ))}
                    </div>

                    {/* Watch button */}
                    <div className="px-3 pb-2.5">
                      <div className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-bold group-hover:bg-[#6C84E8] group-hover:text-white transition-all duration-200" style={{
                        background: '#f5f7fa',
                        color: '#6C84E8',
                      }}>
                        <Play className="w-2.5 h-2.5" fill="currentColor" />
                        Watch
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {footballChannels.length > 24 && (
              <div className="text-center mt-3 pb-2">
                <p className="text-[10px] sm:text-xs text-[#9ca3af]">
                  +{footballChannels.length - 24} more channels available via search
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            e) TOP FOOTBALL SHOWS / HIGHLIGHTS SECTION
            ══════════════════════════════════════════════════ */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2 mb-3"
          >
            <Clapperboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8A317]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Top Football Shows</h2>
            <Flame className="w-3 h-3 text-[#E8A317]/60" />
          </motion.div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 omni-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {FOOTBALL_SHOWS.map((show, i) => {
              const showUrl = 'url' in show && typeof (show as Record<string, unknown>).url === 'string' ? (show as Record<string, string>).url : null;
              const matchedShow = showUrl ? null : getMatchedChannel((show as { channel: string }).channel.toLowerCase().split(' ')[0] === 'bbc' ? ['bbc'] : (show as { channel: string }).channel.toLowerCase().includes('sky') ? ['sky sport'] : (show as { channel: string }).channel.toLowerCase().includes('espn') ? ['espn'] : (show as { channel: string }).channel.toLowerCase().includes('bein') ? ['bein'] : (show as { channel: string }).channel.toLowerCase().includes('cbs') ? ['cbs'] : (show as { channel: string }).channel.toLowerCase().includes('fox') ? ['fox sport'] : (show as { channel: string }).channel.toLowerCase().includes('youtube') ? ['sport', 'espn', 'bbc'] : [(show as { channel: string }).channel.toLowerCase().split(' ')[0]]);
              return (
                <motion.button
                  key={show.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 + i * 0.06 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (showUrl) window.open(showUrl, '_blank');
                    else if (matchedShow) onChannelSelect(matchedShow);
                    else setActiveShow(activeShow === show.name ? null : show.name);
                  }}
                  className="flex-shrink-0 w-[200px] sm:w-[230px] rounded-xl sm:rounded-2xl overflow-hidden text-left transition-all"
                  style={{
                    background: '#ffffff',
                    border: activeShow === show.name ? '1px solid rgba(232,163,23,0.3)' : '1px solid rgba(0,0,0,0.04)',
                    boxShadow: activeShow === show.name ? '0 4px 16px rgba(232,163,23,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Show icon strip */}
                  <div className="h-2" style={{
                    background: 'linear-gradient(90deg, #E8A317 0%, #FFD700 50%, #E8A317 100%)',
                  }} />
                  <div className="p-3 sm:p-3.5">
                    {/* Icon + Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl">{show.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-bold text-[#1a1a2e] truncate">{show.name}</p>
                        <p className="text-[8px] sm:text-[9px] text-[#E8A317] font-semibold">{show.channel}</p>
                      </div>
                    </div>
                    {/* Description */}
                    <p className="text-[8px] sm:text-[9px] text-[#6b7280] leading-relaxed mb-2">{show.desc}</p>
                    {/* Schedule + Watch */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-2.5 h-2.5 text-[#6C84E8]" />
                        <span className="text-[8px] sm:text-[9px] font-medium text-[#6C84E8]">{show.schedule}</span>
                      </div>
                      <span className="text-[8px] font-bold" style={{
                        color: showUrl ? '#ef4444' : matchedShow ? '#6C84E8' : '#9ca3af',
                        background: showUrl ? '#fef2f2' : matchedShow ? '#E8EDFF' : '#f5f7fa',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}>
                        {showUrl ? 'YouTube' : matchedShow ? 'Watch' : 'Info'}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
