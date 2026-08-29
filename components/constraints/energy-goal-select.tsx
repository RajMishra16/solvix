"use client"

import { Receipt, BadgeDollarSign, Unplug, Leaf } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EnergyGoal } from "@/types/plan"

interface EnergyGoalSelectProps {
  value: EnergyGoal
  onChange: (value: EnergyGoal) => void
}

export function EnergyGoalSelect({ value, onChange }: EnergyGoalSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as EnergyGoal)}
    >
      <SelectTrigger className="w-full h-auto py-3">
        <SelectValue>
          {selectedOption && (
            <div className="flex items-center gap-2.5">
              <selectedOption.icon className="h-4 w-4 text-primary" />
              <span>{selectedOption.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="py-3"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
                <option.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const options = [
  {
    value: "offset",
    label: "Offset utility bills",
    description: "Reduce or eliminate your electric bill",
    icon: Receipt,
  },
  {
    value: "income",
    label: "Generate income",
    description: "Sell excess power back to the grid",
    icon: BadgeDollarSign,
  },
  {
    value: "independence",
    label: "Energy independence",
    description: "Reduce reliance on the grid",
    icon: Unplug,
  },
  {
    value: "environmental",
    label: "Environmental impact",
    description: "Minimize carbon footprint",
    icon: Leaf,
  },
] as const
