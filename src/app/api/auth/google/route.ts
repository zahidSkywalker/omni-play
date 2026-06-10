// ─── Google OAuth — Redirect & Callback ────────────────────────
// Production-grade Google OAuth2 Authorization Code Flow.
// Step 1: GET → Redirects browser to Google's consent screen.
// Step 2: GET /callback → Handles Google's redirect, creates user/session, sets httpOnly cookie.

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { generateOAuthState, getAppUrl } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  // If there's a "callback" in the path, this is handled by the callback route
  // This route only handles the initial redirect

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID environment variable." },
      { status: 503 }
    );
  }

  const appUrl = getAppUrl();
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Generate state for CSRF protection
  const state = generateOAuthState();

  // Build Google OAuth URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  // Store state in a short-lived cookie for CSRF verification on callback
  const response = NextResponse.redirect(googleAuthUrl.toString());
  response.cookies.set("ltwz_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google/callback",
    maxAge: 600, // 10 minutes — enough for OAuth flow
  });

  // Store the intended redirect destination (where user was before clicking login)
  const returnTo = searchParams.get("returnTo") || "/";
  response.cookies.set("ltwz_oauth_return", returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
