'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  width?: 'sm' | 'md' | 'lg';
}

const widthClasses = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[480px]',
};

export function Sidebar({
  isOpen,
  onClose,
  children,
  title,
  className,
  width = 'md',
}: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 h-full bg-background border-l border-border shadow-xl z-50 flex flex-col',
              widthClasses[width],
              className
            )}
          >
            <header className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0">
              {title && (
                <h2 className="font-semibold text-foreground">{title}</h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close sidebar"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
