'use client';

import * as React from 'react';
import { useMemo, useRef, useEffect } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import {
  TreePine,
  Car,
  Home,
  Leaf,
  Droplets,
  Globe,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/plan';

interface EnvironmentalTabProps {
  plan: Plan | null;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function AnimatedCounter({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    const formatted = decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current).toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}

interface HeroStatProps {
  label: string;
  value: number;
  decimals?: number;
  suffix: string;
  subtext: string;
  gradient: string;
  icon: React.ReactNode;
}

function HeroStat({ label, value, decimals = 0, suffix, subtext, gradient, icon }: HeroStatProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        gradient
      )}
    >
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="leaf-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#leaf-pattern)" />
        </svg>
      </div>

      <div className="absolute right-4 top-4 opacity-20">
        {icon}
      </div>

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
          {label}
        </p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <AnimatedCounter
            value={value}
            decimals={decimals}
            suffix={suffix}
            className="text-4xl font-bold tracking-tight text-white tabular-nums"
          />
        </div>
        <p className="mt-1.5 text-sm text-white/70">{subtext}</p>
      </div>
    </motion.div>
  );
}

interface EquivalencyCardProps {
  icon: React.ReactNode;
  value: number;
  unit: string;
  description: string;
  color: string;
  bgColor: string;
  delay?: number;
}

function EquivalencyCard({ icon, value, unit, description, color, bgColor, delay = 0 }: EquivalencyCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg',
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
          bgColor
        )}>
          <div className={color}>{icon}</div>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <AnimatedCounter
              value={value}
              className="text-2xl font-bold text-foreground tabular-nums"
            />
            <span className="text-lg font-medium text-muted-foreground">{unit}</span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground leading-tight">{description}</p>
        </div>
      </div>

      <div className={cn(
        'absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20',
        bgColor
      )} />
    </motion.div>
  );
}

export function EnvironmentalTab({ plan, className }: EnvironmentalTabProps) {
  const planAnalysis = plan?.analysis;
  const metrics = useMemo(() => {
    const annualCO2 = plan?.analysis?.co2OffsetTons ?? 0;
    const lifetimeCO2 = annualCO2 * 25;
    const treesEquivalent = Math.round(annualCO2 * 132);
    const carsOffRoad = Math.round(annualCO2 * 2.1);
    const homesPowered = Math.round((plan?.analysis?.annualProductionKwh ?? 0) / 8500);
    const gallonsGas = Math.round(annualCO2 * 1300);

    return {
      annualCO2,
      lifetimeCO2,
      treesEquivalent,
      carsOffRoad,
      homesPowered,
      gallonsGas,
    };
  }, [plan]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.06 }}
      className={cn('p-6 space-y-6', className)}
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Your Carbon Impact
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <HeroStat
            label="Annual CO₂ Offset"
            value={metrics.annualCO2}
            decimals={1}
            suffix=" tons"
            subtext="Greenhouse gases prevented each year"
            gradient="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600"
            icon={<Leaf className="h-16 w-16" />}
          />
          <div className="grid grid-cols-2 gap-3">
            <HeroStat
              label="25-Year Impact"
              value={metrics.lifetimeCO2}
              suffix=" tons"
              subtext="Lifetime offset"
              gradient="bg-gradient-to-br from-teal-500 to-cyan-600"
              icon={<TrendingUp className="h-12 w-12" />}
            />
            <HeroStat
              label="Gas Saved"
              value={metrics.gallonsGas}
              suffix=" gal/yr"
              subtext="Not burned annually"
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
              icon={<Droplets className="h-12 w-12" />}
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Real-World Equivalencies
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Your annual carbon offset is the same as:
        </p>
        <div className="space-y-3">
          <EquivalencyCard
            icon={<TreePine className="h-7 w-7" />}
            value={metrics.treesEquivalent}
            unit="trees"
            description="Seedlings grown for 10 years"
            color="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-100 dark:bg-emerald-500/15"
            delay={0}
          />
          <EquivalencyCard
            icon={<Car className="h-7 w-7" />}
            value={metrics.carsOffRoad}
            unit="cars"
            description="Taken off the road for one year"
            color="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-100 dark:bg-blue-500/15"
            delay={0.05}
          />
          <EquivalencyCard
            icon={<Home className="h-7 w-7" />}
            value={metrics.homesPowered}
            unit="homes"
            description="Powered for one entire year"
            color="text-amber-600 dark:text-amber-400"
            bgColor="bg-amber-100 dark:bg-amber-500/15"
            delay={0.1}
          />
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/20 p-5"
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/50 dark:bg-emerald-500/10 blur-2xl" />
        <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-teal-200/50 dark:bg-teal-500/10 blur-2xl" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground">
              Your Contribution Matters
            </h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              By generating clean energy on your property, you&apos;re directly contributing
              to reducing greenhouse gas emissions and building a more sustainable future
              for your community and future generations.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Based on EPA greenhouse gas equivalencies
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
