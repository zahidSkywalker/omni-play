'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'player' | 'text';
}

function CardSkeleton() {
  return (
    <div className="card overflow-hidden p-0">
      <div className="shimmer aspect-video" />
      <div className="p-3 space-y-2">
        <div className="shimmer h-4 rounded w-3/4" />
        <div className="shimmer h-3 rounded w-1/2" />
      </div>
    </div>
  );
}

function PlayerSkeleton() {
  return (
    <div className="player-area overflow-hidden animate-pulse-glow">
      <div className="shimmer aspect-video flex items-center justify-center">
        <div className="size-12 rounded-full bg-[var(--bg-tertiary)] animate-pulse" />
      </div>
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-3">
      <div className="shimmer h-6 rounded w-1/3" />
      <div className="shimmer h-4 rounded w-2/3" />
      <div className="shimmer h-4 rounded w-1/2" />
    </div>
  );
}

export default function LoadingSkeleton({ count = 6, type = 'card' }: LoadingSkeletonProps) {
  if (type === 'player') {
    return <PlayerSkeleton />;
  }

  if (type === 'text') {
    return <TextSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`skeleton-${i}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
        >
          <CardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}
