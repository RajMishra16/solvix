'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden',
        className
      )}
    >
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number, name: string) => string;
  className?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(label ?? '') : label;

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card px-3 py-2 shadow-lg',
        className
      )}
    >
      {formattedLabel && (
        <p className="text-xs font-medium text-foreground mb-1.5">
          {formattedLabel}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const formattedValue = valueFormatter
            ? valueFormatter(entry.value, entry.name)
            : `${entry.value.toLocaleString()}`;
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground tabular-nums">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ChartLegendItem {
  name: string;
  color: string;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

// Color constants - hex values required for Recharts SVG rendering
// Mapped from design system CSS vars in globals.css
export const CHART_COLORS = {
  primary: '#2d8555',
  chart1: '#66c78a',
  chart2: '#4bba6f',
  chart3: '#3aa861',
  chart4: '#2d8555',
  chart5: '#236745',
  amber: '#f59e0b',
  emerald: '#10b981',
  blue: '#3b82f6',
  muted: '#737373',
  border: '#e5e5e5',
} as const;

export const AXIS_TICK_STYLE = {
  fontSize: 11,
  fill: '#737373',
};

export const GRID_STYLE = {
  stroke: '#e5e5e5',
  strokeDasharray: '3 3',
};
