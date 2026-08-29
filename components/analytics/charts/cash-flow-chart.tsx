'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import type { Plan } from '@/types/plan';
import { ChartContainer, ChartLegend, CHART_COLORS, AXIS_TICK_STYLE, GRID_STYLE } from './chart-components';
import { generateCashFlowData, type CashFlowData } from './financial-data';

interface CashFlowChartProps {
  plan: Plan | null;
  className?: string;
}

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return `${value < 0 ? '-' : ''}₹${(absValue / 1000).toFixed(0)}k`;
  }
  return `${value < 0 ? '-' : ''}₹${absValue.toFixed(0)}`;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
  payload: CashFlowData;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  const isPositive = data.cumulative >= 0;
  
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground mb-1.5">
        Year {data.year}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Cumulative:</span>
          <span className={`font-medium tabular-nums ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatCurrency(data.cumulative)}
          </span>
        </div>
        {data.year > 0 && (
          <div className="flex items-center justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Annual Savings:</span>
            <span className="font-medium tabular-nums text-foreground">
              {formatCurrency(data.annual)}
            </span>
          </div>
        )}
        {data.breakeven && (
          <div className="mt-1.5 pt-1.5 border-t border-border">
            <span className="text-xs font-medium text-emerald-600">Break-even point</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CashFlowChart({ plan, className }: CashFlowChartProps) {
  const data = useMemo(() => generateCashFlowData(plan), [plan]);
  
  const { minValue, maxValue, breakevenYear } = useMemo(() => {
    let min = 0;
    let max = 0;
    let breakeven = 0;
    
    data.forEach((d) => {
      if (d.cumulative < min) min = d.cumulative;
      if (d.cumulative > max) max = d.cumulative;
      if (d.breakeven) breakeven = d.year;
    });
    
    return { minValue: min, maxValue: max, breakevenYear: breakeven };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={className}
    >
      <ChartContainer
        title="25-Year Cash Flow Projection"
        description="Cumulative savings over the system lifetime"
      >
        <div className="flex flex-col">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cashFlowPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="cashFlowNegative" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={GRID_STYLE.stroke}
                  strokeDasharray={GRID_STYLE.strokeDasharray}
                />
                <XAxis
                  dataKey="year"
                  tick={AXIS_TICK_STYLE}
                  tickLine={false}
                  axisLine={{ stroke: GRID_STYLE.stroke }}
                  tickFormatter={(year) => (year % 5 === 0 ? `Yr ${year}` : '')}
                  interval={0}
                />
                <YAxis
                  tick={AXIS_TICK_STYLE}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  domain={[
                    Math.floor(minValue / 10000) * 10000 - 10000,
                    Math.ceil(maxValue / 10000) * 10000 + 10000
                  ]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={0}
                  stroke={CHART_COLORS.muted}
                  strokeWidth={1.5}
                />
                {breakevenYear > 0 && (
                  <ReferenceLine
                    x={breakevenYear}
                    stroke={CHART_COLORS.emerald}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'Break-even',
                      position: 'top',
                      fill: CHART_COLORS.emerald,
                      fontSize: 10,
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke={CHART_COLORS.emerald}
                  strokeWidth={2}
                  fill="url(#cashFlowPositive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { name: 'Cumulative Cash Flow', color: CHART_COLORS.emerald },
            ]}
            className="pt-3 justify-center"
          />
        </div>
      </ChartContainer>
    </motion.div>
  );
}