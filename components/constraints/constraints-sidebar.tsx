'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ConstraintsValidation } from '@/hooks/use-constraints-validation';

interface ConstraintsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onMapWidthChange?: (width: string) => void;
  onAnalyze?: () => void;
  validation?: ConstraintsValidation;
  children?: React.ReactNode;
}


export function ConstraintsSidebar({
  isOpen,
  onClose,
  onMapWidthChange,
  onAnalyze,
  validation,
  children,
}: ConstraintsSidebarProps) {
  const canProceed = validation?.canProceed ?? false;
  const completedCount = validation?.completedCount ?? 0;
  const totalSections = validation?.sections.length ?? 5;
  useEffect(() => {
    if (isOpen) {
      onMapWidthChange?.('calc(100% - 420px)');
    } else {
      onMapWidthChange?.('100%');
    }
    
    return () => {
      onMapWidthChange?.('100%');
    };
  }, [isOpen, onMapWidthChange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={cn(
            'fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col',
            'bg-background border-l border-border shadow-2xl',
            'pointer-events-auto' 
          )}
          role="complementary"
          aria-label="Project Constraints"
        >
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <h2 className="text-base font-semibold text-foreground">
              Project Constraints
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close constraints sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {children ? (
              children
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground/60 space-y-4">
                <div className="rounded-full bg-muted/50 p-4">
                  <svg
                    className="h-8 w-8 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <p className="text-sm">Constraint sections will appear here</p>
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {canProceed ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {completedCount} of {totalSections} sections complete
                </span>
              </div>
              {validation && !canProceed && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Complete required fields
                </span>
              )}
            </div>
            <Button
              className={cn(
                "w-full gap-2 shadow-sm transition-all duration-300",
                canProceed && "bg-primary hover:bg-primary/90"
              )}
              size="lg"
              disabled={!canProceed}
              onClick={onAnalyze}
            >
              <Sparkles className="h-4 w-4" />
              Analyze My Land
            </Button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
