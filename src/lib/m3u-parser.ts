// Omni Play — M3U Playlist Parser

import { Channel } from './types';
import { inferQuality } from './types';

/**
 * Simple hash function to generate a unique ID from a string (channel URL)
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Extract country code from group-title or tvg-country attribute
 */
function extractCountry(groupTitle: string, attrs: Record<string, string>, defaultCountry?: string): string {
  if (defaultCountry) {
    if (attrs['tvg-country']) {
      return attrs['tvg-country'].trim().toUpperCase();
    }
    return defaultCountry;
  }

  if (attrs['tvg-country']) {
    return attrs['tvg-country'].trim().toUpperCase();
  }
  
  const tvgId = attrs['tvg-id'] || '';
  const tvgIdMatch = tvgId.match(/[.\-]([a-z]{2})@/i);
  if (tvgIdMatch) {
    return tvgIdMatch[1].toUpperCase();
  }
  
  if (!groupTitle) return '';
  
  const countryMap: Record<string, string> = {
    'UNITED STATES': 'US', 'USA': 'US', 'U.S.A.': 'US', 'US': 'US',
    'UNITED KINGDOM': 'UK', 'UK': 'UK', 'U.K.': 'UK', 'BRITISH': 'UK', 'GB': 'UK',
    'BANGLADESH': 'BD', 'INDIA': 'IN', 'PAKISTAN': 'PK', 'TURKEY': 'TR',
    'GERMANY': 'DE', 'FRANCE': 'FR', 'SPAIN': 'ES', 'ITALY': 'IT',
    'BRAZIL': 'BR', 'JAPAN': 'JP', 'KOREA': 'KR', 'SOUTH KOREA': 'KR',
    'CHINA': 'CN', 'RUSSIA': 'RU', 'SAUDI ARABIA': 'SA', 'UAE': 'AE',
    'AUSTRALIA': 'AU', 'CANADA': 'CA', 'MEXICO': 'MX', 'ARGENTINA': 'AR',
    'NETHERLANDS': 'NL', 'SWEDEN': 'SE', 'POLAND': 'PL', 'THAILAND': 'TH',
    'VIETNAM': 'VN', 'INDONESIA': 'ID', 'MALAYSIA': 'MY', 'PHILIPPINES': 'PH',
    'EGYPT': 'EG', 'NIGERIA': 'NG', 'KENYA': 'KE', 'SOUTH AFRICA': 'ZA',
    'COLOMBIA': 'CO', 'SWITZERLAND': 'CH', 'PORTUGAL': 'PT', 'GREECE': 'GR',
    'CZECH': 'CZ', 'CZECHIA': 'CZ', 'ROMANIA': 'RO', 'HUNGARY': 'HU',
    'IRAQ': 'IQ', 'IRAN': 'IR', 'SYRIA': 'SY', 'JORDAN': 'JO',
    'LEBANON': 'LB', 'QATAR': 'QA', 'KUWAIT': 'KW', 'OMAN': 'OM',
    'BAHRAIN': 'BH', 'YEMEN': 'YE', 'PALESTINE': 'PS', 'ISRAEL': 'IL',
    'MOROCCO': 'MA', 'TUNISIA': 'TN', 'ALGERIA': 'DZ', 'LIBYA': 'LY',
    'SUDAN': 'SD', 'ETHIOPIA': 'ET', 'GHANA': 'GH', 'TANZANIA': 'TZ',
    'FINLAND': 'FI', 'NORWAY': 'NO', 'DENMARK': 'DK', 'IRELAND': 'IE',
    'AUSTRIA': 'AT', 'BELGIUM': 'BE', 'UKRAINE': 'UA', 'CROATIA': 'HR',
    'SERBIA': 'RS', 'BULGARIA': 'BG', 'SLOVAKIA': 'SK', 'SLOVENIA': 'SI',
    'LITHUANIA': 'LT', 'LATVIA': 'LV', 'ESTONIA': 'EE', 'ICELAND': 'IS',
    'CUBA': 'CU', 'DOMINICAN': 'DO', 'PUERTO RICO': 'PR', 'VENEZUELA': 'VE',
    'PERU': 'PE', 'CHILE': 'CL', 'ECUADOR': 'EC',
    'PARAGUAY': 'PY', 'URUGUAY': 'UY', 'BOLIVIA': 'BO',
    'AFGHANISTAN': 'AF', 'NEPAL': 'NP', 'SRI LANKA': 'LK', 'MYANMAR': 'MM',
    'CAMBODIA': 'KH', 'LAOS': 'LA', 'SINGAPORE': 'SG', 'TAIWAN': 'TW',
    'HONG KONG': 'HK', 'MACAU': 'MO', 'MONGOLIA': 'MN',
    'UZBEKISTAN': 'UZ', 'KAZAKHSTAN': 'KZ', 'AZERBAIJAN': 'AZ', 'GEORGIA': 'GE',
    'ARMENIA': 'AM', 'BELARUS': 'BY', 'MOLDOVA': 'MD', 'UZBEK': 'UZ',
    'ANGOLA': 'AO', 'CAMEROON': 'CM', 'CONGO': 'CG', 'SENEGAL': 'SN',
    'MALI': 'ML', 'NIGER': 'NE', 'CHAD': 'TD', 'BURKINA': 'BF',
    'BURUNDI': 'BI', 'RWANDA': 'RW', 'UGANDA': 'UG', 'SOMALIA': 'SO',
    'ZIMBABWE': 'ZW', 'MOZAMBIQUE': 'MZ', 'MADAGASCAR': 'MG',
  };
  
  const parts = groupTitle.split(/[\s]*[|,\-\/][\s]*/);
  if (parts.length > 0) {
    const firstPart = parts[0].trim().toUpperCase();
    if (/^[A-Z]{2,3}$/.test(firstPart)) {
      return firstPart;
    }
    for (const [name, code] of Object.entries(countryMap)) {
      if (firstPart.includes(name) || name.includes(firstPart)) {
        return code;
      }
    }
  }
  
  const upperTitle = groupTitle.toUpperCase();
  for (const [name, code] of Object.entries(countryMap)) {
    if (upperTitle.includes(name)) {
      return code;
    }
  }
  
  return '';
}

