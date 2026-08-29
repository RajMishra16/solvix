'use client';

import { motion } from 'framer-motion';
import { 
  ChartBar, 
  Receipt, 
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionNavigationProps {
  onAnalyticsClick?: () => void;
  onBillingClick?: () => void;
  onImplementationClick?: () => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
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

interface NavigationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  onClick?: () => void;
}

function NavigationCard({
  icon,
  title,
  description,
  gradientFrom,
  gradientTo,
  onClick,
}: NavigationCardProps) {
  return (
    <motion.button
      variants={itemVariants}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border border-border bg-card p-4',
        'text-left transition-colors duration-200',
        'hover:border-border/80 hover:bg-muted/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          'h-10 w-10 shrink-0 rounded-lg flex items-center justify-center',
          'bg-gradient-to-br',
          gradientFrom, gradientTo,
        )}>
          <div className="text-white">
            {icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              {title}
            </h3>
            <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export function SectionNavigation({
  onAnalyticsClick,
  onBillingClick,
  onImplementationClick,
  className,
}: SectionNavigationProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-3', className)}
    >
      <motion.p 
        variants={itemVariants}
        className="text-sm font-medium text-muted-foreground"
      >
        Explore Your Plan
      </motion.p>

      <NavigationCard
        icon={<ChartBar className="h-5 w-5" />}
        title="Analytics"
        description="Production forecasts and financial projections"
        gradientFrom="from-indigo-500"
        gradientTo="to-violet-500"
        onClick={onAnalyticsClick}
      />

      <NavigationCard
        icon={<Receipt className="h-5 w-5" />}
        title="Equipment & Costs"
        description="Bill of materials with pricing"
        gradientFrom="from-emerald-500"
        gradientTo="to-teal-500"
        onClick={onBillingClick}
      />

      <NavigationCard
        icon={<ClipboardList className="h-5 w-5" />}
        title="Implementation"
        description="Permits, installation, and commissioning"
        gradientFrom="from-amber-500"
        gradientTo="to-orange-500"
        onClick={onImplementationClick}
      />
    </motion.div>
  );
}
