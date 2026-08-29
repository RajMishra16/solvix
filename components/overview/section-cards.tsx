'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  IndianRupee,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/plan';

interface SectionCardsProps {
  plan: Plan;
  onProductionClick: () => void;
  onFinancialClick: () => void;
  onEnvironmentalClick: () => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 26,
    },
  },
};

function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toLocaleString();
}

function formatCurrency(value: number): string {

  // Crore
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }

  // Lakh
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(0)}L`;
  }

  return `₹${value.toLocaleString('en-IN')}`;
}

interface SectionCardProps {
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  icon: React.ReactNode;
  accentColor: string;
  onClick: () => void;
}

function SectionCard({
  title,
  subtitle,
  metric,
  metricLabel,
  icon,
  accentColor,
  onClick,
}: SectionCardProps) {
  return (
    <motion.button
      variants={cardVariants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border bg-card p-4 text-left',
        'transition-all duration-200',
        'hover:shadow-md hover:border-border/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <div className="flex items-center gap-4">

        <div className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          accentColor
        )}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-center justify-between gap-2">

            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground" />

          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-foreground tabular-nums">{metric}</span>
            <span className="text-sm text-muted-foreground">{metricLabel}</span>
          </div>

        </div>

      </div>
    </motion.button>
  );
}

export function SectionCards({
  plan,
  onProductionClick,
  onFinancialClick,
  onEnvironmentalClick,
  className,
}: SectionCardsProps) {

  const metrics = useMemo(() => {
    const annualProduction = plan.analysis?.annualProductionKwh ?? 0;
    const netCost = plan.financials?.netCostAfterIncentives ?? 0;
    const co2Offset = plan.analysis?.co2OffsetTons ?? 0;

    return {
      annualProduction,
      netCost,
      co2Offset,
    };
  }, [plan]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-3', className)}
    >

      <motion.p
        variants={cardVariants}
        className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Explore Details
      </motion.p>

      <SectionCard
        title="Environmental"
        subtitle="Carbon offset & impact"
        metric={`${metrics.co2Offset.toFixed(1)}`}
        metricLabel="tons CO₂/year"
        icon={<Leaf className="h-5 w-5 text-teal-600" />}
        accentColor="bg-teal-100 dark:bg-teal-500/15"
        onClick={onEnvironmentalClick}
      />

      <SectionCard
        title="Production"
        subtitle="Energy generation forecasts"
        metric={`${formatLargeNumber(metrics.annualProduction)}`}
        metricLabel="kWh/year"
        icon={<Sun className="h-5 w-5 text-amber-600" />}
        accentColor="bg-amber-100 dark:bg-amber-500/15"
        onClick={onProductionClick}
      />

      <SectionCard
        title="Financial"
        subtitle="Costs, savings & incentives"
        metric={formatCurrency(metrics.netCost)}
        metricLabel="net cost"
        icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
        accentColor="bg-emerald-100 dark:bg-emerald-500/15"
        onClick={onFinancialClick}
      />

    </motion.div>
  );
}