"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { IUser } from "@/types";

// ─── Auth Context ────────────────────────────────────────────
// Session management backed by httpOnly cookies (server-side).
// No localStorage needed — the cookie is set/cleared by the server.

interface AuthContextValue {
  user: IUser | null;
  loading: boolean;
  login: () => void; // Triggers session refresh after login
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateLocalUser: (updates: Partial<IUser>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
  updateLocalUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user from /api/auth/me (reads httpOnly cookie automatically)
  const fetchUser = useCallback(async (): Promise<IUser | null> => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user as IUser;
    } catch {
      return null;
    }
  }, []);

  // Login: called after OAuth redirect or anonymous login completes
  // The cookie is already set by the server — just refresh user data
  const login = useCallback(() => {
    fetchUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [fetchUser]);

  // Logout: clear session on server (which clears the cookie)
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors — clear client state regardless
    }
    setUser(null);
    setLoading(false);
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    const u = await fetchUser();
    setUser(u);
  }, [fetchUser]);

  // Update local user state (without API call — for optimistic updates)
  const updateLocalUser = useCallback((updates: Partial<IUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // On mount: check if user has an active session (httpOnly cookie)
  useEffect(() => {
    async function init() {
      const u = await fetchUser();
      setUser(u);
      setLoading(false);
    }
    init();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
