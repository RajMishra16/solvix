"use client"

import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TargetProductionInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
}

export function TargetProductionInput({ value, onChange }: TargetProductionInputProps) {
  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Input
          type="number"
          placeholder="e.g., 1500"
          value={value ?? ""}
          onChange={(e) => {
            const val = e.target.value
            onChange(val === "" ? undefined : parseFloat(val))
          }}
          className={cn(
            "pr-12", // Space for the unit
            value !== undefined && "pr-20" // Space for clear button + unit
          )}
        />
        <div className="absolute right-3 flex items-center gap-2 pointer-events-none text-muted-foreground text-sm">
          <span>kWh/month</span>
        </div>
        
        {value !== undefined && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-24 h-6 w-6 rounded-full hover:bg-muted text-muted-foreground"
            onClick={() => onChange(undefined)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear value</span>
          </Button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Leave blank to optimize automatically based on your usage
      </p>
    </div>
  )
}
