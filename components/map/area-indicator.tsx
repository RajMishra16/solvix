'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateAreaWithUnits, formatArea, type Coordinate } from '@/lib/geo';

interface AreaIndicatorProps {
  coordinates: Coordinate[];
  className?: string;
  variant?: 'floating' | 'inline';
  showIcon?: boolean;
}

export function AreaIndicator({
  coordinates,
  className,
  variant = 'floating',
  showIcon = true,
}: AreaIndicatorProps) {
  const areaData = useMemo(() => {
    if (coordinates.length < 3) return null;
    return calculateAreaWithUnits(coordinates);
  }, [coordinates]);

  const displayText = useMemo(() => {
    if (!areaData) return null;
    return formatArea(areaData.acres);
  }, [areaData]);

  const isValidArea = coordinates.length >= 3;

  if (variant === 'inline') {
    return (
      <AnimatePresence mode="wait">
        {isValidArea && displayText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn('flex items-center gap-2', className)}
          >
            {showIcon && <Ruler className="h-4 w-4 text-primary" />}
            <span className="font-semibold">{displayText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isValidArea && displayText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border border-border/50',
            'px-4 py-3',
            className
          )}
        >
          <div className="flex items-center gap-3">
            {showIcon && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Ruler className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Area
              </span>
              <motion.span
                key={displayText}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold text-foreground"
              >
                {displayText}
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
