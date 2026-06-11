"use client";

import { useState } from "react";
import {
  LogIn,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/components/AuthProvider";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { login } = useAuth();

  // Anonymous login state
  const [anonUsername, setAnonUsername] = useState("");
  const [anonError, setAnonError] = useState("");
  const [anonLoading, setAnonLoading] = useState(false);

  // OAuth loading state
  const [oauthLoading, setOauthLoading] = useState<"google" | "discord" | null>(null);

  const handleAnonymousLogin = async () => {
    setAnonError("");
    setAnonLoading(true);
    try {
      const res = await fetch("/api/auth/anonymous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: anonUsername }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnonError(data.error || "Failed to create account");
        return;
      }
      // Cookie is set by server — refresh user state
      login();
      onOpenChange(false);
      setAnonUsername("");
    } catch {
      setAnonError("Something went wrong. Please try again.");
    } finally {
      setAnonLoading(false);
    }
  };

  // Real OAuth: redirect to provider's consent screen
  const handleOAuthLogin = (provider: "google" | "discord") => {
    setOauthLoading(provider);
    // The server handles the redirect to Google/Discord OAuth consent
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-surface sm:max-w-md border-gray-200 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LogIn className="w-5 h-5 text-emerald-400" />
            Login to Your Account
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your progress, compete on the leaderboard, and earn badges.
          </p>
        </DialogHeader>

        <Tabs defaultValue="anonymous" className="w-full">
          <TabsList className="w-full bg-gray-100 dark:bg-white/5">
            <TabsTrigger
              value="anonymous"
              className="flex-1 data-active:bg-emerald-500/15 data-active:text-emerald-400 data-active:shadow-none"
            >
              <User className="w-4 h-4 mr-1.5" />
              Username
            </TabsTrigger>
            <TabsTrigger
              value="google"
              className="flex-1 data-active:bg-emerald-500/15 data-active:text-emerald-400 data-active:shadow-none"
            >
              Google
            </TabsTrigger>
            <TabsTrigger
              value="discord"
              className="flex-1 data-active:bg-emerald-500/15 data-active:text-emerald-400 data-active:shadow-none"
            >
              Discord
            </TabsTrigger>
          </TabsList>

          {/* Anonymous Login Tab */}
          <TabsContent value="anonymous" className="tab-enter">
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="anon-username" className="text-gray-300 text-sm">
                  Choose a Username
                </Label>
                <Input
                  id="anon-username"
                  type="text"
                  placeholder="e.g. zahid_2024"
                  value={anonUsername}
                  onChange={(e) => {
                    setAnonUsername(e.target.value);
                    setAnonError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAnonymousLogin()}
                  className="mt-1.5 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-emerald-500/50"
                  disabled={anonLoading}
                />
                {anonError && (
                  <p className="text-xs text-red-400 mt-1.5">{anonError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">
                  Letters, numbers, hyphens, and underscores only. 2-30 characters.
                </p>
              </div>

              <Button
                onClick={handleAnonymousLogin}
                disabled={anonLoading || anonUsername.trim().length < 2}
                className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
              >
                {anonLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Continue with Username
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Google Login Tab */}
          <TabsContent value="google" className="tab-enter">
            <div className="space-y-4 mt-4">
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Continue with Google</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sign in securely with your Google account</p>
              </div>

              <Button
                onClick={() => handleOAuthLogin("google")}
                disabled={oauthLoading !== null}
                className="w-full gap-2 bg-white text-gray-900 hover:bg-gray-100 font-semibold"
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  </svg>
                )}
                Sign in with Google
              </Button>
            </div>
          </TabsContent>

          {/* Discord Login Tab */}
          <TabsContent value="discord" className="tab-enter">
            <div className="space-y-4 mt-4">
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#5865F2">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-1">Continue with Discord</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Link your Discord account securely</p>
              </div>

              <Button
                onClick={() => handleOAuthLogin("discord")}
                disabled={oauthLoading !== null}
                className="w-full gap-2 bg-[#5865F2] text-white hover:bg-[#4752C4] font-semibold"
              >
                {oauthLoading === "discord" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                )}
                Sign in with Discord
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
