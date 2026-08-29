"use client"

import { Wrench, HeadphonesIcon, Puzzle, LucideIcon } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { MaintenanceCapacity } from "@/types/plan"

interface MaintenanceOptionsProps {
  value: MaintenanceCapacity
  onChange: (value: MaintenanceCapacity) => void
  className?: string
}

interface OptionConfig {
  id: MaintenanceCapacity
  label: string
  description: string
  icon: LucideIcon
}

const options: OptionConfig[] = [
  {
    id: "diy",
    label: "DIY",
    description: "I'll handle maintenance myself",
    icon: Wrench,
  },
  {
    id: "full-service",
    label: "Full service",
    description: "Prefer professional maintenance",
    icon: HeadphonesIcon,
  },
  {
    id: "mixed",
    label: "Mixed",
    description: "Combination of both",
    icon: Puzzle,
  },
]

export function MaintenanceOptions({ value, onChange, className }: MaintenanceOptionsProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as MaintenanceCapacity)}
      className={cn("grid grid-cols-3 gap-2", className)}
    >
      {options.map((option) => {
        const isSelected = value === option.id
        return (
          <label
            key={option.id}
            htmlFor={`maintenance-${option.id}`}
            className={cn(
              "relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all duration-200 hover:bg-muted/30",
              isSelected ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border bg-card"
            )}
          >
            <RadioGroupItem
              value={option.id}
              id={`maintenance-${option.id}`}
              className="sr-only"
            />
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                isSelected
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border/50 bg-muted/20 text-muted-foreground"
              )}
            >
              <option.icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {option.label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {option.description}
              </span>
            </div>
          </label>
        )
      })}
    </RadioGroup>
  )
}
