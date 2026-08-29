"use client"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface PaybackSliderProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function PaybackSlider({ value, onChange, className }: PaybackSliderProps) {
  const getLabel = (val: number) => {
    if (val < 35) return "Cost-focused"
    if (val > 65) return "ROI-focused"
    return "Balanced"
  }

  const handleChange = (vals: number | readonly number[]) => {
    const val = Array.isArray(vals) ? vals[0] : vals
    if (typeof val === 'number') {
      onChange(val)
    }
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Priority</span>
        <span
          className={cn(
            "text-sm font-semibold tracking-tight transition-colors",
            value < 35 ? "text-blue-600 dark:text-blue-400" : value > 65 ? "text-green-600 dark:text-green-400" : "text-primary"
          )}
        >
          {getLabel(value)}
        </span>
      </div>

      <div className="relative">
        <Slider
          value={[value]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleChange}
          className={cn(
            "w-full [&_[data-slot=slider-track]]:h-2",
            "[&_[data-slot=slider-track]]:bg-gradient-to-r",
            "[&_[data-slot=slider-track]]:from-blue-500",
            "[&_[data-slot=slider-track]]:via-primary",
            "[&_[data-slot=slider-track]]:to-green-500",
            "[&_[data-slot=slider-range]]:opacity-0"
          )}
        />
      </div>

      <div className="flex justify-between px-0.5">
        <span className="text-[10px] text-muted-foreground font-medium max-w-[80px] leading-tight">
          Lower Upfront Cost
        </span>
        <span className="text-[10px] text-muted-foreground font-medium max-w-[80px] leading-tight text-right">
          Faster ROI
        </span>
      </div>
    </div>
  )
}
