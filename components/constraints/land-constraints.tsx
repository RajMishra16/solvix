"use client"

import { MapPinned } from "lucide-react"
import { ConstraintSection } from "./constraint-section"
import { ExistingStructures } from "./existing-structures"
import { LandUseSelect } from "./land-use-select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface LandConstraintsProps {
  existingStructures: string[]
  currentUse: string[]
  onStructuresChange: (value: string[]) => void
  onLandUseChange: (value: string[]) => void
}

export function LandConstraints({
  existingStructures,
  currentUse,
  onStructuresChange,
  onLandUseChange,
}: LandConstraintsProps) {
  // Check if section is complete (at least one use selected)
  const isComplete = currentUse.length > 0

  return (
    <ConstraintSection
      title="Land Details"
      icon={<MapPinned className="h-4 w-4" />}
      description="Existing structures and current usage"
      isComplete={isComplete}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>What structures exist on your land?</Label>
          <ExistingStructures
            value={existingStructures}
            onChange={onStructuresChange}
          />
        </div>

        <Separator className="bg-border/50" />

        <div className="space-y-3">
          <Label>How is the land currently used?</Label>
          <LandUseSelect
            value={currentUse}
            onChange={onLandUseChange}
          />
        </div>
      </div>
    </ConstraintSection>
  )
}
