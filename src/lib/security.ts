// ─── Learn Tech with Zahid — Security Utilities ──────────────
// Shared helpers for authentication, rate limiting, input sanitization,
// and CSRF protection across all API routes.

import { NextResponse } from "next/server";
import { timingSafeEqual, randomBytes } from "crypto";

// ─── Admin Authentication ────────────────────────────────────

/**
 * Verifies the admin token from the Authorization header.
 * Only checks against the server-side environment variable —
 * no hardcoded fallbacks (the old "learn-tech-admin-2026" was removed).
 */
export function verifyAdminToken(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false;
  // Timing-safe comparison to prevent timing attacks
  try {
    const a = Buffer.from(token, "utf-8");
    const b = Buffer.from(adminToken, "utf-8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Helper that returns a 401 response if the admin token is invalid.
 * Usage: `const authError = requireAdmin(request); if (authError) return authError;`
 */
export function requireAdmin(request: Request): NextResponse | null {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// ─── In-Memory Rate Limiter ──────────────────────────────────
// Simple sliding-window rate limiter keyed by IP.
// Suitable for serverless (Vercel) — uses a Map that resets on cold start.
// For production-scale, swap in Redis via Upstash.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 60 seconds)
let lastCleanup = Date.now();
function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) rateLimitStore.delete(key);
  }
}

/**
 * Rate limit check. Returns null if allowed, or a 429 NextResponse if exceeded.
 *
 * @param identifier - Unique key (typically IP address)
 * @param maxRequests - Max requests in the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): NextResponse | null {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now >= entry.resetAt) {
    // New window
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }

  entry.count++;
  return null;
}

// ─── Input Sanitization ──────────────────────────────────────

/**
 * Sanitizes a string by trimming and removing potential XSS vectors.
 * For production, consider using a library like DOMPurify or sanitize-html.
 */
export function sanitizeString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== "string") return "";
  // Trim whitespace
  let clean = input.trim();
  // Remove null bytes
  clean = clean.replace(/\0/g, "");
  // Strip HTML tags (basic protection)
  clean = clean.replace(/<[^>]*>/g, "");
  // Enforce max length
  return clean.slice(0, maxLength);
}

/**
 * Validates and sanitizes exam submission data.
 * Returns an error message string if validation fails, or null if valid.
 */
export function validateSubmission(data: {
  answers: unknown;
  timeTaken: unknown;
  studentName: unknown;
  username: unknown;
}): string | null {
  // Validate answers
  if (!Array.isArray(data.answers)) return "Answers must be an array.";
  if (data.answers.length === 0) return "Answers array cannot be empty.";
  for (let i = 0; i < data.answers.length; i++) {
    if (typeof data.answers[i] !== "number" || data.answers[i] < 0 || data.answers[i] > 3) {
      return `Invalid answer at index ${i}. Must be 0, 1, 2, or 3.`;
    }
  }

  // Validate timeTaken
  if (typeof data.timeTaken !== "number" || data.timeTaken < 0 || data.timeTaken > 86400) {
    return "Invalid time taken. Must be between 0 and 86400 seconds.";
  }

  // Validate username
  const username = sanitizeString(data.username, 100);
  if (!username) return "Username is required and must be a valid string.";

  // Validate studentName (optional)
  if (data.studentName !== undefined && data.studentName !== null) {
    const name = sanitizeString(data.studentName, 200);
    if (!name) return "Invalid student name.";
  }

  return null;
}

// ─── CSRF Protection ─────────────────────────────────────────
// For API routes that accept mutations (POST, PUT, DELETE),
// verify the request originates from the same origin.

const ALLOWED_ORIGINS = [
  "https://learn-tech-with-zahid.vercel.app",
  "https://learn-tech-with-zahid-5i75h992v-zahids-projects-6e27e0a1.vercel.app",
  // Allow all Vercel preview URLs for this project
  "https://learn-tech-with-zahid",
  // Add localhost for development
  "http://localhost:3000",
];

