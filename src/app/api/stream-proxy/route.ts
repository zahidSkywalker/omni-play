import { NextRequest, NextResponse } from 'next/server';

/**
 * Stream proxy — fetches HLS manifests and .ts segments server-side,
 * stripping Origin/Referer headers that some CDNs use to block embeds.
 *
 * Usage: /api/stream-proxy?url=<encoded-stream-url>
 */

const MAX_MANIFEST_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_SEGMENT_SIZE = 15 * 1024 * 1024; // 15MB
const TIMEOUT_MS = 20_000;

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
    }
    const h = parsedUrl.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.') || h.startsWith('172.16.')) {
      return NextResponse.json({ error: 'Private URLs not allowed' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const isSegment = parsedUrl.pathname.endsWith('.ts') || parsedUrl.pathname.includes('.ts?');
  const maxSize = isSegment ? MAX_SEGMENT_SIZE : MAX_MANIFEST_SIZE;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const resp = await fetch(rawUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Mimic a direct browser visit — no Origin/Referer
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeout);

    // If upstream returns 403/404, pass through with useful info
    if (!resp.ok) {
      const denyReason = resp.headers.get('x-deny-reason');
      const msg = denyReason
        ? `Stream blocked: ${denyReason} (HTTP ${resp.status})`
        : `Upstream error: HTTP ${resp.status}`;
      return NextResponse.json({ error: msg }, { status: resp.status });
    }

    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const buf = await resp.arrayBuffer();

    if (buf.byteLength > maxSize) {
      return NextResponse.json({ error: 'Response too large' }, { status: 413 });
    }

    // For m3u8 manifests, rewrite segment/media URLs through our proxy
    if (parsedUrl.pathname.endsWith('.m3u8') || parsedUrl.pathname.includes('.m3u8')) {
      const text = new TextDecoder().decode(buf);
      const base = rawUrl.substring(0, rawUrl.lastIndexOf('/') + 1);
      const origin = request.nextUrl.origin;
      const rewritten = rewriteM3u8(text, base, origin);
      return new NextResponse(rewritten, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // .ts segments — pass through binary
    return new NextResponse(buf, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('abort') || msg.includes('timeout')) {
      return NextResponse.json({ error: 'Stream timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function rewriteM3u8(content: string, baseUrl: string, proxyOrigin: string): string {
  return content.split('\n').map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;

    let abs: string;
    if (trimmed.startsWith('http')) {
      abs = trimmed;
    } else {
      abs = baseUrl + trimmed;
    }

    const proxied = `${proxyOrigin}/api/stream-proxy?url=${encodeURIComponent(abs)}`;
    const indent = line.match(/^(\s*)/)?.[1] || '';
    return indent + proxied;
  }).join('\n');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}