// ─── NextAuth.js v5 Route Handler ─────────────────────────────
// Dynamically imported to avoid build-time crashes without env vars

export async function GET(request: any) {
  const { GET } = await import("@/lib/auth");
  return GET(request);
}

export async function POST(request: any) {
  const { POST } = await import("@/lib/auth");
  return POST(request);
}