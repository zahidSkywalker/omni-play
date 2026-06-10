// Omni Play — Channels API
// Sources: iptv-org GitHub (https://github.com/iptv-org/iptv)
// Strategy: Category playlists (Sports, Documentary, Kids, etc.)
//           + Official source playlists (Pluto TV, Samsung, Roku, Plex, BBC, etc.)
//           + Key country playlists
//           Deduplicate by URL

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getChannelCacheCollection, sanitizeString } from '@/lib/mongodb';
import type { CachedChannel, ChannelCache } from '@/lib/mongodb';
import { parseM3U, filterChannels } from '@/lib/m3u-parser';

// ─── Cache Version ────────────────────────────────────────
const CACHE_VERSION = 'v13';
const CACHE_ID = `main_playlist_${CACHE_VERSION}`;

// ─── Source Types ─────────────────────────────────────────
interface M3USource {
  url: string;
  defaultCountry?: string;
  label: string;
}

// ═══════════════════════════════════════════════════════════
// ALL SOURCES FROM iptv-org (https://iptv-org.github.io/iptv/)
// ═══════════════════════════════════════════════════════════

const ALL_SOURCES: M3USource[] = [
  // ──── CATEGORY PLAYLISTS ────
  { url: 'https://iptv-org.github.io/iptv/categories/sports.m3u', label: 'Sports' },
  { url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u', label: 'Documentary' },
  { url: 'https://iptv-org.github.io/iptv/categories/kids.m3u', label: 'Kids' },
  { url: 'https://iptv-org.github.io/iptv/categories/news.m3u', label: 'News' },
  { url: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u', label: 'Entertainment' },
  { url: 'https://iptv-org.github.io/iptv/categories/movies.m3u', label: 'Movies' },
  { url: 'https://iptv-org.github.io/iptv/categories/music.m3u', label: 'Music' },
  { url: 'https://iptv-org.github.io/iptv/categories/education.m3u', label: 'Education' },
  { url: 'https://iptv-org.github.io/iptv/categories/lifestyle.m3u', label: 'Lifestyle' },
  { url: 'https://iptv-org.github.io/iptv/categories/religious.m3u', label: 'Religious' },
  { url: 'https://iptv-org.github.io/iptv/categories/legislative.m3u', label: 'Legislative' },
  { url: 'https://iptv-org.github.io/iptv/categories/series.m3u', label: 'Series' },
  { url: 'https://iptv-org.github.io/iptv/categories/cooking.m3u', label: 'Cooking' },
  { url: 'https://iptv-org.github.io/iptv/categories/culture.m3u', label: 'Culture' },
  { url: 'https://iptv-org.github.io/iptv/categories/travel.m3u', label: 'Travel' },
  { url: 'https://iptv-org.github.io/iptv/categories/family.m3u', label: 'Family' },
  { url: 'https://iptv-org.github.io/iptv/categories/science.m3u', label: 'Science' },
  { url: 'https://iptv-org.github.io/iptv/categories/business.m3u', label: 'Business' },
  { url: 'https://iptv-org.github.io/iptv/categories/weather.m3u', label: 'Weather' },
  { url: 'https://iptv-org.github.io/iptv/categories/shop.m3u', label: 'Shop' },
  { url: 'https://iptv-org.github.io/iptv/categories/comedy.m3u', label: 'Comedy' },
  { url: 'https://iptv-org.github.io/iptv/categories/animation.m3u', label: 'Animation' },
  { url: 'https://iptv-org.github.io/iptv/categories/classic.m3u', label: 'Classic' },
  { url: 'https://iptv-org.github.io/iptv/categories/auto.m3u', label: 'Auto' },
  { url: 'https://iptv-org.github.io/iptv/categories/outdoor.m3u', label: 'Outdoor' },
  { url: 'https://iptv-org.github.io/iptv/categories/relax.m3u', label: 'Relax' },
  { url: 'https://iptv-org.github.io/iptv/categories/general.m3u', label: 'General-Cat' },

  // ──── OFFICIAL SOURCE PLAYLISTS (most reliable) ────
  { url: 'https://iptv-org.github.io/iptv/sources/us_pluto.m3u', defaultCountry: 'US', label: 'Pluto-US' },
  { url: 'https://iptv-org.github.io/iptv/sources/us_samsung.m3u', defaultCountry: 'US', label: 'Samsung-US' },
  { url: 'https://iptv-org.github.io/iptv/sources/us_roku.m3u', defaultCountry: 'US', label: 'Roku-US' },
  { url: 'https://iptv-org.github.io/iptv/sources/us_plex.m3u', defaultCountry: 'US', label: 'Plex-US' },
  { url: 'https://iptv-org.github.io/iptv/sources/us_xumo.m3u', defaultCountry: 'US', label: 'Xumo-US' },
  { url: 'https://iptv-org.github.io/iptv/sources/us_tubi.m3u', defaultCountry: 'US', label: 'Tubi-US' },
  { url: 'https://iptv-org.github.io/iptv/sources/us_stirr.m3u', defaultCountry: 'US', label: 'Stirr-US' },
  { url: 'https://iptv-org.github.io/iptv/sources/us_pbs.m3u', defaultCountry: 'US', label: 'PBS-US' },
  { url: 'https://iptv-org.github.io/iptv/sources/uk_bbc.m3u', defaultCountry: 'UK', label: 'BBC-UK' },
  { url: 'https://iptv-org.github.io/iptv/sources/uk_pluto.m3u', defaultCountry: 'UK', label: 'Pluto-UK' },
  { url: 'https://iptv-org.github.io/iptv/sources/de_pluto.m3u', defaultCountry: 'DE', label: 'Pluto-DE' },
  { url: 'https://iptv-org.github.io/iptv/sources/de_rakuten.m3u', defaultCountry: 'DE', label: 'Rakuten-DE' },
  { url: 'https://iptv-org.github.io/iptv/sources/fr_pluto.m3u', defaultCountry: 'FR', label: 'Pluto-FR' },
  { url: 'https://iptv-org.github.io/iptv/sources/br_samsung.m3u', defaultCountry: 'BR', label: 'Samsung-BR' },
  { url: 'https://iptv-org.github.io/iptv/sources/ca_stingray.m3u', defaultCountry: 'CA', label: 'Stingray-CA' },
  { url: 'https://iptv-org.github.io/iptv/sources/in_doordarshan.m3u', defaultCountry: 'IN', label: 'DD-IN' },
  { url: 'https://iptv-org.github.io/iptv/sources/ru_smotrim.m3u', defaultCountry: 'RU', label: 'Smotrim-RU' },

  // ──── KEY COUNTRY PLAYLISTS ────
  { url: 'https://iptv-org.github.io/iptv/countries/bd.m3u', defaultCountry: 'BD', label: 'BD' },
  { url: 'https://iptv-org.github.io/iptv/countries/in.m3u', defaultCountry: 'IN', label: 'IN' },
  { url: 'https://iptv-org.github.io/iptv/countries/pk.m3u', defaultCountry: 'PK', label: 'PK' },
  { url: 'https://iptv-org.github.io/iptv/countries/us.m3u', defaultCountry: 'US', label: 'US' },
  { url: 'https://iptv-org.github.io/iptv/countries/uk.m3u', defaultCountry: 'UK', label: 'UK' },
  { url: 'https://iptv-org.github.io/iptv/countries/ca.m3u', defaultCountry: 'CA', label: 'CA' },
  { url: 'https://iptv-org.github.io/iptv/countries/au.m3u', defaultCountry: 'AU', label: 'AU' },
  { url: 'https://iptv-org.github.io/iptv/countries/sa.m3u', defaultCountry: 'SA', label: 'SA' },
  { url: 'https://iptv-org.github.io/iptv/countries/ae.m3u', defaultCountry: 'AE', label: 'AE' },
  { url: 'https://iptv-org.github.io/iptv/countries/eg.m3u', defaultCountry: 'EG', label: 'EG' },
  { url: 'https://iptv-org.github.io/iptv/countries/tr.m3u', defaultCountry: 'TR', label: 'TR' },
  { url: 'https://iptv-org.github.io/iptv/countries/iq.m3u', defaultCountry: 'IQ', label: 'IQ' },
  { url: 'https://iptv-org.github.io/iptv/countries/de.m3u', defaultCountry: 'DE', label: 'DE' },
  { url: 'https://iptv-org.github.io/iptv/countries/fr.m3u', defaultCountry: 'FR', label: 'FR' },
  { url: 'https://iptv-org.github.io/iptv/countries/es.m3u', defaultCountry: 'ES', label: 'ES' },
  { url: 'https://iptv-org.github.io/iptv/countries/it.m3u', defaultCountry: 'IT', label: 'IT' },
  { url: 'https://iptv-org.github.io/iptv/countries/nl.m3u', defaultCountry: 'NL', label: 'NL' },
  { url: 'https://iptv-org.github.io/iptv/countries/se.m3u', defaultCountry: 'SE', label: 'SE' },
  { url: 'https://iptv-org.github.io/iptv/countries/no.m3u', defaultCountry: 'NO', label: 'NO' },
  { url: 'https://iptv-org.github.io/iptv/countries/dk.m3u', defaultCountry: 'DK', label: 'DK' },
  { url: 'https://iptv-org.github.io/iptv/countries/pl.m3u', defaultCountry: 'PL', label: 'PL' },
  { url: 'https://iptv-org.github.io/iptv/countries/ru.m3u', defaultCountry: 'RU', label: 'RU' },
  { url: 'https://iptv-org.github.io/iptv/countries/ua.m3u', defaultCountry: 'UA', label: 'UA' },
  { url: 'https://iptv-org.github.io/iptv/countries/jp.m3u', defaultCountry: 'JP', label: 'JP' },
  { url: 'https://iptv-org.github.io/iptv/countries/kr.m3u', defaultCountry: 'KR', label: 'KR' },
  { url: 'https://iptv-org.github.io/iptv/countries/cn.m3u', defaultCountry: 'CN', label: 'CN' },
  { url: 'https://iptv-org.github.io/iptv/countries/th.m3u', defaultCountry: 'TH', label: 'TH' },
  { url: 'https://iptv-org.github.io/iptv/countries/vn.m3u', defaultCountry: 'VN', label: 'VN' },
  { url: 'https://iptv-org.github.io/iptv/countries/id.m3u', defaultCountry: 'ID', label: 'ID' },
  { url: 'https://iptv-org.github.io/iptv/countries/my.m3u', defaultCountry: 'MY', label: 'MY' },
  { url: 'https://iptv-org.github.io/iptv/countries/ph.m3u', defaultCountry: 'PH', label: 'PH' },
  { url: 'https://iptv-org.github.io/iptv/countries/sg.m3u', defaultCountry: 'SG', label: 'SG' },
  { url: 'https://iptv-org.github.io/iptv/countries/tw.m3u', defaultCountry: 'TW', label: 'TW' },
  { url: 'https://iptv-org.github.io/iptv/countries/br.m3u', defaultCountry: 'BR', label: 'BR' },
  { url: 'https://iptv-org.github.io/iptv/countries/mx.m3u', defaultCountry: 'MX', label: 'MX' },
  { url: 'https://iptv-org.github.io/iptv/countries/ar.m3u', defaultCountry: 'AR', label: 'AR' },
  { url: 'https://iptv-org.github.io/iptv/countries/co.m3u', defaultCountry: 'CO', label: 'CO' },
  { url: 'https://iptv-org.github.io/iptv/countries/cl.m3u', defaultCountry: 'CL', label: 'CL' },
  { url: 'https://iptv-org.github.io/iptv/countries/ng.m3u', defaultCountry: 'NG', label: 'NG' },
  { url: 'https://iptv-org.github.io/iptv/countries/za.m3u', defaultCountry: 'ZA', label: 'ZA' },
  { url: 'https://iptv-org.github.io/iptv/countries/ke.m3u', defaultCountry: 'KE', label: 'KE' },
  { url: 'https://iptv-org.github.io/iptv/countries/gh.m3u', defaultCountry: 'GH', label: 'GH' },
  { url: 'https://iptv-org.github.io/iptv/countries/int.m3u', label: 'International' },
];

async function fetchSource(source: M3USource): Promise<{ channels: CachedChannel[]; label: string }> {
  try {
    const response = await fetch(source.url, {
      headers: { 'Accept': 'text/plain', 'User-Agent': 'OmniPlay/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { channels: [], label: source.label };

    const content = await response.text();
    const countryCode = source.defaultCountry || '';
    const channels = parseM3U(content, countryCode || undefined);

    for (const ch of channels) {
      ch.sourceTag = source.label;
    }

    console.log(`[channels] ✓ ${source.label}: ${channels.length} channels`);
    return { channels, label: source.label };
  } catch (err) {
    console.error(`[channels] ✗ ${source.label}: ${err instanceof Error ? err.message : 'err'}`);
    return { channels: [], label: source.label };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { checkRateLimit } = await import('@/lib/rate-limiter');
    if (!checkRateLimit(request)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const country = sanitizeString(searchParams.get('country') || 'all');
    const category = sanitizeString(searchParams.get('category') || 'all');
    const search = sanitizeString(searchParams.get('search') || '');
    const limitParam = sanitizeString(searchParams.get('limit') || '50');
    const offsetParam = sanitizeString(searchParams.get('offset') || '0');
    const forceRefresh = searchParams.get('refresh') === 'true';

    const limit = Math.min(Math.max(parseInt(limitParam) || 50, 1), 200);
    const offset = Math.max(parseInt(offsetParam) || 0, 0);

    const db = await getDb();
    const cacheCollection = getChannelCacheCollection(db);

    let cacheData: ChannelCache | null = null;
    if (!forceRefresh) {
      try {
        cacheData = await cacheCollection.findOne({ _id: CACHE_ID });
      } catch { /* miss */ }
    } else {
      try {
        await cacheCollection.deleteMany({ _id: /^main_playlist_/ });
      } catch { /* ignore */ }
    }

    let allChannels: CachedChannel[] = [];
    let countries: string[] = [];
    let categories: string[] = [];

    if (cacheData) {
      allChannels = cacheData.channels;
      countries = cacheData.countries;
      categories = cacheData.categories;
      console.log(`[channels] Cache hit: ${allChannels.length} channels [${CACHE_VERSION}]`);
    } else {
      console.log(`[channels] Fetching ${ALL_SOURCES.length} sources...`);
      const startTime = Date.now();

      const results = await Promise.all(ALL_SOURCES.map(s => fetchSource(s)));

      const seenUrls = new Set<string>();
      const merged: CachedChannel[] = [];

      for (const result of results) {
        for (const ch of result.channels) {
          if (!seenUrls.has(ch.url)) {
            seenUrls.add(ch.url);
            merged.push(ch);
          }
        }
      }

      allChannels = merged;
      const successCount = results.filter(r => r.channels.length > 0).length;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[channels] ✓ ${successCount}/${ALL_SOURCES.length} sources, ${allChannels.length} unique channels in ${elapsed}s`);

      // Collapse tiny categories (< 3 channels) into "General"
      const catCounts = new Map<string, number>();
      for (const ch of allChannels) {
        catCounts.set(ch.category, (catCounts.get(ch.category) || 0) + 1);
      }
      for (const ch of allChannels) {
        if ((catCounts.get(ch.category) || 0) < 3) {
          ch.category = 'General';
        }
      }

      const countrySet = new Set<string>();
      const categorySet = new Set<string>();
      for (const ch of allChannels) {
        if (ch.country) countrySet.add(ch.country.toUpperCase());
        if (ch.category) categorySet.add(ch.category);
      }
      countries = Array.from(countrySet).sort();
      categories = Array.from(categorySet).sort();

      const cacheDoc: ChannelCache = {
        _id: CACHE_ID,
        channels: allChannels,
        total: allChannels.length,
        countries,
        categories,
        updatedAt: new Date().toISOString(),
      };
      await cacheCollection.replaceOne({ _id: CACHE_ID }, cacheDoc, { upsert: true });
      console.log(`[channels] Cached: ${allChannels.length} ch, ${countries.length} countries, ${categories.length} categories`);
    }

    const { channels: filtered, total } = filterChannels(allChannels, {
      country, category, search, limit, offset,
    });

    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return NextResponse.json(
      { channels: filtered, total, countries, categories },
      { headers }
    );
  } catch (error) {
    console.error('[channels] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