/**
 * Validates the Origin header on mutation requests.
 * Returns an error response if the origin doesn't match, or null if valid.
 */
export function validateCsrf(request: Request): NextResponse | null {
  // Only validate mutations (skip GET/HEAD/OPTIONS)
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return null;

  const origin = request.headers.get("Origin") || request.headers.get("Referer");

  if (!origin) {
    // No origin header on mutation request — reject as potential CSRF
    return NextResponse.json(
      { error: "Forbidden: missing origin header" },
      { status: 403 }
    );
  }

  // Extract origin from referer if origin header is not present
  let requestOrigin = origin;
  if (!request.headers.get("Origin") && origin.startsWith("http")) {
    try {
      const url = new URL(origin);
      requestOrigin = url.origin;
    } catch {
      // Invalid URL, reject
    }
  }

  const isAllowed = ALLOWED_ORIGINS.some(
    (allowed) => requestOrigin === allowed || requestOrigin.startsWith(allowed + "/")
  );

  if (!isAllowed) {
    console.warn(`[CSRF] Blocked request from unauthorized origin: ${origin}`);
    return NextResponse.json(
      { error: "Forbidden: cross-origin requests are not allowed" },
      { status: 403 }
    );
  }

  return null;
}

// ─── CSRF Double-Submit Pattern ─────────────────────────────
// Complements the origin-based CSRF validation (validateCsrf above).
// Uses a non-httpOnly cookie + X-CSRF-Token header for state-changing
// API mutations. This protects against same-origin attacks that
// origin checking alone can't prevent.

const CSRF_COOKIE_NAME = "ltwz_csrf";

/**
 * Generates a random 32-byte hex string for CSRF tokens.
 */
export function generateCsrfToken(): string {
  const bytes = randomBytes(32);
  return bytes.toString("hex");
}

/**
 * Sets the `ltwz_csrf` cookie on a response.
 * The cookie is NOT httpOnly so JavaScript can read it for the
 * double-submit pattern (read cookie value, send as header).
 */
export function setCsrfCookie(response: NextResponse): void {
  response.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
    httpOnly: false, // Must be readable by JS for double-submit
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
}

/**
 * Validates the CSRF double-submit pattern:
 * 1. Reads `ltwz_csrf` from cookie
 * 2. Reads `X-CSRF-Token` from request header
 * 3. Compares them using timingSafeEqual
 *
 * Returns an error NextResponse if validation fails, or null if valid.
 * Only validates mutations (POST, PUT, DELETE, PATCH).
 */
export function validateCsrfDoubleSubmit(request: Request): NextResponse | null {
  // Skip GET/HEAD/OPTIONS
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return null;

  // Read CSRF token from cookie
  const cookieHeader = request.headers.get("Cookie");
  let cookieToken: string | null = null;
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
    if (match) cookieToken = match[1].trim();
  }

  // Read CSRF token from header
  const headerToken = request.headers.get("X-CSRF-Token");

  if (!cookieToken || !headerToken) {
    return NextResponse.json(
      { error: "CSRF token missing" },
      { status: 403 }
    );
  }

  // Timing-safe comparison
  try {
    const a = Buffer.from(cookieToken, "utf-8");
    const b = Buffer.from(headerToken, "utf-8");
    if (a.length !== b.length) return NextResponse.json(
      { error: "CSRF validation failed" },
      { status: 403 }
    );
    const isValid = timingSafeEqual(a, b);
    if (!isValid) {
      console.warn("[CSRF] Double-submit validation failed");
      return NextResponse.json(
        { error: "CSRF validation failed" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "CSRF validation error" },
      { status: 403 }
    );
  }

  return null;
}

// ─── File Upload Validation ─────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const ALLOWED_MIME_PREFIXES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

/**
 * Validates uploaded file size and extension.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateFileUpload(file: File): string | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }

  // Check extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }

  return null;
}

// ─── Client IP Extraction ────────────────────────────────────
// Vercel puts the client IP in x-forwarded-for or x-vercel-forwarded-for

export function getClientIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  // Vercel also sets this
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
