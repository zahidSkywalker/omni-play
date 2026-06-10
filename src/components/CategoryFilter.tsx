'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  countries: string[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  className?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  countries,
  selectedCountry,
  onCountryChange,
  className,
}: CategoryFilterProps) {
  const displayCategories = categories.slice(0, 20);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Country Filter */}
      <div className="flex items-center gap-2">
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="bg-[var(--bg-tertiary)] rounded-full px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none appearance-none cursor-pointer pr-8 border border-[var(--border-light)]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ea2a6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          <option value="all" className="bg-white">🌍 All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country} className="bg-white">
              {country}
            </option>
          ))}
        </select>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange('all')}
          className={cn(
            'chip shrink-0',
            selectedCategory === 'all'
              ? 'chip-active'
              : 'chip-inactive'
          )}
        >
          All
        </motion.button>
        {displayCategories.map((category) => (
          <motion.button
            key={category}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category)}
            className={cn(
              'chip shrink-0',
              selectedCategory === category
                ? 'chip-active'
                : 'chip-inactive'
            )}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
