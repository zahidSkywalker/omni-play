// ─── Google OAuth Callback ─────────────────────────────────────
// Handles the redirect from Google after user authorizes.
// 1. Verifies state parameter (CSRF protection)
// 2. Exchanges authorization code for tokens
// 3. Fetches user info from Google
// 4. Creates/finds user in database
// 5. Creates session and sets httpOnly cookie
// 6. Redirects to app

import { NextRequest, NextResponse } from "next/server";
import {
  generateSessionToken,
  getAppUrl,
  getSessionCookieOptions,
  createSession,
  findOrCreateOAuthUser,
  formatUser,
  exchangeCodeForGoogleTokens,
  getGoogleUserInfo,
  COOKIE_NAME,
} from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors from Google
    if (error) {
      console.error(`[Google OAuth] Error: ${error}, description: ${searchParams.get("error_description")}`);
      return NextResponse.redirect(`${getAppUrl()}/?auth_error=google_denied`);
    }

    if (!code || !returnedState) {
      return NextResponse.redirect(`${getAppUrl()}/?auth_error=google_invalid`);
    }

    // Verify state parameter (CSRF protection)
    const storedState = request.cookies.get("ltwz_oauth_state")?.value;
    if (!storedState || storedState !== returnedState) {
      console.warn("[Google OAuth] State mismatch — possible CSRF attack");
      return NextResponse.redirect(`${getAppUrl()}/?auth_error=csrf_invalid`);
    }

    // Clear the state cookie (one-time use)
    const appUrl = getAppUrl();
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await exchangeCodeForGoogleTokens(code, redirectUri);

    // Get user info from the ID token
    const userInfo = await getGoogleUserInfo(tokenResponse.id_token);

    // Create or find user in database
    const user = await findOrCreateOAuthUser({
      provider: "google",
      providerId: userInfo.providerId,
      name: userInfo.name,
      email: userInfo.email,
      avatar: userInfo.avatar,
    });

    // Create server-side session
    const sessionToken = await createSession(user._id);

    // Get the return destination
    const returnTo = request.cookies.get("ltwz_oauth_return")?.value || "/";

    // Build redirect response with session cookie
    const response = NextResponse.redirect(`${appUrl}${returnTo}`);

    // Set the session as an httpOnly, secure cookie
    response.cookies.set(COOKIE_NAME, sessionToken, getSessionCookieOptions());

    // Clear OAuth state cookies
    response.cookies.delete("ltwz_oauth_state");
    response.cookies.delete("ltwz_oauth_return");

    return response;
  } catch (err) {
    console.error("[Google OAuth] Callback error:", err);
    return NextResponse.redirect(`${getAppUrl()}/?auth_error=google_failed`);
  }
}
