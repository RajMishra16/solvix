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
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  CHART_COLORS,
  AXIS_TICK_STYLE,
  GRID_STYLE,
} from './chart-components';
import { generateHourlyProductionData, type HourlyProductionData } from './production-data';

interface DailyProductionChartProps {
  plan: Plan | null;
  className?: string;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
  payload: HourlyProductionData;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  const data = payload?.[0]?.payload;
  
  return (
    <ChartTooltip
      active={active}
      payload={payload?.map((p) => ({
        ...p,
        name: 'Output',
      }))}
      label={data?.hourLabel}
      valueFormatter={(value) => `${value.toFixed(1)} kW`}
    />
  );
}

export function DailyProductionChart({ plan, className }: DailyProductionChartProps) {
  const data = useMemo(() => generateHourlyProductionData(plan), [plan]);
  
  const peakOutput = useMemo(() => {
    return data.length > 0 ? data[0].peak : 0;
  }, [data]);

  const sunriseHour = 6;
  const sunsetHour = 19;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={className}
    >
      <ChartContainer
        title="Daily Production Profile"
        description="Average hourly output throughout a typical day"
      >
        <div className="flex flex-col">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={GRID_STYLE.stroke}
                  strokeDasharray={GRID_STYLE.strokeDasharray}
                />
                <XAxis
                  dataKey="hour"
                  tick={AXIS_TICK_STYLE}
                  tickLine={false}
                  axisLine={{ stroke: GRID_STYLE.stroke }}
                  tickFormatter={(hour) => {
                    if (hour === 0) return '12am';
                    if (hour === 6) return '6am';
                    if (hour === 12) return '12pm';
                    if (hour === 18) return '6pm';
                    return '';
                  }}
                  interval={0}
                  ticks={[0, 6, 12, 18, 23]}
                />
                <YAxis
                  tick={AXIS_TICK_STYLE}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                  domain={[0, Math.ceil(peakOutput * 1.1)]}
                  unit=" kW"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  x={sunriseHour}
                  stroke={CHART_COLORS.amber}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  x={sunsetHour}
                  stroke={CHART_COLORS.amber}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={2}
                  fill="url(#productionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { name: 'Hourly Output (kW)', color: CHART_COLORS.amber },
            ]}
            className="pt-3 justify-center"
          />
        </div>
      </ChartContainer>
    </motion.div>
  );
}
