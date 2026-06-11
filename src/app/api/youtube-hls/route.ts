import { NextRequest, NextResponse } from 'next/server';

/**
 * Extracts the HLS live stream URL from a YouTube video.
 * Works by fetching YouTube's inner tube API and parsing the
 * streamingData to find an HLS manifest (format: HLS/DASH).
 *
 * Falls back to null if extraction fails — the player will
 * then use the iframe embed as before.
 */

const CACHE_TTL = 30_000; // 30 seconds — live streams change
const cache = new Map<string, { url: string | null; ts: number }>();

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function extractHlsUrl(videoId: string): Promise<string | null> {
  // Check cache
  const cached = cache.get(videoId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.url;
  }

  try {
    // Fetch the YouTube watch page to get the ytInitialPlayerResponse
    const res = await fetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) {
      cache.set(videoId, { url: null, ts: Date.now() });
      return null;
    }

    const html = await res.text();

    // Try to find ytInitialPlayerResponse in the page HTML
    let playerResponse: any = null;

    // Pattern 1: var ytInitialPlayerResponse = {...};
    const pattern1 = /var\s+ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\});\s*<\/script>/;
    const match1 = html.match(pattern1);
    if (match1) {
      try {
        playerResponse = JSON.parse(match1[1]);
      } catch {
        // Fall through to next pattern
      }
    }

    // Pattern 2: ytInitialPlayerResponse = JSON.parse('{...}');
    if (!playerResponse) {
      const pattern2 = /ytInitialPlayerResponse\s*=\s*JSON\.parse\('([\s\S]+?)'\)/;
      const match2 = html.match(pattern2);
      if (match2) {
        try {
          playerResponse = JSON.parse(match2[1].replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          ).replace(/\\([^x])/g, '$1'));
        } catch {
          // Fall through
        }
      }
    }

    // Pattern 3: Search for "hlsManifestUrl" directly in the HTML
    if (!playerResponse) {
      const hlsPattern = /"hlsManifestUrl"\s*:\s*"([^"]+)"/;
      const hlsMatch = html.match(hlsPattern);
      if (hlsMatch) {
        const url = hlsMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
        cache.set(videoId, { url, ts: Date.now() });
        return url;
      }
    }

    if (!playerResponse) {
      cache.set(videoId, { url: null, ts: Date.now() });
      return null;
    }

    // Look for HLS manifest URL in streamingData
    const streamingData = playerResponse?.streamingData;
    if (!streamingData) {
      cache.set(videoId, { url: null, ts: Date.now() });
      return null;
    }

    // Priority 1: hlsManifestUrl (available for most live streams)
    let hlsUrl = streamingData.hlsManifestUrl;
    if (hlsUrl) {
      hlsUrl = hlsUrl.replace(/\\u0026/g, '&');
      cache.set(videoId, { url: hlsUrl, ts: Date.now() });
      return hlsUrl;
    }

    // Priority 2: For DASH, look for an HLS adaptation
    // Some live streams only expose DASH but have HLS in formats
    const dashManifestUrl = streamingData.dashManifestUrl;
    if (dashManifestUrl) {
      // Return null — DASH playback would need a different player.
      // The iframe fallback will handle this.
    }

    cache.set(videoId, { url: null, ts: Date.now() });
    return null;
  } catch {
    cache.set(videoId, { url: null, ts: Date.now() });
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json(
      { error: 'Missing "url" query parameter' },
      { status: 400 }
    );
  }

  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) {
    return NextResponse.json(
      { error: 'Invalid YouTube URL' },
      { status: 400 }
    );
  }

  const hlsUrl = await extractHlsUrl(videoId);

  if (!hlsUrl) {
    return NextResponse.json(
      { hlsUrl: null, videoId },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { hlsUrl, videoId },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    }
  );
}