/**
 * Category priority for multi-category group titles (e.g. "Animation;Kids;Music")
 */
const CATEGORY_PRIORITY = [
  'Sports', 'News', 'Kids', 'Documentary', 'Movies',
  'Music', 'Entertainment', 'Education', 'Religious', 'Lifestyle',
  'Travel', 'Shop', 'General', 'Outdoor', 'Relax',
  'Public', 'Legislative', 'Classic', 'Auto',
];

/**
 * Normalize a single category name to a canonical name
 */
function normalizeCategory(category: string): string {
  if (!category) return 'General';
  const trimmed = category.trim();
  if (!trimmed) return 'General';

  const lower = trimmed.toLowerCase();

  const map: Record<string, string> = {
    'sport': 'Sports', 'sports': 'Sports', 'live sports': 'Sports', 'sports on now': 'Sports',
    'auto & motorsports': 'Sports', 'football': 'Sports', 'cricket': 'Sports',
    'kids': 'Kids', 'children': 'Kids', 'kids/children': 'Kids', 'children/kids': 'Kids',
    'kids & family': 'Kids', 'family': 'Kids', 'animation': 'Kids', 'cartoon': 'Kids',
    'cartoons': 'Kids', 'animated': 'Kids', 'anime': 'Kids',
    'documentary': 'Documentary', 'documentaries': 'Documentary',
    'documentaries (ar)': 'Documentary', 'documentaries (en)': 'Documentary',
    'science & nature': 'Documentary', 'science': 'Documentary', 'nature': 'Documentary',
    'culture': 'Documentary', 'history': 'Documentary', 'biography': 'Documentary',
    'crime': 'Documentary', 'true crime': 'Documentary',
    'news': 'News', 'news / politics': 'News', 'politics': 'News',
    'news (ar)': 'News', 'news (es)': 'News',
    'business news': 'News', 'local news': 'News', 'national news': 'News',
    'english news': 'News', 'weather': 'News', 'finance': 'News', 'business': 'News',
    'information': 'News',
    'entertainment': 'Entertainment', 'entertaiment': 'Entertainment', 'entertanment': 'Entertainment',
    'comedy': 'Entertainment', 'comedy/entertainment': 'Entertainment',
    'drama': 'Entertainment', 'series': 'Entertainment',
    'reality': 'Entertainment', 'game show': 'Entertainment',
    'classic tv': 'Entertainment', 'tv dramas': 'Entertainment',
    'pop culture': 'Entertainment', 'live event': 'Entertainment',
    'movies': 'Movies', 'movie': 'Movies', 'cinema': 'Movies', 'films': 'Movies', 'film': 'Movies',
    'movie channels': 'Movies', 'english movie': 'Movies', 'english movies': 'Movies',
    'bangla movies': 'Movies', 'hindi movies': 'Movies', 'hindi dabbing movies': 'Movies',
    'indian movies': 'Movies', 'romance': 'Movies', 'horror': 'Movies',
    'action': 'Movies', 'thriller': 'Movies', 'mystery': 'Movies',
    'music': 'Music', 'musik': 'Music', 'music talk': 'Music',
    'religious': 'Religious', 'religion': 'Religious', 'spiritual': 'Religious',
    'islamic channels': 'Religious', 'faith & family': 'Religious',
    'education': 'Education', 'educational': 'Education', 'edu': 'Education',
    'tech': 'Education', 'technology': 'Education', 'gaming & tech': 'Education',
    'lifestyle': 'Lifestyle', 'life': 'Lifestyle',
    'cooking': 'Lifestyle', 'food': 'Lifestyle', 'cook': 'Lifestyle',
    'good eats': 'Lifestyle', 'health': 'Lifestyle',
    'home improvement': 'Lifestyle', 'house': 'Lifestyle',
    'auto': 'Lifestyle', 'automobile': 'Lifestyle', 'cars': 'Lifestyle',
    'travel': 'Travel', 'tourism': 'Travel', 'environment': 'Travel',
    'shop': 'Shop', 'shopping': 'Shop', 'auction': 'Shop',
    'general': 'General', 'other': 'General', 'misc': 'General', 'miscellaneous': 'General',
    'infotainment': 'Entertainment', 'infotainment channels': 'Entertainment',
    'games': 'Entertainment', 'gaming': 'Entertainment',
    'classic': 'Entertainment', 'retro': 'Entertainment',
    'outdoor': 'Outdoor', 'legislative': 'Legislative', 'public': 'Public',
    'relax': 'Relax', 'art': 'Entertainment',
    'paranormal': 'Entertainment', 'dark comedy': 'Entertainment',
    'law': 'News', 'bus.': 'News',
  };

  if (map[lower]) return map[lower];

  // Global prefix strip
  if (lower.startsWith('global ')) {
    const stripped = lower.replace(/^global\s+/, '');
    if (map[stripped]) return map[stripped];
    const parts = stripped.split(/[\s]*[;|,\/\-][\s]*/);
    for (const priority of CATEGORY_PRIORITY) {
      if (parts.some(p => p.toLowerCase() === priority.toLowerCase())) return priority;
    }
  }

  // Region prefix strip
  const regionPrefixes = ['indian ', 'pakistani ', 'bangla ', 'bangladeshi ', 'kolkata ', 'english ', 'hindi ', 'korean ', 'nz '];
  for (const prefix of regionPrefixes) {
    if (lower.startsWith(prefix)) {
      const stripped = lower.replace(prefix, '');
      if (map[stripped]) return map[stripped];
    }
  }

  // Language suffix strip
  const langStripped = lower.replace(/\s*\((ar|en|es|fr|de|hi|ur|bn|tr)\)\s*$/i, '');
  if (map[langStripped]) return map[langStripped];

  // Known country words → General
  const knownCountryWords = [
    'albania','andorra','argentina','armenia','australia','austria','azerbaijan','bangladesh',
    'belarus','belgium','bolivia','bosnia','brazil','brunei','bulgaria','cambodia','cameroon',
    'canada','chad','chile','china','colombia','costa rica','croatia','cuba','cyprus','czech',
    'denmark','dominican','ecuador','egypt','estonia','finland','france','georgia','germany','ghana',
    'greece','guatemala','haiti','honduras','hong kong','hungary','iceland','india','indonesia',
    'iran','iraq','ireland','israel','italy','japan','jordan','kazakhstan','kenya','kuwait',
    'latvia','lebanon','libya','lithuania','luxembourg','macau','malaysia','malta','mexico',
    'moldova','monaco','mongolia','montenegro','morocco','mozambique','myanmar','nepal',
    'netherlands','nicaragua','nigeria','norway','oman','pakistan','panama','paraguay','peru',
    'philippines','poland','portugal','qatar','romania','russia','rwanda','saudi arabia','senegal',
    'serbia','singapore','slovakia','slovenia','somalia','south africa','south korea','spain',
    'sri lanka','sudan','sweden','switzerland','syria','taiwan','tanzania','thailand','tunisia',
    'turkey','uganda','uk','ukraine','uae','uruguay','usa','uzbekistan','venezuela','vietnam',
    'yemen','zambia','zimbabwe','international','bangla','hindi','english','japanese','korean',
    'portuguese','spanish','french','german','arabic','turkish','urdu','russian','chinese','italian',
    'others','other','channels','tv','rádios','undefined',
  ];
  if (knownCountryWords.includes(lower)) return 'General';
  if (lower.includes('vod') || lower.includes('radio') || lower.includes('rádio')) return 'General';

  return trimmed;
}

