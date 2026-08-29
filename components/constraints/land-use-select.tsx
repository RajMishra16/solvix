"use client"

import { cn } from "@/lib/utils"

interface LandUseSelectProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function LandUseSelect({ value, onChange }: LandUseSelectProps) {
  const toggleUse = (useId: string) => {
    if (value.includes(useId)) {
      onChange(value.filter((id) => id !== useId))
    } else {
      onChange([...value, useId])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value.includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleUse(option.id)}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-transparent text-foreground hover:bg-muted"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

const options = [
  { id: "farming", label: "Active farming" },
  { id: "grazing", label: "Livestock grazing" },
  { id: "fallow", label: "Unused/Fallow" },
  { id: "forest", label: "Forest/Woodland" },
  { id: "residential", label: "Residential" },
  { id: "mixed", label: "Mixed use" },
] as const
