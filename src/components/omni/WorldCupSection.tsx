'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, MapPin, Calendar, Tv, Radio, ChevronRight, Zap, Star, Users, Globe,
  Flame, Clock, Landmark, Crown, Target, Sparkles, Play, Signal, Search,
} from 'lucide-react';
import { type Channel, type Mode, countryCodeToFlag, LANGUAGE_NAMES } from '@/lib/famelack-types';

interface WorldCupSectionProps {
  mode: Mode;
  onChannelSelect: (channel: Channel) => void;
  onClose: () => void;
}

const SPORTS_CHANNEL_KEYWORDS = [
  'sports', 'sport', 'esport', 'fox sport', 'espn', 'bbc sport',
  'sky sport', 'bein', 'canal+', 'sport tv', 'super sport',
  'eurosport', 'nbc sport', 'tnt sport', 'dsport', 'star sport',
  'sported', 'arena sport', 'sportklub', 'dazn',
];

const HOST_COUNTRIES = [
  { code: 'us', name: 'United States', cities: 11, venues: ['MetLife Stadium', 'SoFi Stadium', 'AT&T Stadium', 'Mercedes-Benz Stadium', 'NRG Stadium', 'Lumen Field', "Levi's Stadium", 'Hard Rock Stadium', 'Lincoln Financial Field', 'Gillette Stadium', 'Arrowhead Stadium'] },
  { code: 'mx', name: 'Mexico', cities: 3, venues: ['Estadio Azteca', 'Estadio Akron', 'Estadio BBVA'] },
  { code: 'ca', name: 'Canada', cities: 2, venues: ['BMO Field', 'BC Place'] },
];

const TOURNAMENT_START = new Date('2026-06-11T00:00:00Z');

const SCHEDULE_PHASES = [
  { phase: 'Group Stage', dates: 'Jun 11 \u2013 Jun 27', matches: 80, desc: '16 groups of 3 teams. Top 2 advance to knockout.' },
  { phase: 'Round of 32', dates: 'Jun 30 \u2013 Jul 3', matches: 16, desc: 'Single-elimination knockout begins.' },
  { phase: 'Round of 16', dates: 'Jul 4 \u2013 Jul 7', matches: 8, desc: 'Win or go home \u2014 no second chances.' },
  { phase: 'Quarter-Finals', dates: 'Jul 10 \u2013 Jul 12', matches: 4, desc: 'The final eight battle for a semifinal spot.' },
  { phase: 'Semi-Finals', dates: 'Jul 14 \u2013 Jul 15', matches: 2, desc: 'Two matches that define the tournament.' },
  { phase: 'Third-Place', date: 'Jul 18', matches: 1, desc: 'Bronze medal match in Atlanta.' },
  { phase: 'Final', date: 'Jul 19', matches: 1, desc: 'The biggest match in football \u2014 MetLife Stadium, New Jersey.' },
];