/**
 * Extract category from group-title.
 * Handles iptv-org multi-category format: "Animation;Kids;Religious"
 * Splits on semicolons, normalizes each part, picks highest priority.
 */
function extractCategory(groupTitle: string): string {
  if (!groupTitle) return 'General';

  // ── STEP 1: Always split semicolons first ──
  if (groupTitle.includes(';')) {
    const parts = groupTitle.split(';').map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length > 1) {
      // Normalize each part individually, pick by priority
      const normalized = parts.map(p => normalizeCategory(p));
      for (const priority of CATEGORY_PRIORITY) {
        const match = normalized.find(n => n === priority);
        if (match) return match;
      }
      // No priority match — return first non-General
      const nonGeneral = normalized.find(n => n !== 'General');
      if (nonGeneral) return nonGeneral;
      return 'General';
    }
  }

  // ── STEP 2: Handle "Country | Category" format ──
  const pipeParts = groupTitle.split(/[\s]*[|,\-\/][\s]*/);
  if (pipeParts.length > 1) {
    const first = pipeParts[0].trim().toUpperCase();
    // Check if first part is a country code (2-3 letters)
    if (/^[A-Z]{2,3}$/.test(first)) {
      const remaining = pipeParts.slice(1).join(' ');
      return normalizeCategory(remaining);
    }
    // Check known country names
    const knownCountryPrefixes: string[] = [
      'UNITED STATES', 'USA', 'U.S.A.', 'UK', 'U.K.', 'UNITED KINGDOM', 'BRITISH',
      'BANGLADESH', 'INDIA', 'PAKISTAN', 'TURKEY', 'GERMANY', 'FRANCE', 'SPAIN', 'ITALY',
      'BRAZIL', 'JAPAN', 'KOREA', 'SOUTH KOREA', 'CHINA', 'RUSSIA', 'SAUDI ARABIA', 'UAE',
      'AUSTRALIA', 'CANADA', 'MEXICO', 'ARGENTINA', 'NETHERLANDS', 'SWEDEN', 'POLAND',
      'THAILAND', 'VIETNAM', 'INDONESIA', 'MALAYSIA', 'PHILIPPINES', 'EGYPT', 'NIGERIA',
      'KENYA', 'SOUTH AFRICA', 'COLOMBIA', 'SWITZERLAND', 'PORTUGAL', 'GREECE', 'CZECH',
      'IRAQ', 'IRAN', 'SYRIA', 'JORDAN', 'LEBANON', 'QATAR', 'KUWAIT', 'BAHRAIN',
      'YEMEN', 'PALESTINE', 'ISRAEL', 'MOROCCO', 'TUNISIA', 'ALGERIA', 'LIBYA',
      'SUDAN', 'ETHIOPIA', 'GHANA', 'TANZANIA', 'FINLAND', 'NORWAY', 'DENMARK',
      'IRELAND', 'AUSTRIA', 'BELGIUM', 'UKRAINE', 'CROATIA', 'SERBIA',
      'BULGARIA', 'SLOVAKIA', 'SLOVENIA', 'LITHUANIA', 'LATVIA', 'ESTONIA', 'ICELAND',
      'CUBA', 'PUERTO RICO', 'VENEZUELA', 'PERU', 'CHILE', 'ECUADOR',
      'PARAGUAY', 'URUGUAY', 'BOLIVIA', 'AFGHANISTAN', 'NEPAL', 'SRI LANKA',
      'MYANMAR', 'CAMBODIA', 'LAOS', 'SINGAPORE', 'TAIWAN', 'HONG KONG', 'MACAU',
      'MONGOLIA', 'UZBEKISTAN', 'KAZAKHSTAN', 'AZERBAIJAN', 'GEORGIA', 'ARMENIA',
      'BELARUS', 'MOLDOVA', 'ANGOLA', 'CAMEROON', 'CONGO', 'SENEGAL',
    ];
    for (const country of knownCountryPrefixes) {
      if (first === country || first.startsWith(country)) {
        const remaining = pipeParts.slice(1).join(' ');
        return normalizeCategory(remaining);
      }
    }
  }

  // ── STEP 3: Single category — normalize directly ──
  return normalizeCategory(groupTitle.trim());
}

