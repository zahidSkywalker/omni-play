'use client';

import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search channels...',
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      className={cn(
        'bg-[var(--card-bg)] rounded-full border transition-all duration-300',
        isFocused
          ? 'border-[var(--purple-medium)] shadow-[0_0_0_3px_rgba(142,98,186,0.12)]'
          : 'border-[var(--border-light)]',
        className
      )}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center w-full px-4 py-2.5 gap-3">
        <Search className="size-4 text-[var(--text-tertiary)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] outline-none"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="bg-[var(--bg-tertiary)] rounded-full p-1 shrink-0 hover:bg-[var(--purple-faint)] transition-colors"
            >
              <X className="size-3 text-[var(--text-tertiary)]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
