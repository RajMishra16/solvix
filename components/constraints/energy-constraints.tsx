"use client"

import { Zap } from "lucide-react"
import { ConstraintSection } from "./constraint-section"
import { EnergyGoalSelect } from "./energy-goal-select"
import { TargetProductionInput } from "./target-production-input"
import { GridConnectionOptions } from "./grid-connection-options"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { EnergyGoal, GridConnection } from "@/types/plan"

interface EnergyConstraintsProps {
  primaryGoal: EnergyGoal
  targetProduction: number | undefined
  gridConnection: GridConnection
  onPrimaryGoalChange: (value: EnergyGoal) => void
  onTargetProductionChange: (value: number | undefined) => void
  onGridConnectionChange: (value: GridConnection) => void
}

export function EnergyConstraints({
  primaryGoal,
  targetProduction,
  gridConnection,
  onPrimaryGoalChange,
  onTargetProductionChange,
  onGridConnectionChange,
}: EnergyConstraintsProps) {
  // Check if section is complete (basic validation)
  const isComplete = !!primaryGoal && !!gridConnection

  return (
    <ConstraintSection
      title="Energy Goals"
      icon={<Zap className="h-4 w-4" />}
      description="Define your energy independence goals"
      isComplete={isComplete}
      defaultOpen={true}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>What&apos;s your primary goal?</Label>
          <EnergyGoalSelect
            value={primaryGoal}
            onChange={onPrimaryGoalChange}
          />
        </div>

        <Separator className="bg-border/50" />

        <div className="space-y-3">
          <Label>Target monthly production (optional)</Label>
          <TargetProductionInput
            value={targetProduction}
            onChange={onTargetProductionChange}
          />
        </div>

        <Separator className="bg-border/50" />

        <div className="space-y-3">
          <Label>Grid connection preference</Label>
          <GridConnectionOptions
            value={gridConnection}
            onChange={onGridConnectionChange}
          />
        </div>
      </div>
    </ConstraintSection>
  )
}