/**
 * Parse M3U playlist content into Channel objects
 */
export function parseM3U(content: string, defaultCountry?: string): Channel[] {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentAttrs: Record<string, string> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line || (line.startsWith('#') && !line.startsWith('#EXTINF'))) {
      continue;
    }

    if (line.startsWith('#EXTINF')) {
      currentAttrs = {};

      const attrRegex = /([a-zA-Z-]+)="([^"]*)"/g;
      let match;
      while ((match = attrRegex.exec(line)) !== null) {
        currentAttrs[match[1].toLowerCase()] = match[2];
      }

      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentAttrs['_name'] = line.substring(commaIndex + 1).trim();
      }

      if (i + 1 < lines.length) {
        const urlLine = lines[i + 1].trim();
        if (urlLine && !urlLine.startsWith('#') && (urlLine.startsWith('http') || urlLine.startsWith('rtmp') || urlLine.startsWith('rtsp'))) {
          const groupTitle = currentAttrs['group-title'] || '';
          const name = currentAttrs['_name'] || currentAttrs['tvg-name'] || 'Unknown Channel';
          const url = urlLine;
          const logo = currentAttrs['tvg-logo'] || '';
          const tvgId = currentAttrs['tvg-id'] || '';
          const tvgName = currentAttrs['tvg-name'] || '';
          const country = extractCountry(groupTitle, currentAttrs, defaultCountry);
          const category = extractCategory(groupTitle);
          const quality = inferQuality(url);

          channels.push({
            id: hashString(url),
            name,
            url,
            logo,
            category,
            country,
            tvgId,
            tvgName,
            quality,
          });
        }
      }
    }
  }

  return channels;
}

/**
 * Filter channels based on criteria
 */
export function filterChannels(
  channels: Channel[],
  options: {
    country?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): { channels: Channel[]; total: number } {
  let filtered = [...channels];

  if (options.country && options.country !== 'all') {
    filtered = filtered.filter(ch => ch.country.toUpperCase() === options.country!.toUpperCase());
  }

  if (options.category && options.category !== 'all') {
    const query = options.category!.toLowerCase();
    filtered = filtered.filter(ch =>
      ch.category.toLowerCase() === query ||
      ch.category.toLowerCase().includes(query) ||
      query.includes(ch.category.toLowerCase())
    );
  }

  if (options.search) {
    const query = options.search.toLowerCase();
    filtered = filtered.filter(ch =>
      ch.name.toLowerCase().includes(query) ||
      ch.category.toLowerCase().includes(query) ||
      ch.country.toLowerCase().includes(query)
    );
  }

  const total = filtered.length;

  if (options.offset) {
    filtered = filtered.slice(options.offset);
  }
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return { channels: filtered, total };
}
