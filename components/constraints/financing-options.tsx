"use client"

import { Wallet, Landmark, CalendarClock, HelpCircle, LucideIcon } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { FinancingType } from "@/types/plan"

interface FinancingOptionsProps {
  value: FinancingType
  onChange: (value: FinancingType) => void
  className?: string
}

interface OptionConfig {
  id: FinancingType
  label: string
  description: string
  icon: LucideIcon
}

const options: OptionConfig[] = [
  {
    id: "cash",
    label: "Pay cash",
    description: "Full upfront payment, maximum savings",
    icon: Wallet,
  },
  {
    id: "loan",
    label: "Finance with loan",
    description: "Spread payments over time",
    icon: Landmark,
  },
  {
    id: "lease",
    label: "Lease equipment",
    description: "Lower upfront, return or buy later",
    icon: CalendarClock,
  },
  {
    id: "undecided",
    label: "Not sure yet",
    description: "We'll show all options",
    icon: HelpCircle,
  },
]

export function FinancingOptions({ value, onChange, className }: FinancingOptionsProps) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as FinancingType)} className={cn("gap-2", className)}>
      {options.map((option) => {
        const isSelected = value === option.id
        return (
          <label
            key={option.id}
            htmlFor={option.id}
            className={cn(
              "relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-200 hover:bg-muted/30",
              isSelected ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border bg-card"
            )}
          >
            <div className="mt-0.5 shrink-0">
              <RadioGroupItem value={option.id} id={option.id} />
            </div>
            <div className="flex grow gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors",
                  isSelected ? "border-primary/20 bg-primary/10 text-primary" : "border-border/50 bg-muted/20"
                )}
              >
                <option.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-sm font-medium transition-colors", isSelected ? "text-primary" : "text-foreground")}>
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground leading-snug">{option.description}</span>
              </div>
            </div>
          </label>
        )
      })}
    </RadioGroup>
  )
}
