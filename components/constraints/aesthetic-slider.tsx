"use client"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface AestheticSliderProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function AestheticSlider({ value, onChange, className }: AestheticSliderProps) {
  const getLabel = (val: number) => {
    if (val < 25) return "Not concerned"
    if (val < 50) return "Somewhat important"
    if (val < 75) return "Important"
    return "Very important"
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
        <span className="text-xs font-medium text-muted-foreground">Visual Impact</span>
        <span
          className={cn(
            "text-sm font-semibold tracking-tight transition-colors",
            value < 25
              ? "text-muted-foreground"
              : value < 50
              ? "text-amber-600 dark:text-amber-400"
              : value < 75
              ? "text-orange-600 dark:text-orange-400"
              : "text-rose-600 dark:text-rose-400"
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
            "[&_[data-slot=slider-track]]:from-stone-300",
            "[&_[data-slot=slider-track]]:via-amber-400",
            "[&_[data-slot=slider-track]]:to-rose-500",
            "[&_[data-slot=slider-range]]:opacity-0"
          )}
        />
      </div>

      <div className="flex justify-between px-0.5">
        <span className="text-[10px] text-muted-foreground font-medium max-w-[80px] leading-tight">
          Function over form
        </span>
        <span className="text-[10px] text-muted-foreground font-medium max-w-[80px] leading-tight text-right">
          Highly visible
        </span>
      </div>
    </div>
  )
}
