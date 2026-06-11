// ─── Learn Tech with Zahid — Security Middleware ──────────────
// Centralized middleware for:
// 1. Protecting all /api/admin/* routes with admin token authentication
// 2. Rate limiting on sensitive endpoints
// 3. Adding security headers to all responses

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// timingSafeEqual inline (Edge Runtime compatible)
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}

// ─── Rate Limit Store (in-memory, per-edge-instance) ──────────
interface RateEntry {
  count: number;
  resetAt: number;
}
const rateStore = new Map<string, RateEntry>();

function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// ─── Cleanup expired entries every 60s ───────────────────────
let lastClean = 0;
function cleanup() {
  const now = Date.now();
  if (now - lastClean < 60_000) return;
  lastClean = now;
  for (const [k, v] of rateStore.entries()) {
    if (now >= v.resetAt) rateStore.delete(k);
  }
}

// ─── IP extraction ──────────────────────────────────────────
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

// ─── Middleware matcher config ───────────────────────────────
export const config = {
  matcher: [
    "/api/(.*)",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  const ip = getClientIp(request);

  // ─── Security Headers (applied to ALL API responses) ──
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // ─── Admin route protection ───────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    cleanup();

    // Rate limit admin routes (20 requests per minute)
    if (!checkRateLimit(`admin:${ip}`, 20, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { ...Object.fromEntries(response.headers), "Retry-After": "60" } }
      );
    }

    // Auth check: require Bearer token OR httpOnly admin cookie matching ADMIN_TOKEN env var
    const authHeader = request.headers.get("Authorization");
    const cookieHeader = request.cookies.get("ltwz_admin_auth");

    let token: string | null = null;

    // Check Bearer token first (for backward compatibility)
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else if (cookieHeader?.value) {
      // Fallback to httpOnly cookie
      token = cookieHeader.value;
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }
    const adminToken = process.env.ADMIN_TOKEN;

    const encoder = new TextEncoder();
    if (!adminToken || token.length !== adminToken.length || !timingSafeEqual(encoder.encode(token), encoder.encode(adminToken))) {
      console.warn(
        `[AUTH] Failed admin auth attempt from IP: ${ip}, path: ${pathname}, time: ${new Date().toISOString()}`
      );
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  // ─── Rate limit exam submission (10 per minute per IP) ──
  if (pathname.match(/^\/api\/exams\/[^/]+\/submit$/)) {
    cleanup();
    if (!checkRateLimit(`submit:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: "Too many submissions. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // ─── Rate limit token lookup (15 per minute per IP) ──────
  if (pathname.match(/^\/api\/results\/token\/[^/]+$/)) {
    cleanup();
    if (!checkRateLimit(`lookup:${ip}`, 15, 60_000)) {
      return NextResponse.json(
        { error: "Too many lookups. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  // ─── Rate limit individual result view (30 per minute per IP) ──
  if (pathname.match(/^\/api\/results\/[^/]+$/) && !pathname.includes("/token/")) {
    cleanup();
    if (!checkRateLimit(`result:${ip}`, 30, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  return response;
}
