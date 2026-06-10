import { NextRequest, NextResponse } from 'next/server';
import { gunzipSync } from 'zlib';
import { getCached, setCache, buildCacheKey } from '@/lib/famelack-cache';

const BASE_URL = 'https://raw.githubusercontent.com/famelack/famelack-data/main';

// ── Input validation constants ──
const VALID_TYPES = new Set(['tv', 'radio']);
const VALID_VIEWS = new Set(['country', 'category', 'metadata']);
const ID_REGEX = /^[a-z0-9-]+$/;

// ── Simple rate limiter with max entries cap ──
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute per IP
const RATE_LIMIT_MAX_ENTRIES = 5000; // Max tracked IPs

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // LRU eviction if at capacity
    if (rateLimitMap.size >= RATE_LIMIT_MAX_ENTRIES && !rateLimitMap.has(ip)) {
      const oldest = rateLimitMap.keys().next().value;
      if (oldest !== undefined) rateLimitMap.delete(oldest);
    }
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// Periodically clean up stale entries (every 5 minutes)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 300_000);
}

// ── Validation helpers ──
function validateType(value: string | null): 'tv' | 'radio' | null {
  if (!value || !VALID_TYPES.has(value)) return null;
  return value as 'tv' | 'radio';
}

function validateView(value: string | null): 'country' | 'category' | 'metadata' | null {
  if (!value || !VALID_VIEWS.has(value)) return null;
  return value as 'country' | 'category' | 'metadata';
}

function validateId(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (!ID_REGEX.test(normalized)) return null;
  return normalized;
}

function getClientIp(request: NextRequest): string {
  // Use Vercel's trusted header (cannot be spoofed) with fallback
  return request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const type = validateType(searchParams.get('type'));
  const view = validateView(searchParams.get('view'));
  const id = validateId(searchParams.get('id'));

  if (!type || !view) {
    return NextResponse.json(
      { error: 'Invalid or missing required params: type (tv|radio), view (country|category|metadata)' },
      { status: 400 }
    );
  }

  if (view !== 'metadata' && !id) {
    return NextResponse.json(
      { error: 'Missing required param: id — must match pattern [a-z0-9-]+' },
      { status: 400 }
    );
  }

  if (view === 'metadata' && id) {
    return NextResponse.json(
      { error: 'The metadata view does not accept an id parameter' },
      { status: 400 }
    );
  }

  try {
    // Handle metadata request
    if (view === 'metadata') {
      const response = await handleMetadata(type);
      // Add cache headers to metadata responses too
      response.headers.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=3600');
      return response;
    }

    // Build the URL
    let url: string;
    if (view === 'country') {
      url = `${BASE_URL}/${type}/compressed/countries/${id}.json`;
    } else {
      url = `${BASE_URL}/${type}/compressed/categories/${id}.json`;
    }

    const cacheKey = buildCacheKey({ type, view, id: id! });
    const cached = getCached<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' },
      });
    }

    const response = await fetch(url, {
      headers: {
        'Accept-Encoding': 'gzip',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data from upstream: ${response.status}` },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const buffer = await response.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    let data: unknown;
    try {
      const decompressed = gunzipSync(uint8);
      data = JSON.parse(new TextDecoder().decode(decompressed));
    } catch {
      // Maybe it's not gzipped, try parsing directly
      try {
        data = JSON.parse(new TextDecoder().decode(uint8));
      } catch {
        return NextResponse.json(
          { error: 'Failed to parse data' },
          { status: 502 }
        );
      }
    }

    setCache(cacheKey, data);

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleMetadata(type: 'tv' | 'radio') {
  const cacheKey = buildCacheKey({ type, view: 'metadata' });
  const cached = getCached<unknown>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' },
    });
  }

  const url = `${BASE_URL}/${type}/compressed/countries_metadata.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch metadata' },
        { status: 502 }
      );
    }

    const buffer = await response.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    let data: unknown;
    try {
      const decompressed = gunzipSync(uint8);
      data = JSON.parse(new TextDecoder().decode(decompressed));
    } catch {
      try {
        data = JSON.parse(new TextDecoder().decode(uint8));
      } catch {
        return NextResponse.json(
          { error: 'Failed to parse metadata' },
          { status: 502 }
        );
      }
    }

    setCache(cacheKey, data);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
