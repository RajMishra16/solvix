"use client"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface BudgetSliderProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  className?: string
}

export function BudgetSlider({ value, onChange, className }: BudgetSliderProps) {
  const MIN = 10000
  const MAX = 500000
  const STEP = 5000

  const formatCurrency = (val: number) => {
    if (val >= MAX) return "₹5L+"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleChange = (vals: number | readonly number[]) => {
    if (Array.isArray(vals) && vals.length === 2) {
      onChange(vals as [number, number])
    }
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Range</span>
        <span className="text-sm font-semibold tabular-nums tracking-tight text-primary">
          {formatCurrency(value[0])} – {formatCurrency(value[1])}
        </span>
      </div>

      <Slider
        value={value}
        min={MIN}
        max={MAX}
        step={STEP}
        onValueChange={handleChange}
        className="w-full"
      />

      <div className="flex justify-between px-0.5">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">₹10k</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">₹5L+</span>
      </div>
    </div>
  )
}