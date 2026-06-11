// Omni Play — TypeScript interfaces

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo: string;
  category: string;
  country: string;
  tvgId?: string;
  tvgName?: string;
  sourceTag?: string;
  quality?: string;
}

export interface ChannelApiResponse {
  channels: Channel[];
  total: number;
  countries: string[];
  categories: string[];
}

export interface FavoriteItem {
  deviceId: string;
  channelId: string;
  channelName: string;
  addedAt: string;
}

export interface RecentItem {
  deviceId: string;
  channelId: string;
  channelName: string;
  watchedAt: string;
  logo?: string;
  category?: string;
  country?: string;
  url?: string;
}

export type View = 'home' | 'channels' | 'watch' | 'favorites' | 'recent';

export const POPULAR_CATEGORIES = [
  'Sports',
  'News',
  'Kids',
  'Documentary',
  'Music',
  'Entertainment',
  'Movies',
  'Education',
  'Lifestyle',
  'Religious',
  'Shop',
  'General',
];

export const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  UK: '🇬🇧',
  BD: '🇧🇩',
  IN: '🇮🇳',
  PK: '🇵🇰',
  TR: '🇹🇷',
  DE: '🇩🇪',
  FR: '🇫🇷',
  ES: '🇪🇸',
  IT: '🇮🇹',
  BR: '🇧🇷',
  JP: '🇯🇵',
  KR: '🇰🇷',
  CN: '🇨🇳',
  RU: '🇷🇺',
  SA: '🇸🇦',
  AE: '🇦🇪',
  AU: '🇦🇺',
  CA: '🇨🇦',
  MX: '🇲🇽',
  AR: '🇦🇷',
  NL: '🇳🇱',
  SE: '🇸🇪',
  PL: '🇵🇱',
  TH: '🇹🇭',
  VN: '🇻🇳',
  ID: '🇮🇩',
  MY: '🇲🇾',
  PH: '🇵🇭',
  EG: '🇪🇬',
  NG: '🇳🇬',
  KE: '🇰🇪',
  ZA: '🇿🇦',
  CO: '🇨🇴',
  CH: '🇨🇭',
  PT: '🇵🇹',
  GR: '🇬🇷',
  CZ: '🇨🇿',
  RO: '🇷🇴',
  HU: '🇭🇺',
};

export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return '🌐';
  const code = countryCode.toUpperCase().slice(0, 2);
  return COUNTRY_FLAGS[code] || '🌐';
}

/**
 * Infer stream quality from URL patterns
 * - .m3u8 → HD
 * - Contains "hd" or "1080" → HD
 * - Contains "sd" or "270p" → SD
 * - Contains "4k" → 4K
 */
export function inferQuality(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('4k') || lower.includes('2160')) return '4K';
  if (lower.endsWith('.m3u8') || lower.includes('hd') || lower.includes('1080') || lower.includes('720')) return 'HD';
  if (lower.includes('sd') || lower.includes('270p') || lower.includes('360p') || lower.includes('480p')) return 'SD';
  return '';
}
