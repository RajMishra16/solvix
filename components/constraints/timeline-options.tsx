"use client"

import { Zap, Calendar, Clock, Search, LucideIcon } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { Timeline } from "@/types/plan"

interface TimelineOptionsProps {
  value: Timeline
  onChange: (value: Timeline) => void
  className?: string
}

interface OptionConfig {
  id: Timeline
  label: string
  description: string
  icon: LucideIcon
}

const options: OptionConfig[] = [
  {
    id: "asap",
    label: "ASAP",
    description: "Ready to start immediately",
    icon: Zap,
  },
  {
    id: "this-year",
    label: "This year",
    description: "Within the next 12 months",
    icon: Calendar,
  },
  {
    id: "1-2-years",
    label: "1-2 years",
    description: "Planning ahead",
    icon: Clock,
  },
  {
    id: "exploring",
    label: "Just exploring",
    description: "Research phase",
    icon: Search,
  },
]

export function TimelineOptions({ value, onChange, className }: TimelineOptionsProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as Timeline)}
      className={cn("grid grid-cols-2 gap-2", className)}
    >
      {options.map((option) => {
        const isSelected = value === option.id
        return (
          <label
            key={option.id}
            htmlFor={`timeline-${option.id}`}
            className={cn(
              "relative flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all duration-200 hover:bg-muted/30",
              isSelected ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border bg-card"
            )}
          >
            <RadioGroupItem
              value={option.id}
              id={`timeline-${option.id}`}
              className="sr-only"
            />
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                isSelected
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border/50 bg-muted/20 text-muted-foreground"
              )}
            >
              <option.icon className="h-4 w-4" />
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
