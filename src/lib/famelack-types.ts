export interface Channel {
  nanoid: string;
  name: string;
  stream_urls: string[];
  youtube_urls: string[];
  languages: string[];
  country: string;
  isGeoBlocked: boolean;
}

export interface CountryMeta {
  country: string;
  capital: string;
  timeZone: string;
  hasChannels: boolean;
  channelCount: number;
}

export type Mode = 'tv' | 'radio';
export type ViewType = 'countries' | 'categories';

export const TV_CATEGORIES = [
  'all', 'animation', 'auto', 'business', 'classic', 'comedy', 'cooking',
  'culture', 'documentary', 'education', 'entertainment', 'family', 'general',
  'kids', 'legislative', 'lifestyle', 'movies', 'music', 'news', 'outdoor',
  'public', 'relax', 'religious', 'science', 'series', 'shop', 'show',
  'sports', 'top-news', 'travel', 'weather',
] as const;

export const RADIO_CATEGORIES = [
  '70s', '80s', '90s', 'all', 'blues', 'chill', 'christmas', 'classical',
  'country', 'easy-listening', 'electronic', 'folk', 'hip-hop', 'hits',
  'indie', 'jazz', 'latin', 'metal', 'news', 'oldies', 'politics', 'pop',
  'reggae', 'religious', 'rock', 'schlager', 'soul', 'sports', 'talk',
] as const;

export type TVCategory = (typeof TV_CATEGORIES)[number];
export type RadioCategory = (typeof RADIO_CATEGORIES)[number];

export const CATEGORY_ICONS_TV: Record<string, string> = {
  'all': '📺',
  'animation': '🎨',
  'auto': '🚗',
  'business': '💼',
  'classic': '📜',
  'comedy': '😂',
  'cooking': '🍳',
  'culture': '🎭',
  'documentary': '🎬',
  'education': '📚',
  'entertainment': '🎪',
  'family': '👨‍👩‍👧‍👦',
  'general': '📡',
  'kids': '🧸',
  'legislative': '⚖️',
  'lifestyle': '🏡',
  'movies': '🎥',
  'music': '🎵',
  'news': '📰',
  'outdoor': '🏕️',
  'public': '🏛️',
  'relax': '😌',
  'religious': '🙏',
  'science': '🔬',
  'series': '📺',
  'shop': '🛒',
  'show': '🎤',
  'sports': '⚽',
  'top-news': '🔴',
  'travel': '✈️',
  'weather': '🌤️',
};

export const CATEGORY_ICONS_RADIO: Record<string, string> = {
  '70s': '🎞️',
  '80s': '🪩',
  '90s': '💿',
  'all': '📻',
  'blues': '🎸',
  'chill': '❄️',
  'christmas': '🎄',
  'classical': '🎻',
  'country': '🤠',
  'easy-listening': '🎧',
  'electronic': '🎛️',
  'folk': '🪈',
  'hip-hop': '🎤',
  'hits': '🔥',
  'indie': '🎸',
  'jazz': '🎷',
  'latin': '💃',
  'metal': '🤘',
  'news': '📰',
  'oldies': '📻',
  'politics': '🏛️',
  'pop': '🎵',
  'reggae': '🇯🇲',
  'religious': '🙏',
  'rock': '🪨',
  'schlager': '⭐',
  'soul': '🖤',
  'sports': '⚽',
  'talk': '🗣️',
};

export function getCategories(mode: Mode): readonly string[] {
  return mode === 'tv' ? TV_CATEGORIES : RADIO_CATEGORIES;
}

export function getCategoryIcon(category: string, mode: Mode): string {
  const icons = mode === 'tv' ? CATEGORY_ICONS_TV : CATEGORY_ICONS_RADIO;
  return icons[category] || '📡';
}

export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  const codePoints = code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export const LANGUAGE_NAMES: Record<string, string> = {
  'eng': 'English', 'spa': 'Spanish', 'fra': 'French', 'deu': 'German',
  'ita': 'Italian', 'por': 'Portuguese', 'rus': 'Russian', 'ara': 'Arabic',
  'hin': 'Hindi', 'ben': 'Bengali', 'tur': 'Turkish', 'vie': 'Vietnamese',
  'tha': 'Thai', 'zho': 'Chinese', 'jpn': 'Japanese', 'kor': 'Korean',
  'pol': 'Polish', 'nld': 'Dutch', 'swe': 'Swedish', 'nor': 'Norwegian',
  'dan': 'Danish', 'fin': 'Finnish', 'ces': 'Czech', 'hun': 'Hungarian',
  'ron': 'Romanian', 'ukr': 'Ukrainian', 'ell': 'Greek', 'heb': 'Hebrew',
  'ind': 'Indonesian', 'msa': 'Malay', 'fil': 'Filipino', 'tam': 'Tamil',
  'tel': 'Telugu', 'mar': 'Marathi', 'urd': 'Urdu', 'fas': 'Persian',
  'bul': 'Bulgarian', 'hrv': 'Croatian', 'srp': 'Serbian', 'slk': 'Slovak',
  'slv': 'Slovenian', 'lit': 'Lithuanian', 'lav': 'Latvian', 'est': 'Estonian',
  'cat': 'Catalan', 'eus': 'Basque', 'glg': 'Galician', 'afr': 'Afrikaans',
  'swa': 'Swahili', 'amh': 'Amharic', 'yor': 'Yoruba', 'ibo': 'Igbo',
  'kan': 'Kannada', 'mal': 'Malayalam', 'pan': 'Punjabi', 'guj': 'Gujarati',
  'nep': 'Nepali', 'sin': 'Sinhala', 'khm': 'Khmer', 'lao': 'Lao',
  'bur': 'Burmese', 'mon': 'Mongolian', 'geo': 'Georgian', 'hye': 'Armenian',
  'aze': 'Azerbaijani', 'uzb': 'Uzbek', 'kaz': 'Kazakh', 'mkd': 'Macedonian',
  'alb': 'Albanian', 'bos': 'Bosnian', 'snh': 'Sinhala', 'tib': 'Tibetan',
};
