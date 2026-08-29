"use client"

import { Sun, Wind, Battery, Droplets, LucideIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { Technology } from "@/types/plan"

interface TechnologySelectProps {
  value: Technology[]
  onChange: (value: Technology[]) => void
  className?: string
}

interface TechnologyOption {
  id: Technology
  label: string
  description: string
  icon: LucideIcon
}

const options: TechnologyOption[] = [
  {
    id: "solar",
    label: "Solar",
    description: "Photovoltaic panels",
    icon: Sun,
  },
  {
    id: "wind",
    label: "Wind",
    description: "Wind turbines",
    icon: Wind,
  },
  {
    id: "storage",
    label: "Battery Storage",
    description: "Energy backup",
    icon: Battery,
  },
  {
    id: "hydro",
    label: "Micro-hydro",
    description: "Water power",
    icon: Droplets,
  },
]

export function TechnologySelect({ value, onChange, className }: TechnologySelectProps) {
  const toggleTechnology = (techId: Technology, checked: boolean) => {
    if (checked) {
      onChange([...value, techId])
    } else {
      onChange(value.filter((id) => id !== techId))
    }
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {options.map((option) => {
        const isChecked = value.includes(option.id)
        return (
          <label
            key={option.id}
            htmlFor={`tech-${option.id}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all duration-200 hover:bg-muted/30",
              isChecked ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border bg-card"
            )}
          >
            <Checkbox
              id={`tech-${option.id}`}
              checked={isChecked}
              onCheckedChange={(checked) =>
                toggleTechnology(option.id, checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                  isChecked
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
                    isChecked ? "text-primary" : "text-foreground"
                  )}
                >
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {option.description}
                </span>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
