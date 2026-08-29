"use client"

import {
  Home,
  Warehouse,
  Droplets,
  Waves,
  CircleDot,
  UtilityPole,
  TreePine,
  Grid3X3,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface ExistingStructuresProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function ExistingStructures({ value, onChange }: ExistingStructuresProps) {
  const toggleStructure = (structureId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, structureId])
    } else {
      onChange(value.filter((id) => id !== structureId))
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const isChecked = value.includes(option.id)
        return (
          <label
            key={option.id}
            htmlFor={`structure-${option.id}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all duration-200 hover:bg-muted/30",
              isChecked ? "border-primary/50 bg-primary/5" : "border-border bg-card"
            )}
          >
            <Checkbox
              id={`structure-${option.id}`}
              checked={isChecked}
              onCheckedChange={(checked) =>
                toggleStructure(option.id, checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <option.icon className="h-4 w-4 text-muted-foreground" />
                <span>{option.label}</span>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}

const options = [
  { id: "home", label: "Home", icon: Home },
  { id: "barn", label: "Barn", icon: Warehouse },
  { id: "well", label: "Well", icon: Droplets },
  { id: "pond", label: "Pond", icon: Waves },
  { id: "septic", label: "Septic", icon: CircleDot },
  { id: "power-lines", label: "Power lines", icon: UtilityPole },
  { id: "trees", label: "Forest", icon: TreePine },
  { id: "fencing", label: "Fencing", icon: Grid3X3 },
] as const
