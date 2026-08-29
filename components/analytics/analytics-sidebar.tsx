'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, DollarSign, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionTab } from './tabs/production-tab';
import { FinancialTab } from './tabs/financial-tab';
import { EnvironmentalTab } from './tabs/environmental-tab';
import type { Plan } from '@/types/plan';

export type AnalyticsTab = 'production' | 'financial' | 'environmental';

interface AnalyticsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  defaultTab?: AnalyticsTab;
  className?: string;
}

export function AnalyticsSidebar({
  isOpen,
  onClose,
  plan,
  defaultTab = 'production',
  className,
}: AnalyticsSidebarProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>(defaultTab);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const tabs = [
    { id: 'production' as const, label: 'Production', icon: TrendingUp },
    { id: 'financial' as const, label: 'Financial', icon: DollarSign },
    { id: 'environmental' as const, label: 'Environmental', icon: Leaf },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
<motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

<motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed right-0 top-0 z-50 flex h-full w-full sm:w-[480px] lg:w-[560px] flex-col',
              'bg-background border-l border-border shadow-2xl',
              className
            )}
            role="complementary"
            aria-label="Analytics"
          >
<header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Analytics
                  </h2>
                  {plan && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {plan.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close analytics sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

<div className="shrink-0 border-b border-border px-6 py-3">
              <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as AnalyticsTab)}>
                <TabsList variant="line" className="w-full justify-start gap-1">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm"
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

<div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTab === 'production' && <ProductionTab plan={plan} />}
                  {activeTab === 'financial' && <FinancialTab plan={plan} />}
                  {activeTab === 'environmental' && <EnvironmentalTab plan={plan} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
