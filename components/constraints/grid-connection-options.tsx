"use client"

import { PlugZap, BatteryFull, Shuffle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { GridConnection } from "@/types/plan"

interface GridConnectionOptionsProps {
  value: GridConnection
  onChange: (value: GridConnection) => void
}

export function GridConnectionOptions({ value, onChange }: GridConnectionOptionsProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange(val as GridConnection)}
      className="grid grid-cols-3 gap-3"
    >
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <label
            key={option.value}
            htmlFor={`grid-${option.value}`}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-all duration-200 hover:bg-muted/30 hover:border-border/80 text-center h-28",
              isSelected
                ? "border-primary/50 bg-primary/5 shadow-sm"
                : "border-border bg-card"
            )}
          >
            <div className="absolute top-2 right-2 opacity-0">
               <RadioGroupItem value={option.value} id={`grid-${option.value}`} />
            </div>
            
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                isSelected
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border/50 bg-muted/20 text-muted-foreground"
              )}
            >
              <option.icon className="h-5 w-5" />
            </div>
            
            <div className="flex flex-col gap-0.5 w-full">
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {option.label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2 px-1">
                {option.description}
              </span>
            </div>
          </label>
        )
      })}
    </RadioGroup>
  )
}

const options = [
  {
    value: "connected",
    label: "Grid-connected",
    description: "Stay connected to utility",
    icon: PlugZap,
  },
  {
    value: "offgrid",
    label: "Off-grid",
    description: "Fully independent",
    icon: BatteryFull,
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "Best of both worlds",
    icon: Shuffle,
  },
] as const
