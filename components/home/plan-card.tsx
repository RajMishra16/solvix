'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Zap,
  Trash2,
  Leaf,
  TrendingUp,
  Clock,
  FileEdit,
  Loader2,
  CheckCircle2,
  LandPlot
} from 'lucide-react';
import { Plan } from '@/types/plan';
import { usePlanStore } from '@/stores/plan-store';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: FileEdit,
    badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
    iconClass: '',
  },
  analyzing: {
    label: 'Analyzing',
    icon: Loader2,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    iconClass: 'animate-spin',
  },
  complete: {
    label: 'Complete',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconClass: '',
  },
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toFixed(1);
}

export function PlanCard({ plan }: PlanCardProps) {
  const deletePlan = usePlanStore((state) => state.deletePlan);
  const status = statusConfig[plan.status];
  const StatusIcon = status.icon;
  const formattedDate = format(new Date(plan.createdAt), 'MMM d, yyyy');

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deletePlan(plan.id);
  };

  return (
    <Link href={`/overview/${plan.id}`} className="block h-full outline-none group/card">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="h-full"
      >
        <div className={cn(
          "h-full overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300",
          "hover:border-primary/30 hover:shadow-lg hover:shadow-black/5",
          "flex flex-col"
        )}>
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600">
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id={`topo-${plan.id}`} patternUnits="userSpaceOnUse" width="100" height="100">
                  <path d="M0 50 Q25 30 50 50 T100 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/40" />
                  <path d="M0 70 Q25 50 50 70 T100 70" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/30" />
                  <path d="M0 30 Q25 10 50 30 T100 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
                  <circle cx="20" cy="80" r="1" fill="currentColor" className="text-white/20" />
                  <circle cx="70" cy="40" r="1.5" fill="currentColor" className="text-white/25" />
                  <circle cx="85" cy="75" r="1" fill="currentColor" className="text-white/15" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#topo-${plan.id})`} />
            </svg>

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            <div className="absolute top-3 left-3">
              <Badge className={cn("font-medium gap-1.5 border shadow-sm", status.badgeClass)}>
                <StatusIcon className={cn("h-3 w-3", status.iconClass)} />
                {status.label}
              </Badge>
            </div>

            <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
              <AlertDialog>
                <AlertDialogTrigger
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-white/90 backdrop-blur-sm text-stone-500 hover:text-red-600 hover:bg-white transition-colors shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete plan</span>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{plan.name}&rdquo; and all associated analysis data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-mono text-white/90 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
              <MapPin className="h-3 w-3" />
              {plan.area.center.lat.toFixed(4)}, {plan.area.center.lng.toFixed(4)}
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-medium text-white/90 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
              <LandPlot className="h-3 w-3" />
              {plan.area.areaAcres.toFixed(1)} acres
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <h3 className="text-base font-semibold leading-tight truncate group-hover/card:text-primary transition-colors">
              {plan.name}
            </h3>
            {plan.area.address && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate mt-1">
                <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{plan.area.address}</span>
              </p>
            )}

            <div className="mt-3 flex-1">
              {plan.status === 'complete' && plan.analysis && plan.financials ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-stone-50 dark:bg-stone-900/50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">
                      <Zap className="h-3 w-3 text-emerald-600" />
                      System
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      5,000.0 <span className="text-[10px] text-muted-foreground font-normal">kW</span>
                    </div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-900/50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      Annual
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      9.6M <span className="text-[10px] text-muted-foreground font-normal">kWh</span>
                    </div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-900/50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">
                      <Leaf className="h-3 w-3 text-emerald-600" />
                      CO2 Offset
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      3,578.0 <span className="text-[10px] text-muted-foreground font-normal">tons/yr</span>
                    </div>
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-900/50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wide mb-0.5">
                      <Clock className="h-3 w-3 text-emerald-600" />
                      Payback
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      3.5 <span className="text-[10px] text-muted-foreground font-normal">years</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[104px] flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900/30 rounded-lg border border-dashed border-stone-200 dark:border-stone-700">
                  {plan.status === 'analyzing' ? (
                    <>
                      <Loader2 className="h-5 w-5 text-amber-500 animate-spin mb-2" />
                      <p className="text-xs text-muted-foreground">Analysis in progress...</p>
                    </>
                  ) : (
                    <>
                      <FileEdit className="h-5 w-5 text-stone-400 mb-2" />
                      <p className="text-xs text-muted-foreground">Complete setup to analyze</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-2.5 text-[11px] text-muted-foreground flex items-center gap-1.5 border-t border-border/50 bg-muted/30">
            <Calendar className="h-3 w-3" />
            <span>Created {formattedDate}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
