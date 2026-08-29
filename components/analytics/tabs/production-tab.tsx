'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Calendar, Clock, Zap, CloudSun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/plan';
import { MonthlyProductionChart } from '../charts/monthly-production-chart';
import { DailyProductionChart } from '../charts/daily-production-chart';

interface ProductionTabProps {
  plan: Plan | null;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  gradient: string;
}

function MetricCard({ icon, label, value, subtext, gradient }: MetricCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          gradient
        )}>
          <div className="text-white">{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">
            {value}
          </p>
          {subtext && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ProductionTab({ plan, className }: ProductionTabProps) {
  const metrics = useMemo(() => {
    const estimate = plan?.analysis ?? {
      systemSizeKw: 0,
      annualProductionKwh: 0,
      co2OffsetTons: 0,
      equipmentPlacements: [],
    };

    const systemSize = Number(estimate.systemSizeKw || 0);
    const annualProduction = Number(estimate.annualProductionKwh || 0);
    const monthlyAverage = annualProduction / 12;
    const capacityFactor = systemSize > 0 ? (annualProduction / (systemSize * 365 * 24 * 0.8)) * 100 : 0;

    return {
      systemSize: `${systemSize.toLocaleString('en-US', { maximumFractionDigits: 1 })} kW`,
      annualProduction: `${(annualProduction / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} MWh`,
      monthlyAverage: `${(monthlyAverage / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} MWh`,
      capacityFactor: `${capacityFactor.toFixed(1)}%`,
    };
  }, [plan]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.05 }}
      className={cn('p-6 space-y-6', className)}
    >
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Production Overview
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Zap className="h-5 w-5" />}
            label="System Size"
            value={metrics.systemSize}
            subtext="Peak DC capacity"
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          />
          <MetricCard
            icon={<Sun className="h-5 w-5" />}
            label="Annual Output"
            value={metrics.annualProduction}
            subtext="Estimated yearly"
            gradient="bg-gradient-to-br from-yellow-500 to-amber-500"
          />
          <MetricCard
            icon={<Calendar className="h-5 w-5" />}
            label="Monthly Avg"
            value={metrics.monthlyAverage}
            subtext="Per month average"
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Capacity Factor"
            value={metrics.capacityFactor}
            subtext="Utilization rate"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          />
        </div>
      </motion.div>

      <MonthlyProductionChart plan={plan} />

      <DailyProductionChart plan={plan} />

      <motion.div
        variants={itemVariants}
        className="rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
            <CloudSun className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">
              Weather Impact Analysis
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Production estimates account for historical weather patterns, cloud cover,
              and seasonal sun angles specific to your location.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
