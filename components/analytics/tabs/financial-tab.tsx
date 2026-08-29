'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  Percent,
  Calendar,
  PiggyBank,
  BadgeCheck,
  Calculator,
  Building,
  Landmark,
  Zap,
  Sun,
  Wind,
  Battery,
  Cable,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/plan';
import { CostBreakdownChart } from '../charts/cost-breakdown-chart';
import { CashFlowChart } from '../charts/cash-flow-chart';
import { generateIncentivesData, generateEquipmentData, type IncentiveData, type EquipmentLineItem } from '../charts/financial-data';

interface FinancialTabProps {
  plan: Plan | null;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `₹${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`;
  }
  return `₹${value.toFixed(0)}`;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  gradient: string;
  highlight?: boolean;
}

function MetricCard({ icon, label, value, subtext, gradient, highlight }: MetricCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'rounded-xl border border-border bg-card p-4',
        highlight && 'ring-2 ring-primary/20 border-primary/30'
      )}
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

const INCENTIVE_ICONS: Record<IncentiveData['type'], typeof BadgeCheck> = {
  federal: Landmark,
  state: Building,
  utility: Zap,
  other: BadgeCheck,
};

const INCENTIVE_COLORS: Record<IncentiveData['type'], string> = {
  federal: 'bg-blue-500/10 text-blue-500',
  state: 'bg-violet-500/10 text-violet-500',
  utility: 'bg-amber-500/10 text-amber-500',
  other: 'bg-emerald-500/10 text-emerald-500',
};

function IncentiveRow({ incentive }: { incentive: IncentiveData }) {
  const Icon = INCENTIVE_ICONS[incentive.type];
  const colorClass = INCENTIVE_COLORS[incentive.type];

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-between py-3 border-b border-border last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{incentive.name}</p>
          <p className="text-xs text-muted-foreground">{incentive.description}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
        -{formatCurrency(incentive.amount)}
      </span>
    </motion.div>
  );
}

const CATEGORY_ICONS: Record<EquipmentLineItem['category'], typeof Sun> = {
  solar: Sun,
  wind: Wind,
  storage: Battery,
  bos: Cable,
  installation: Wrench,
};

const CATEGORY_COLORS: Record<EquipmentLineItem['category'], string> = {
  solar: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  wind: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  storage: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  bos: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  installation: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

const CATEGORY_LABELS: Record<EquipmentLineItem['category'], string> = {
  solar: 'Solar Equipment',
  wind: 'Wind Equipment',
  storage: 'Energy Storage',
  bos: 'Balance of System',
  installation: 'Installation',
};

function EquipmentRow({ item }: { item: EquipmentLineItem }) {
  const Icon = CATEGORY_ICONS[item.category];
  const colorClass = CATEGORY_COLORS[item.category];

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', colorClass)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground truncate">{item.model}</p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <p className="text-sm font-semibold text-foreground tabular-nums">
          ₹{item.totalPrice.toLocaleString()}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-muted-foreground">
            {item.quantity} × ₹{item.unitPrice.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

export function FinancialTab({ plan, className }: FinancialTabProps) {

  const financials = useMemo(() => {
    const totalCost = plan?.financials?.totalCost ?? 0;
    const netCost = plan?.financials?.netCostAfterIncentives ?? 0;
    const annualSavings = plan?.financials?.annualSavings ?? 0;
    const paybackYears = plan?.financials?.paybackYears ?? 0;
    const roi25Year = plan?.financials?.roi25Year ?? 0;

    return {
      totalCost,
      netCost,
      annualSavings,
      paybackYears,
      roi25Year,
    };
  }, [plan]);

  const totalIncentives = Math.max((financials.totalCost || 0) - (financials.netCost || 0), 0);
  const equipmentTotal = financials.totalCost || 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.05 }}
      className={cn('p-6 space-y-6', className)}
    >

      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Investment Summary
        </h3>

        <div className="grid grid-cols-2 gap-3">

          <MetricCard
            icon={<IndianRupee className="h-5 w-5" />}
            label="Gross Cost"
            value={formatCurrency(financials.totalCost)}
            subtext="Before incentives"
            gradient="bg-gradient-to-br from-slate-500 to-gray-600"
          />

          <MetricCard
            icon={<PiggyBank className="h-5 w-5" />}
            label="Net Cost"
            value={formatCurrency(financials.netCost)}
            subtext="After incentives"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
            highlight
          />

          <MetricCard
            icon={<Calendar className="h-5 w-5" />}
            label="Payback"
            value={`${financials.paybackYears.toFixed(1)} yrs`}
            subtext="Break-even point"
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          />

          <MetricCard
            icon={<Percent className="h-5 w-5" />}
            label="25-Year ROI"
            value={`${financials.roi25Year.toFixed(0)}%`}
            subtext="Total return"
            gradient="bg-gradient-to-br from-violet-500 to-purple-500"
          />

        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Equipment & Materials</h3>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            ₹{equipmentTotal.toLocaleString()}
          </span>
        </div>
      </motion.div>

      <CashFlowChart plan={plan} />
      <CostBreakdownChart plan={plan} />

    </motion.div>
  );
}