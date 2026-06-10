'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  enable3D?: boolean;
  showGradientBorder?: boolean;
  padding?: string;
}

export default function GlassCard({
  children,
  className,
  onClick,
  enable3D = false,
  showGradientBorder = false,
  padding = 'p-0',
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'card overflow-hidden cursor-pointer',
        enable3D && 'card-3d',
        showGradientBorder && 'gradient-border-purple',
        padding,
        className
      )}
      whileHover={enable3D ? {
        y: -6,
        rotateX: -2,
        rotateY: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      } : {
        y: -4,
        transition: { duration: 0.3 },
      }}
      whileTap={enable3D ? { scale: 0.97 } : { scale: 0.98 }}
      style={enable3D ? { perspective: 800, transformStyle: 'preserve-3d' } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