const TOP_PLAYERS = [
  { name: 'Kylian Mbappe', country: 'fr', team: 'France', position: 'Forward', flag: '\u{1F1EB}\u{1F1F7}', rating: 97 },
  { name: 'Erling Haaland', country: 'no', team: 'Norway', position: 'Striker', flag: '\u{1F1F3}\u{1F1F4}', rating: 96 },
  { name: 'Vinicius Jr', country: 'br', team: 'Brazil', position: 'Winger', flag: '\u{1F1E7}\u{1F1F7}', rating: 95 },
  { name: 'Jude Bellingham', country: 'gb', team: 'England', position: 'Midfielder', flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', rating: 94 },
  { name: 'Rodri', country: 'es', team: 'Spain', position: 'Midfielder', flag: '\u{1F1EA}\u{1F1F8}', rating: 93 },
  { name: 'Florian Wirtz', country: 'de', team: 'Germany', position: 'Midfielder', flag: '\u{1F1E9}\u{1F1EA}', rating: 92 },
];

const TOP_TEAMS = [
  { name: 'Argentina', code: 'ar', ranking: 1, trophies: 3, flag: countryCodeToFlag('ar'), recent: '2022 World Cup Winners' },
  { name: 'France', code: 'fr', ranking: 2, trophies: 2, flag: countryCodeToFlag('fr'), recent: '2022 Runners-up' },
  { name: 'England', code: 'gb', ranking: 3, trophies: 1, flag: countryCodeToFlag('gb'), recent: 'Euro 2024 Runners-up' },
  { name: 'Brazil', code: 'br', ranking: 4, trophies: 5, flag: countryCodeToFlag('br'), recent: 'Copa America 2024 QF' },
  { name: 'Spain', code: 'es', ranking: 5, trophies: 1, flag: countryCodeToFlag('es'), recent: 'Euro 2024 Winners' },
  { name: 'Germany', code: 'de', ranking: 6, trophies: 4, flag: countryCodeToFlag('de'), recent: 'Euro 2024 QF' },
  { name: 'Portugal', code: 'pt', ranking: 7, trophies: 0, flag: countryCodeToFlag('pt'), recent: 'Euro 2024 QF' },
  { name: 'Netherlands', code: 'nl', ranking: 8, trophies: 0, flag: countryCodeToFlag('nl'), recent: 'Euro 2024 Semis' },
];

const CONFEDERATIONS = [
  { name: 'UEFA (Europe)', teams: 16, color: '#3498db' },
  { name: 'CAF (Africa)', teams: 9, color: '#e67e22' },
  { name: 'CONMEBOL (S. America)', teams: 6, color: '#27ae60' },
  { name: 'CONCACAF (N. America)', teams: 6, color: '#e74c3c' },
  { name: 'AFC (Asia)', teams: 8, color: '#f1c40f' },
  { name: 'OFC (Oceania)', teams: 1, color: '#9b59b6' },
  { name: 'Hosts', teams: 3, color: '#1abc9c' },
];

/* #2: FOOTBALL CHANNELS — verified real broadcasters (famelack API + YouTube live).
    Only channels confirmed to exist in the famelack sports category or direct YouTube links.
    Organized by country within each competition. TV channels first, YouTube last. */
const FOOTBALL_COMPS = [
  {
    name: 'FIFA World Cup 2026', icon: '🏆',
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
];

/* #3: FLOATING PLAYER IMAGE CONFIGS */
const FLOATING_PLAYERS = Array.from({ length: 14 }, (_, i) => ({
  src: `/characters/player${i + 1}.jpg`,
  left: `${3 + (i % 7) * 14}%`,
  delay: `${i * 1.6}s`,
  duration: `${18 + (i % 6) * 3}s`,
  size: 40 + (i % 5) * 10,
}));

/* #4: LIVE MATCH TICKER DATA — status: 'live' | 'ft' | 'upcoming' */
const TICKER_MATCHES = [
  { home: 'Argentina', hf: '\u{1F1E6}\u{1F1F7}', away: 'Portugal', af: '\u{1F1F5}\u{1F1F9}', comp: 'Friendly', status: 'live', min: "67'", score: '2 - 1' },
  { home: 'Man City', hf: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', away: 'Real Madrid', af: '\u{1F1EA}\u{1F1F8}', comp: 'UCL', status: 'live', min: "34'", score: '1 - 1' },
  { home: 'Barcelona', hf: '\u{1F1EA}\u{1F1F8}', away: 'Bayern', af: '\u{1F1E9}\u{1F1EA}', comp: 'UCL', status: 'live', min: 'HT', score: '0 - 0' },
  { home: 'Liverpool', hf: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', away: 'PSG', af: '\u{1F1EB}\u{1F1F7}', comp: 'UCL', status: 'upcoming', min: '20:45', score: 'vs' },
  { home: 'Brazil', hf: '\u{1F1E7}\u{1F1F7}', away: 'France', af: '\u{1F1EB}\u{1F1F7}', comp: 'WC 2026', status: 'live', min: "55'", score: '1 - 2' },
  { home: 'Dortmund', hf: '\u{1F1E9}\u{1F1EA}', away: 'Atletico', af: '\u{1F1EA}\u{1F1F8}', comp: 'UCL', status: 'ft', min: 'FT', score: '3 - 2' },
  { home: 'Arsenal', hf: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', away: 'Inter', af: '\u{1F1EE}\u{1F1F9}', comp: 'UCL', status: 'upcoming', min: '21:00', score: 'vs' },
];

export default function WorldCupSection({ mode, onChannelSelect, onClose }: WorldCupSectionProps) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [sportsChannels, setSportsChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [featuredChannels, setFeaturedChannels] = useState<Channel[]>([]);
  const [activeHostTab, setActiveHostTab] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [floatingVisible, setFloatingVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tickerContainerRef = useRef<HTMLDivElement>(null);

  /* Countdown */
  useEffect(() => {
    function tick() {
      const dist = TOURNAMENT_START.getTime() - Date.now();
      if (dist > 0) setCountdown({
        days: Math.floor(dist / 86400000),
        hours: Math.floor((dist % 86400000) / 3600000),
        minutes: Math.floor((dist % 3600000) / 60000),
        seconds: Math.floor((dist % 60000) / 1000),
      });
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

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
          const scored = channels.map(ch => {
            const n = ch.name.toLowerCase();
            let s = 0;
            if (SPORTS_CHANNEL_KEYWORDS.some(kw => n.includes(kw))) s += 3;
            if (n.includes('football') || n.includes('soccer') || n.includes('futbol') || n.includes('futebol')) s += 5;
            if (n.includes('fox') || n.includes('espn') || n.includes('bbc') || n.includes('sky')) s += 2;
            if (n.includes('live') || n.includes('hd')) s += 1;
            return { channel: ch, score: s };
          });
          scored.sort((a, b) => b.score - a.score);
          setFeaturedChannels(scored.slice(0, 12).map(s => s.channel));
        }
      } catch { /* empty */ } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSports();
    return () => { cancelled = true; };
  }, [mode]);

  /* Pause floating players when WorldCup section is off-screen */
  useEffect(() => {
    const el = tickerContainerRef.current?.parentElement;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { setFloatingVisible(entry.isIntersecting); },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Tab visibility — pause all animations when tab hidden */
  useEffect(() => {
    const handler = () => {
      document.documentElement.style.animationPlayState = document.hidden ? 'paused' : 'running';
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  /* Ticker uses pure CSS animation — no JS interval needed */

  const totalChannels = useMemo(() => sportsChannels.length, [sportsChannels]);

  const getMatchedChannel = useCallback((terms: string[]): Channel | null => {
    for (const term of terms) {
      const m = sportsChannels.find(c => c.name.toLowerCase().includes(term));
      if (m) return m;
    }
    return null;
  }, [sportsChannels]);

  /* Competition-aware channel finder for ticker matches */
  const getChannelForComp = useCallback((comp: string): Channel | null => {
    const compMap: Record<string, string[]> = {
      'EPL': ['sky sport', 'nbc sport', 'bein sport', 'super sport'],
      'UCL': ['tnt sport', 'cbs sport', 'bein sport', 'dazn'],
      'Champions League': ['tnt sport', 'cbs sport', 'bein sport', 'dazn'],
      'La Liga': ['movistar', 'bein sport', 'espn', 'canal'],
      'Serie A': ['sky sport', 'dazn', 'bein sport', 'espn'],
      'Bundesliga': ['sky sport', 'espn', 'dazn', 'bein sport'],
      'WC 2026': ['fox sport', 'telemundo', 'bbc sport', 'bein sport'],
      'Friendly': ['sky sport', 'espn', 'bbc sport', 'fox sport'],
    };
    const terms = compMap[comp];
    if (terms) return getMatchedChannel(terms);
    return getMatchedChannel(['sky sport', 'bein sport', 'espn', 'bbc sport', 'fox sport']);
  }, [getMatchedChannel]);

  return (
    <div className="flex-1 overflow-y-auto omni-scrollbar relative">

      {/* #3: FLOATING CHARACTER ANIMATIONS — paused when off-screen */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5, animationPlayState: floatingVisible ? 'running' : 'paused' }}>
        {FLOATING_PLAYERS.slice(0, 8).map((p, i) => (
          <div key={i} className="absolute" style={{
            left: p.left, bottom: '-80px', width: p.size,
            animation: `omniFloatUp ${p.duration} ${p.delay} linear infinite`,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" loading="lazy" decoding="async" className="w-full rounded-xl" style={{
              filter: 'drop-shadow(0 0 14px rgba(108,132,232,0.45)) brightness(1.05)',
              animation: `omniFloatFade ${p.duration} ${p.delay} linear infinite`,
            }} />
          </div>
        ))}
      </div>

      {/* #1: STICKY HERO (video + countdown + #4 ticker) */}
      <div className="sticky top-0 z-30">
        {/* Hero Banner */}
        <div className="relative overflow-hidden" style={{ minHeight: '280px', background: 'linear-gradient(135deg, #0d1117 0%, #161b22 30%, #0d2137 60%, #0d1117 100%)' }}>
          {/* Video */}
          <div className="absolute inset-0 overflow-hidden">
            <video ref={videoRef} autoPlay muted loop playsInline preload="none"
              onLoadedData={() => setVideoLoaded(true)}
              className="absolute inset-0 w-full h-full object-cover scale-110"
              style={{ opacity: videoLoaded ? 0.6 : 0, transition: 'opacity 1.5s ease-in-out', filter: 'saturate(1.2) brightness(0.8)' }}>
              <source src="/videos/fifa-hero.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(8,8,20,0.92) 0%, rgba(8,8,20,0.6) 35%, rgba(8,8,20,0.4) 65%, rgba(8,8,20,0.95) 100%)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(8,8,20,0.75) 100%)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,163,23,0.12) 0%, transparent 70%)' }} />
          </div>

          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} className="absolute rounded-full"
                initial={{ opacity: 0, y: Math.random() * 200 }}
                animate={{ opacity: [0, 0.35, 0], y: [0, -50 - Math.random() * 40], x: [0, (Math.random() - 0.5) * 25] }}
                transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: 'easeOut' }}
                style={{ width: 2 + Math.random() * 2, height: 2 + Math.random() * 2, left: `${10 + Math.random() * 80}%`, bottom: `${Math.random() * 30}%`, background: i % 3 === 0 ? '#E8A317' : i % 3 === 1 ? '#6C84E8' : '#ffffff' }}
              />
            ))}
          </div>

          {/* Countdown content */}
          <div className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 text-center">
            {/* FIFA 2026 Mascot */}
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className="flex items-center justify-center mb-3 sm:mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fifa-mascot.png" alt="FIFA 2026 Mascot" className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-lg object-contain" loading="eager" style={{ filter: 'drop-shadow(0 4px 24px rgba(232,163,23,0.5))' }} />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              FIFA World Cup{' '}
              <span className="inline-block" style={{ background: 'linear-gradient(135deg, #E8A317, #FFD700, #E8A317)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                2026
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="text-xs sm:text-sm text-white/50 mt-1 sm:mt-1.5 font-medium tracking-wide">
              United States &middot; Mexico &middot; Canada
            </motion.p>

            {/* Countdown boxes */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hrs' },
                { value: countdown.minutes, label: 'Min' },
                { value: countdown.seconds, label: 'Sec' },
              ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                    <span className="text-base sm:text-2xl font-bold text-white tabular-nums">{String(unit.value).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-white/40 mt-1 uppercase tracking-wider font-medium">{unit.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3 sm:gap-5 mt-4 sm:mt-5">
              {[
                { icon: <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: '48 Teams' },
                { icon: <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: '104 Matches' },
                { icon: <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: '16 Venues' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-1 sm:gap-1.5 text-white/50">
                  {stat.icon}
                  <span className="text-[9px] sm:text-[11px] font-medium">{stat.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* #4: LIVE MATCH TICKER */}
        <div className="relative overflow-hidden" style={{
          background: 'linear-gradient(90deg, rgba(10,12,28,0.97), rgba(14,16,38,0.97))',
          borderTop: '1px solid rgba(232,163,23,0.12)',
          borderBottom: '1px solid rgba(232,163,23,0.12)',
        }}>
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-2.5 flex-shrink-0">
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-red-500 block" />
                <span className="w-2 h-2 rounded-full bg-red-500 absolute animate-ping" style={{ animationDuration: '1.2s' }} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-wider">Live Football</span>
            </div>
            <div className="w-px h-5 flex-shrink-0" style={{ background: 'rgba(232,163,23,0.2)' }} />
            <div ref={tickerContainerRef} className="flex-1 overflow-hidden">
              <div className="flex gap-2 py-2 whitespace-nowrap" style={{ animation: 'omniTickerScroll 25s linear infinite' }}>
                {[...TICKER_MATCHES, ...TICKER_MATCHES].map((m, i) => {
                  const matched = getChannelForComp(m.comp);
                  const isLive = m.status === 'live';
                  const isFT = m.status === 'ft';
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.95 }}
                      onClick={() => { if (matched) onChannelSelect(matched); }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-all hover:bg-white/[0.08]"
                      style={{ background: isLive ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)', border: isLive ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
                      {isLive && (
                        <span className="flex items-center justify-center flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute animate-ping" style={{ animationDuration: '1s' }} />
                        </span>
                      )}
                      {isFT && (
                        <span className="text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(156,163,175,0.2)', color: '#9ca3af' }}>FT</span>
                      )}
                      {!isLive && !isFT && (
                        <span className="text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>SOON</span>
                      )}
                      <span className="text-[10px]">{m.hf}</span>
                      <span className="text-[9px] sm:text-[10px] text-white font-bold">{m.home}</span>
                      <span className="text-[9px] sm:text-[10px] font-extrabold px-1 py-0.5 rounded" style={{ background: isLive ? 'rgba(239,68,68,0.15)' : isFT ? 'rgba(156,163,175,0.12)' : 'rgba(34,197,94,0.12)', color: isLive ? '#f87171' : isFT ? '#9ca3af' : '#4ade80' }}>{m.score}</span>
                      <span className="text-[9px] sm:text-[10px] text-white font-bold">{m.away}</span>
                      <span className="text-[10px]">{m.af}</span>
                      <span className="text-[8px] font-medium" style={{ color: isLive ? 'rgba(248,113,113,0.7)' : isFT ? 'rgba(156,163,175,0.4)' : 'rgba(74,222,128,0.6)' }}>{m.min}</span>
                      <span className="text-[7px] px-1 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(108,132,232,0.15)', color: '#6C84E8' }}>{m.comp}</span>
                      {matched && <Play className="w-2.5 h-2.5 text-white/25 ml-0.5" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT (slides behind sticky hero) */}
      <div className="relative z-10 omni-glass-bg">

        {/* #2: CURATED FOOTBALL CHANNELS */}
        <div className="px-3 sm:px-4 pt-4 sm:pt-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mb-3">
            <Signal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8A317]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Football Channels</h2>
            <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(232,163,23,0.1)', color: '#E8A317' }}>Live &amp; Upcoming</span>
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
                    <motion.button key={bc.name}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + ci * 0.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (hasUrl) window.open((bc as { url: string }).url, '_blank');
                        else if (matched) onChannelSelect(matched);
                      }}
                      className="flex-shrink-0 rounded-xl overflow-hidden text-left transition-all"
                      style={{ width: '155px', opacity: 1, cursor: 'pointer' }}>
                      <div className="relative h-[58px] flex items-center justify-between px-3" style={{ background: comp.gradient }}>
                        <div>
                          <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight">{bc.name}</p>
                          <p className="text-[8px] text-white/50 mt-0.5 font-medium">{hasUrl ? 'Watch on YouTube' : matched ? 'Watch Now' : 'Search Online'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span className="text-sm">{countryCodeToFlag(bc.country)}</span>
                        </div>
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute animate-ping" style={{ animationDuration: '1.5s' }} />
                        </div>
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between" style={{
                        background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)',
                        borderTop: `2px solid ${comp.accent}`,
                      }}>
                        <span className="text-[8px] font-bold uppercase tracking-wider" style={{
                          color: hasUrl ? '#ef4444' : matched ? '#6C84E8' : '#9ca3af',
                          background: hasUrl ? '#fef2f2' : matched ? '#E8EDFF' : '#f5f7fa',
                          padding: '2px 6px', borderRadius: '4px',
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

        {/* TOP PLAYERS */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-2 mb-3">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8A317]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Stars to Watch</h2>
            <Sparkles className="w-3 h-3 text-[#E8A317]/60" />
          </motion.div>
          <div className="flex gap-2 overflow-x-auto pb-2 omni-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {TOP_PLAYERS.map((player, i) => (
              <motion.div key={player.name}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 + i * 0.07 }}
                className="flex-shrink-0 w-[140px] sm:w-[160px] rounded-xl sm:rounded-2xl p-3 sm:p-3.5"
                style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{player.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold text-[#1a1a2e] truncate">{player.name}</p>
                    <p className="text-[8px] sm:text-[9px] text-[#9ca3af]">{player.position}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] sm:text-[9px] text-[#6b7280] font-medium">{player.team}</span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: '#E8EDFF', color: '#6C84E8' }}>{player.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TOP TEAMS */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex items-center gap-2 mb-3">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8A317]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Top Ranked Teams</h2>
          </motion.div>
          <div className="grid grid-cols-2 gap-2">
            {TOP_TEAMS.slice(0, 6).map((team, i) => (
              <motion.div key={team.code}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75 + i * 0.06 }}
                className="rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5"
                style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="text-xl sm:text-2xl">{team.flag}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-[#1a1a2e]">{team.name}</p>
                  <p className="text-[8px] sm:text-[9px] text-[#9ca3af] truncate">{team.recent}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[9px] sm:text-[10px] font-bold" style={{ color: i < 3 ? '#E8A317' : '#9ca3af' }}>#{team.ranking}</span>
                  {team.trophies > 0 && <p className="text-[8px] text-[#E8A317]/70">{team.trophies}x Trophy</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* HOST NATIONS */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex items-center gap-2 mb-3">
            <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8A317]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Venues &amp; Hosts</h2>
          </motion.div>
          <div className="flex gap-1.5 mb-3 p-1 rounded-xl" style={{ background: '#f0f2f5' }}>
            {HOST_COUNTRIES.map((country, i) => (
              <motion.button key={country.code} onClick={() => setActiveHostTab(i)} whileTap={{ scale: 0.97 }}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 ${activeHostTab === i ? 'omni-pill-active' : 'text-[#6b7280] hover:text-[#2D2D44]'}`}>
                <span className="text-sm">{countryCodeToFlag(country.code)}</span>
                <span className="hidden sm:inline">{country.name.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeHostTab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl sm:rounded-2xl overflow-hidden"
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{countryCodeToFlag(HOST_COUNTRIES[activeHostTab].code)}</span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#1a1a2e]">{HOST_COUNTRIES[activeHostTab].name}</p>
                    <p className="text-[9px] sm:text-[10px] text-[#9ca3af]">{HOST_COUNTRIES[activeHostTab].venues.length} stadium venues</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {HOST_COUNTRIES[activeHostTab].venues.map((venue, vi) => (
                    <div key={vi} className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: vi === 0 || vi === (activeHostTab === 0 ? 10 : 2) ? 'rgba(232,163,23,0.06)' : '#f5f7fa' }}>
                      <MapPin className={`w-3 h-3 flex-shrink-0 ${vi === 0 || vi === (activeHostTab === 0 ? 10 : 2) ? 'text-[#E8A317]' : 'text-[#9ca3af]'}`} />
                      <span className="text-[9px] sm:text-[10px] text-[#1a1a2e] font-medium truncate">{venue}</span>
                      {(vi === 0 || vi === (activeHostTab === 0 ? 10 : 2)) && (
                        <span className="text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0" style={{ background: 'rgba(232,163,23,0.1)', color: '#E8A317' }}>
                          {vi === 0 ? 'OPENING' : 'FINAL'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #E8A317 50%, transparent 100%)' }} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* SCHEDULE */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6C84E8]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Tournament Schedule</h2>
          </motion.div>
          <div className="space-y-1.5">
            {SCHEDULE_PHASES.map((phase, i) => (
              <motion.div key={phase.phase}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.05 }}
                className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl"
                style={{ background: i === SCHEDULE_PHASES.length - 1 ? 'linear-gradient(135deg, rgba(232,163,23,0.08) 0%, rgba(232,163,23,0.02) 100%)' : '#ffffff', border: i === SCHEDULE_PHASES.length - 1 ? '1px solid rgba(232,163,23,0.15)' : '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex flex-col items-center pt-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${i === SCHEDULE_PHASES.length - 1 ? 'bg-[#E8A317]' : 'bg-[#6C84E8]/30'}`} style={i === SCHEDULE_PHASES.length - 1 ? { boxShadow: '0 0 8px rgba(232,163,23,0.4)' } : {}} />
                  {i < SCHEDULE_PHASES.length - 1 && <div className="w-px h-6 mt-1" style={{ background: 'rgba(108,132,232,0.15)' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-[10px] sm:text-xs font-bold ${i === SCHEDULE_PHASES.length - 1 ? 'text-[#E8A317]' : 'text-[#1a1a2e]'}`}>
                      {i === SCHEDULE_PHASES.length - 1 && <Crown className="w-3 h-3 inline mr-0.5" />}
                      {phase.phase}
                    </p>
                    {i === SCHEDULE_PHASES.length - 1 && <Target className="w-3 h-3 text-[#E8A317]/60" />}
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-[#6C84E8] font-medium mt-0.5">{phase.dates || phase.date}</p>
                  <p className="text-[8px] sm:text-[9px] text-[#9ca3af] mt-0.5 leading-relaxed">{phase.desc}</p>
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0" style={{ background: '#E8EDFF', color: '#6C84E8' }}>{phase.matches}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* QUALIFYING CONFEDERATIONS */}
        <div className="px-3 sm:px-4 pt-5 sm:pt-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
            className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3090A8]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Qualifying Confederations</h2>
            <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: '#E8EDFF', color: '#6C84E8' }}>48 slots</span>
          </motion.div>
          <div className="rounded-xl sm:rounded-2xl overflow-hidden p-3" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="space-y-2">
              {CONFEDERATIONS.map((conf, i) => (
                <div key={conf.name} className="flex items-center gap-2">
                  <div className="w-full rounded-lg overflow-hidden h-2 sm:h-2.5" style={{ background: '#f0f2f5' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(conf.teams / 49) * 100}%` }} transition={{ duration: 0.8, delay: 1.0 + i * 0.1 }}
                      className="h-full rounded-lg" style={{ background: conf.color }} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#1a1a2e] w-5 text-right flex-shrink-0">{conf.teams}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
              {CONFEDERATIONS.map((conf) => (
                <div key={conf.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: conf.color }} />
                  <span className="text-[8px] sm:text-[9px] text-[#6b7280] font-medium">{conf.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ALL SPORTS CHANNELS (from API) */}
        {mode === 'tv' && (
          <div className="px-3 sm:px-4 pt-5 sm:pt-6 pb-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6C84E8]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">All Sports Channels</h2>
                {totalChannels > 0 && <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#E8EDFF', color: '#6C84E8' }}>{totalChannels}</span>}
              </div>
            </motion.div>
            {loading && (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="h-14 sm:h-16 rounded-xl sm:rounded-2xl omni-shimmer" />
                ))}
              </div>
            )}
            <AnimatePresence>
              {!loading && featuredChannels.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  {featuredChannels.map((channel, index) => (
                    <motion.button key={channel.nanoid}
                      initial={{ opacity: 0, x: -12, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4), ease: [0.4, 0, 0.2, 1] }}
                      onClick={() => onChannelSelect(channel)}
                      className="w-full flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3.5 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-left group transition-all duration-200"
                      style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-sm transition-all" style={{ background: '#f5f7fa', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <span className="text-sm sm:text-lg">{countryCodeToFlag(channel.country)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-[#1a1a2e] truncate font-semibold">{channel.name}</p>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                          {channel.languages.slice(0, 2).map(lang => (
                            <span key={lang} className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium" style={{ background: '#E8EDFF', color: '#6C84E8' }}>{LANGUAGE_NAMES[lang] || lang}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="text-[8px] sm:text-[9px] font-bold uppercase text-red-500 tracking-wider">LIVE</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#d1d5db] group-hover:text-[#6C84E8] transition-colors flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              )}
            </AnimatePresence>
            {!loading && featuredChannels.length === 0 && <div className="text-center py-8"><p className="text-xs text-[#9ca3af]">No sports channels available</p></div>}
          </div>
        )}

        {/* BROADCAST INFO */}
        <div className="px-3 sm:px-4 pb-4 sm:pb-6">
          <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E8A317]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#1a1a2e]">Official Broadcasters</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { flag: '\u{1F1FA}\u{1F1F8}', name: 'Fox Sports / Telemundo' }, { flag: '\u{1F1EC}\u{1F1E7}', name: 'BBC / ITV' },
                  { flag: '\u{1F1E7}\u{1F1F7}', name: 'TV Globo' }, { flag: '\u{1F1EB}\u{1F1F7}', name: 'TF1 / beIN Sports' },
                  { flag: '\u{1F1EA}\u{1F1F8}', name: 'RTVE / Movistar+' }, { flag: '\u{1F1E9}\u{1F1EA}', name: 'ARD / ZDF' },
                  { flag: '\u{1F1EF}\u{1F1F5}', name: 'NHK / Fuji TV' }, { flag: '\u{1F1EE}\u{1F1F3}', name: 'JioCinema / Sports18' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg" style={{ background: '#f5f7fa' }}>
                    <span className="text-sm">{b.flag}</span>
                    <span className="text-[9px] sm:text-[10px] text-[#1a1a2e] font-medium truncate">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #E8A317 50%, transparent 100%)' }} />
          </div>
        </div>

        {/* BROWSE ALL BUTTON */}
        <div className="px-3 sm:px-4 pb-8 sm:pb-10">
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
            whileTap={{ scale: 0.97 }} onClick={onClose}
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, #6C84E8 0%, #8B6CC4 100%)', boxShadow: '0 4px 16px rgba(108,132,232,0.3)' }}>
            {mode === 'tv' ? <Tv className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
            Browse All Channels
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* CSS KEYFRAMES FOR FLOATING ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes omniTickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes omniFloatUp {
          0% { transform: translateY(0) scale(1) rotate(-2deg); }
          50% { transform: translateY(-55vh) scale(1.04) rotate(1deg); }
          100% { transform: translateY(-115vh) scale(1.08) rotate(-1deg); }
        }
        @keyframes omniFloatFade {
          0% { opacity: 0; }
          6% { opacity: 0.15; }
          50% { opacity: 0.12; }
          88% { opacity: 0.08; }
          100% { opacity: 0; }
        }
      ` }} />
    </div>
  );
}
