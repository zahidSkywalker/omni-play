"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Trophy,
  Search,
  Clock,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Users,
  Layers,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import LoginModal from "@/components/auth/LoginModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/topics", label: "Topics", icon: Layers },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/lookup", label: "Lookup", icon: Search },
];

// ─── Extracted sub-components (outside parent for React Compiler) ──

function UserAvatar({ user, size = "sm" }: { user: { avatar?: string; name?: string } | null; size?: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.name || "User"}
      className={`${sizeClasses} rounded-full object-cover border border-emerald-500/30`}
    />
  ) : (
    <div
      className={`${sizeClasses} rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400`}
    >
      {user?.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

interface NavbarProps {
  examTitle?: string;
}

export default function Navbar({ examTitle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const isExamPage = pathname.startsWith("/exam/") && !pathname.startsWith("/exam/create");
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
  const { user, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Skip-to-content link
  const skipLink = (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-600 focus:text-white focus:text-sm focus:font-medium"
    >
      Skip to main content
    </a>
  );

  // Exam page simplified navbar
  if (isExamPage) {
    return (
      <header className="sticky top-0 z-50 glass-surface" role="banner">
        {skipLink}
        <nav className="px-4 py-3" aria-label="Exam navigation">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
                aria-label="Back to home"
              >
                <span className="font-[family-name:var(--font-cinzel)] text-base sm:text-lg font-bold gradient-text">
                  LTWZ
                </span>
              </Link>
              {user && (
                <div className="flex items-center gap-1.5">
                  <UserAvatar user={user} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">{user.username}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span className="truncate max-w-[200px] sm:max-w-[400px] text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {examTitle || "Exam in progress..."}
              </span>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  // Shared nav link renderer
  const renderNavLink = (link: typeof navLinks[number], size: "sm" | "base", role?: string) => {
    const Icon = link.icon;
    const active = isActive(link.href);
    const sizeClasses = size === "base"
      ? "px-4 py-3 rounded-xl text-base font-medium"
      : "px-4 py-2 rounded-lg text-sm font-medium";
    return (
      <Link
        key={link.href}
        href={link.href}
        role={role}
        aria-label={role ? undefined : link.label}
        aria-current={active ? "page" : undefined}
        className={`flex items-center ${size === "base" ? "gap-3" : "gap-2"} ${sizeClasses} transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          active
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
        }`}
      >
        <Icon className={size === "base" ? "w-5 h-5" : "w-4 h-4"} />
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-surface shadow-lg shadow-black/20" : "glass-card"
        }`}
        role="banner"
      >
        {skipLink}
        <nav className="px-4 py-3" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Brand */}
            <Link
              href="/"
              className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-1 py-0.5"
              aria-label="Learn Tech with Zahid — Home"
            >
              <span className="font-[family-name:var(--font-cinzel)] text-xl font-bold gradient-text">
                LTWZ
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => renderNavLink(link, "sm"))}

              {/* Auth section (desktop) */}
              <div className="flex items-center gap-2">
                {authLoading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                      <UserAvatar user={user} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hidden md:block" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8}>
                      <DropdownMenuLabel>
                        <div className="flex items-center gap-2">
                          <UserAvatar user={user} size="md" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">@{user.username}</p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push("/profile")}
                        className="cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/lookup")}
                        className="cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                        My Results
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => logout()}
                        variant="destructive"
                        className="cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                )}
              </div>
            </div>

            {/* Mobile: hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          id="mobile-menu"
          className={`sm:hidden fixed inset-0 top-[52px] z-40 transition-all duration-300 ease-out ${
            mobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!mobileOpen}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div
            className={`relative w-full max-w-xs ml-auto glass-surface p-4 flex flex-col gap-2 transition-transform duration-300 ease-out max-h-[calc(100vh-52px)] overflow-y-auto ${
              mobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="menu"
          >
            {navLinks.map((link) => renderNavLink(link, "base", "menuitem"))}

            {/* Mobile auth section */}
            <div className="border-t border-gray-200 dark:border-white/10 mt-2 pt-2">
              {authLoading ? (
                <div className="w-full h-10 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20">
                  <UserAvatar user={user} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">@{user.username}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              )}

              {/* Mobile auth links (shown when logged in) */}
              {user && (
                <div className="mt-2 space-y-1">
                  <Link
                    href="/profile"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <Link
                    href="/lookup"
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                  >
                    <Search className="w-5 h-5" />
                    My Results
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </>
  );
}
