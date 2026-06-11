'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Radio, Heart, Clock, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { View } from '@/lib/types';

interface NavBarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const navItems: { id: View; label: string; icon: typeof Tv }[] = [
  { id: 'home', label: 'Home', icon: Tv },
  { id: 'channels', label: 'Channels', icon: Radio },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'recent', label: 'Recent', icon: Clock },
];

export default function NavBar({ activeView, onViewChange, searchQuery, onSearchChange }: NavBarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Desktop / Tablet Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 top-nav">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.button
            onClick={() => onViewChange('home')}
            className="flex items-center gap-2.5 shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="gradient-bg-purple rounded-xl p-2 glow-purple">
              <Tv className="size-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text-purple font-heading">
              Omni Play
            </span>
          </motion.button>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f0f0f2] rounded-full p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    'relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 min-h-[36px]',
                    isActive
                      ? 'text-white shadow-md gradient-bg-purple'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Search */}
          <div className="hidden lg:flex items-center w-72">
            <div className="bg-[var(--bg-tertiary)] rounded-full flex items-center w-full px-4 py-2 gap-2 border border-[var(--border-light)] focus-within:border-[var(--purple-medium)] focus-within:shadow-[0_0_0_3px_rgba(142,98,186,0.1)] transition-all">
              <Search className="size-4 text-[var(--text-tertiary)] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search channels..."
                className="flex-1 bg-transparent text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] outline-none"
              />
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden bg-[var(--bg-tertiary)] rounded-full p-2 text-[var(--text-primary)]"
          >
            {showMobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Search Dropdown */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-3 md:hidden border-t border-[var(--border-light)]"
            >
              <div className="bg-[var(--bg-tertiary)] rounded-full flex items-center w-full px-4 py-2.5 gap-2 mt-2 border border-[var(--border-light)]">
                <Search className="size-4 text-[var(--text-tertiary)] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search channels, countries..."
                  className="flex-1 bg-transparent text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bottom-tab-bar">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all min-w-[48px] min-h-[44px] relative',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-tab"
                    className="absolute inset-0 rounded-xl bg-white/15"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ margin: '2px' }}
                  />
                )}
                <Icon
                  className={cn(
                    'size-5 relative z-10 transition-colors',
                    isActive ? 'text-white' : 'text-[#aa88c8]'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium relative z-10 transition-colors',
                    isActive ? 'text-white' : 'text-[#aa88c8]'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
