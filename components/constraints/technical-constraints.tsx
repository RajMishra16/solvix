"use client"

import { Settings2 } from "lucide-react"
import { ConstraintSection } from "./constraint-section"
import { TechnologySelect } from "./technology-select"
import { AestheticSlider } from "./aesthetic-slider"
import { MaintenanceOptions } from "./maintenance-options"
import type { Technology, MaintenanceCapacity } from "@/types/plan"

interface TechnicalConstraintsProps {
  technologies: Technology[]
  aestheticConcern: number
  maintenanceCapacity: MaintenanceCapacity
  onTechnologiesChange: (value: Technology[]) => void
  onAestheticConcernChange: (value: number) => void
  onMaintenanceCapacityChange: (value: MaintenanceCapacity) => void
  defaultOpen?: boolean
}

export function TechnicalConstraints({
  technologies,
  aestheticConcern,
  maintenanceCapacity,
  onTechnologiesChange,
  onAestheticConcernChange,
  onMaintenanceCapacityChange,
  defaultOpen = false,
}: TechnicalConstraintsProps) {
  const isComplete = technologies.length > 0

  return (
    <ConstraintSection
      title="Technology Preferences"
      icon={<Settings2 className="h-4 w-4" />}
      description="Choose your energy systems"
      defaultOpen={defaultOpen}
      isComplete={isComplete}
    >
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Which technologies are you interested in?
        </label>
        <TechnologySelect value={technologies} onChange={onTechnologiesChange} />
        {technologies.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Please select at least one technology
          </p>
        )}
      </div>

      <div className="h-px bg-border/50 my-6" />


      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Maintenance capacity
        </label>
        <MaintenanceOptions
          value={maintenanceCapacity}
          onChange={onMaintenanceCapacityChange}
        />
      </div>
    </ConstraintSection>
  )
}
