'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import type { Plan } from '@/types/plan';
import { ChartContainer } from './chart-components';
import { generateCostBreakdownData, type CostBreakdownData } from './financial-data';

interface CostBreakdownChartProps {
  plan: Plan | null;
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}k`;
  }
  return `₹${value.toFixed(0)}`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CostBreakdownData }>;
}) {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div 
          className="h-3 w-3 rounded-sm" 
          style={{ backgroundColor: data.color }} 
        />
        <span className="text-xs font-medium text-foreground">{data.name}</span>
      </div>
      <p className="text-sm font-semibold text-foreground mt-1 tabular-nums">
        {formatCurrency(data.value)}
      </p>
    </div>
  );
}

function LegendItem({ item, total }: { item: CostBreakdownData; total: number }) {
  const percentage = ((item.value / total) * 100).toFixed(0);
  
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <div 
          className="h-2.5 w-2.5 rounded-sm" 
          style={{ backgroundColor: item.color }} 
        />
        <span className="text-xs text-muted-foreground">{item.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-foreground tabular-nums">
          {formatCurrency(item.value)}
        </span>
        <span className="text-xs text-muted-foreground w-8 text-right">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export function CostBreakdownChart({ plan, className }: CostBreakdownChartProps) {
  const data = useMemo(() => generateCostBreakdownData(plan), [plan]);
  
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <ChartContainer
        title="Cost Breakdown"
        description="Equipment, installation, and other costs"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 w-full">
            <div className="divide-y divide-border">
              {data.map((item) => (
                <LegendItem key={item.name} item={item} total={total} />
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Total</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </ChartContainer>
    </motion.div>
  );
}