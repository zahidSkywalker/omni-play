'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Channel } from '@/lib/types';
import { getCountryFlag } from '@/lib/types';
import GlassCard from './GlassCard';

interface ChannelGridProps {
  channels: Channel[];
  favorites: string[];
  onChannelClick: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  loading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
};

function ChannelCard({
  channel,
  isFavorite,
  onChannelClick,
  onToggleFavorite,
}: {
  channel: Channel;
  isFavorite: boolean;
  onChannelClick: (ch: Channel) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <motion.div variants={cardVariants}>
      <GlassCard
        className="relative group/card"
        onClick={() => onChannelClick(channel)}
        padding="p-0"
      >
        {/* Thumbnail Area */}
        <div className="relative aspect-video bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : (
            <span className="text-2xl font-bold text-[var(--text-tertiary)] truncate px-2 text-center">
              {channel.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="hidden absolute inset-0 bg-[var(--bg-tertiary)] flex items-center justify-center">
            <span className="text-3xl font-bold text-[var(--text-tertiary)]">
              {channel.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Dark gradient overlay at bottom of thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className="size-4"
              fill={isFavorite ? '#ef4444' : 'none'}
              stroke={isFavorite ? '#ef4444' : 'white'}
              strokeWidth={2}
            />
          </button>

          {/* Country Flag */}
          {channel.country && (
            <div className="absolute top-2 left-2 z-10 text-sm">
              {getCountryFlag(channel.country)}
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{channel.name}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[var(--text-tertiary)] truncate">
              {channel.country || 'Unknown'}
            </span>
            {channel.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--purple-faint)] text-[var(--purple-deep)]">
                {channel.category}
              </span>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ChannelCardSkeleton() {
  return (
    <motion.div variants={cardVariants}>
      <div className="card overflow-hidden p-0">
        <div className="shimmer aspect-video" />
        <div className="p-3 space-y-2">
          <div className="shimmer h-4 rounded w-3/4" />
          <div className="shimmer h-3 rounded w-1/2" />
        </div>
      </div>
    </motion.div>
  );
}

export default function ChannelGrid({
  channels,
  favorites,
  onChannelClick,
  onToggleFavorite,
  loading = false,
}: ChannelGridProps) {
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  if (loading && channels.length === 0) {
    return (
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <ChannelCardSkeleton key={`skeleton-${i}`} />
        ))}
      </motion.div>
    );
  }

  if (channels.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="card rounded-full p-4 mb-4">
          <svg className="size-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] text-lg font-medium">No channels found</p>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      key={channels.map(c => c.id).join(',')}
    >
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          isFavorite={favSet.has(channel.id)}
          onChannelClick={onChannelClick}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </motion.div>
  );
}
