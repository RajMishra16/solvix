'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MetricsGrid } from './metrics-grid';
import { SectionCards } from './section-cards';
import { ProductionTab } from '@/components/analytics/tabs/production-tab';
import { FinancialTab } from '@/components/analytics/tabs/financial-tab';
import { EnvironmentalTab } from '@/components/analytics/tabs/environmental-tab';
import type { Plan } from '@/types/plan';

export type SectionType = 'production' | 'financial' | 'environmental';

interface PlanDetailPanelProps {
  plan: Plan;
  className?: string;
}

const mainViewVariants = {
  enter: { opacity: 0, y: 40 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
};

const sectionViewVariants = {
  enter: { opacity: 0, y: -40 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

const SECTION_TITLES: Record<SectionType, string> = {
  production: 'Production Analytics',
  financial: 'Financial Analysis',
  environmental: 'Environmental Impact',
};

export function PlanDetailPanel({ plan, className }: PlanDetailPanelProps) {
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);

  const handleSectionClick = useCallback((section: SectionType) => {
    setActiveSection(section);
  }, []);

  const handleBack = useCallback(() => {
    setActiveSection(null);
  }, []);

  return (
    <div className={cn('relative h-full overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        {activeSection === null ? (
          <motion.div
            key="main-view"
            variants={mainViewVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <MetricsGrid
                systemSizeKw={plan.analysis?.systemSizeKw ?? 0}
                annualProductionKwh={plan.analysis?.annualProductionKwh ?? 0}
                totalCost={plan.financials?.totalCost ?? 0}
                netCost={plan.financials?.netCostAfterIncentives ?? 0}
                paybackYears={plan.financials?.paybackYears ?? 0}
                annualSavings={plan.financials?.annualSavings ?? 0}
              />

              <SectionCards
                plan={plan}
                onProductionClick={() => handleSectionClick('production')}
                onFinancialClick={() => handleSectionClick('financial')}
                onEnvironmentalClick={() => handleSectionClick('environmental')}
              />

              <section className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Created {new Date(plan.createdAt).toLocaleDateString()}</span>
                  <span>{plan.area.areaAcres.toFixed(2)} acres</span>
                </div>
              </section>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`section-${activeSection}`}
            variants={sectionViewVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-base font-semibold text-foreground">
                {SECTION_TITLES[activeSection]}
              </h2>
            </div>

            {activeSection === 'production' && <ProductionTab plan={plan} />}
            {activeSection === 'financial' && <FinancialTab plan={plan} />}
            {activeSection === 'environmental' && <EnvironmentalTab plan={plan} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
