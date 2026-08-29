'use client';

import { motion } from 'framer-motion';
import { 
  Zap, 
  Sun, 
  Leaf, 
  Clock, 
  DollarSign, 
  TrendingUp,
  RotateCcw,
  ArrowRight,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AnalysisSummaryProps {
  systemSizeKw: number;
  annualProductionKwh: number;
  totalCost: number;
  netCost: number;
  paybackYears: number;
  annualSavings: number;
  co2OffsetTons: number;
  onSavePlan: () => void;
  onStartOver: () => void;
  isSaving?: boolean;
  className?: string;
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  iconColor: string;
  delay: number;
}

function MetricCard({ icon: Icon, label, value, subValue, iconColor, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
    >
      <div className={cn('p-2 rounded-lg', iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </motion.div>
  );
}

export function AnalysisSummary({
  systemSizeKw,
  annualProductionKwh,
  totalCost,
  netCost,
  paybackYears,
  annualSavings,
  co2OffsetTons,
  onSavePlan,
  onStartOver,
  isSaving = false,
  className,
}: AnalysisSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('space-y-4', className)}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center pb-2 border-b border-border"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-2">
          <Zap className="h-4 w-4" />
          Your Energy Plan Summary
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          icon={Sun}
          label="System Size"
          value={`${systemSizeKw} kW`}
          iconColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          delay={0.15}
        />
        <MetricCard
          icon={Zap}
          label="Annual Production"
          value={`${formatNumber(annualProductionKwh)} kWh`}
          iconColor="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          delay={0.2}
        />
        <MetricCard
          icon={DollarSign}
          label="Total Investment"
          value={formatCurrency(totalCost)}
          subValue={`${formatCurrency(netCost)} after incentives`}
          iconColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          delay={0.25}
        />
        <MetricCard
          icon={Clock}
          label="Payback Period"
          value={`${paybackYears} years`}
          iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          delay={0.3}
        />
        <MetricCard
          icon={TrendingUp}
          label="Annual Savings"
          value={formatCurrency(annualSavings)}
          iconColor="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          delay={0.35}
        />
        <MetricCard
          icon={Leaf}
          label="CO₂ Offset"
          value={`${co2OffsetTons.toFixed(1)} tons/yr`}
          iconColor="bg-green-500/10 text-green-600 dark:text-green-400"
          delay={0.4}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-2 pt-2"
      >
        <Button 
          className="w-full gap-2" 
          size="lg"
          onClick={onSavePlan}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <motion.div
                className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Saving Plan...
            </>
          ) : (
            <>
              Save & View Full Plan
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
          size="sm"
          onClick={onStartOver}
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4" />
          Start Over
        </Button>
      </motion.div>
    </motion.div>
  );
}
