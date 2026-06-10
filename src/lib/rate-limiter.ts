// Centralized rate limiter for API routes
// Note: In serverless (Vercel), this resets per-invocation.
// For production, consider @upstash/ratelimit or similar.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;

export function checkRateLimit(request: Request): boolean {
  // On Vercel, x-real-ip is set by the edge network
  const ip = request.headers.get('x-real-ip') || 
    // Fallback: extract last IP from x-forwarded-for (rightmost = most trusted)
    (() => {
      const xff = request.headers.get('x-forwarded-for');
      if (!xff) return 'unknown';
      const ips = xff.split(',').map(s => s.trim());
      return ips[ips.length - 1] || 'unknown';
    })();
  
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}
