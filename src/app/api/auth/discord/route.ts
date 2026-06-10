// ─── Discord OAuth — Redirect ──────────────────────────────────
// Production-grade Discord OAuth2 Authorization Code Flow.
// Step 1: GET → Redirects browser to Discord's authorization page.

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { generateOAuthState, getAppUrl } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Discord OAuth is not configured. Please set DISCORD_CLIENT_ID environment variable." },
      { status: 503 }
    );
  }

  const appUrl = getAppUrl();
  const redirectUri = `${appUrl}/api/auth/discord/callback`;

  // Generate state for CSRF protection
  const state = generateOAuthState();

  // Build Discord OAuth URL
  const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize");
  discordAuthUrl.searchParams.set("response_type", "code");
  discordAuthUrl.searchParams.set("client_id", clientId);
  discordAuthUrl.searchParams.set("redirect_uri", redirectUri);
  discordAuthUrl.searchParams.set("scope", "identify email");
  discordAuthUrl.searchParams.set("state", state);
  discordAuthUrl.searchParams.set("prompt", "consent");

  // Store state in a short-lived cookie for CSRF verification
  const response = NextResponse.redirect(discordAuthUrl.toString());
  response.cookies.set("ltwz_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/discord/callback",
    maxAge: 600,
  });

  // Store return destination
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/";
  response.cookies.set("ltwz_oauth_return", returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
