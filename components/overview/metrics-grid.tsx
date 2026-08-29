'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Sun, 
  IndianRupee, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
  systemSizeKw: number;
  annualProductionKwh: number;
  totalCost: number;
  netCost: number;
  paybackYears: number;
  annualSavings: number;
  className?: string;
}

function formatCurrency(value: number): string {

  // Crores
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }

  // Lakhs
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(0)}L`;
  }

  return `₹${value.toLocaleString('en-IN')}`;
}

function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString();
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export function MetricsGrid({
  systemSizeKw,
  annualProductionKwh,
  totalCost,
  netCost,
  paybackYears,
  annualSavings,
  className,
}: MetricsGridProps) {

  const savingsPercent = totalCost > 0 ? ((totalCost - netCost) / totalCost) * 100 : 0;
  const roi25Year = annualSavings * 25;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-4', className)}
    >

      {/* System Capacity */}

      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6"
      >
        <div className="relative flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                System Capacity
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-foreground">
                {systemSizeKw}
              </span>
              <span className="text-xl text-muted-foreground font-medium">
                kW
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              Total installed capacity
            </p>

          </div>

          <Sun className="h-10 w-10 text-amber-500" />

        </div>
      </motion.div>

      {/* Metrics Cards */}

      <div className="grid grid-cols-2 gap-3">

        {/* Annual Production */}

        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sun className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              Annual Production
            </span>
          </div>

          <div className="text-2xl font-bold text-foreground">
            {formatLargeNumber(annualProductionKwh)}
            <span className="text-sm text-muted-foreground ml-1">
              kWh
            </span>
          </div>
        </motion.div>


        {/* Investment */}

        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-card border border-border p-4"
        >

          <div className="flex items-center gap-2 mb-3">
            <IndianRupee className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">
              Investment
            </span>
          </div>

          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(netCost)}
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs">

            <span className="text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {savingsPercent.toFixed(0)}% saved
            </span>

            <span className="text-muted-foreground">
              from {formatCurrency(totalCost)}
            </span>

          </div>

        </motion.div>


        {/* Payback */}

        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-card border border-border p-4"
        >

          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">
              Payback Period
            </span>
          </div>

          <div className="text-2xl font-bold text-foreground">
            {paybackYears}
            <span className="text-sm text-muted-foreground ml-1">
              yrs
            </span>
          </div>

        </motion.div>


        {/* Annual Savings */}

        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-card border border-border p-4"
        >

          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            <span className="text-xs text-muted-foreground">
              Annual Savings
            </span>
          </div>

          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(annualSavings)}
            <span className="text-sm text-muted-foreground ml-1">
              /yr
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            <span className="text-violet-600 font-medium">
              {formatCurrency(roi25Year)}
            </span> over 25 years
          </p>

        </motion.div>

      </div>

    </motion.div>
  );
}