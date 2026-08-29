'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import type { Plan } from '@/types/plan';
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  CHART_COLORS,
  AXIS_TICK_STYLE,
  GRID_STYLE,
} from './chart-components';
import { generateMonthlyProductionData } from './production-data';

interface MonthlyProductionChartProps {
  plan: Plan | null;
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  return (
    <ChartTooltip
      active={active}
      payload={payload?.map((p) => ({
        ...p,
        name: p.dataKey === 'production' ? 'Production' : 'Average',
      }))}
      label={label}
      valueFormatter={(value) => `${(value / 1000).toFixed(1)}k kWh`}
    />
  );
}

export function MonthlyProductionChart({ plan, className }: MonthlyProductionChartProps) {
  const data = useMemo(() => generateMonthlyProductionData(plan), [plan]);
  
  const monthlyAverage = useMemo(() => {
    return data.length > 0 ? data[0].average : 0;
  }, [data]);

  const maxProduction = useMemo(() => {
    return Math.max(...data.map(d => d.production));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <ChartContainer
        title="Monthly Production Forecast"
        description="Estimated energy production by month, accounting for seasonal variations"
      >
        <div className="flex flex-col">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6ee7a8" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={GRID_STYLE.stroke}
                  strokeDasharray={GRID_STYLE.strokeDasharray}
                />
                <XAxis
                  dataKey="shortMonth"
                  tick={AXIS_TICK_STYLE}
                  tickLine={false}
                  axisLine={{ stroke: GRID_STYLE.stroke }}
                />
                <YAxis
                  tick={AXIS_TICK_STYLE}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  domain={[0, Math.ceil(maxProduction / 1000) * 1000 + 1000]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <ReferenceLine
                  y={monthlyAverage}
                  stroke={CHART_COLORS.muted}
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <Bar
                  dataKey="production"
                  fill="url(#barGradient)"
                  stroke={CHART_COLORS.chart4}
                  strokeWidth={1.5}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { name: 'Monthly Production', color: CHART_COLORS.chart2 },
              { name: 'Annual Average', color: CHART_COLORS.muted },
            ]}
            className="pt-3 justify-center"
          />
        </div>
      </ChartContainer>
    </motion.div>
  );
}
