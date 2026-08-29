"use client"

import { Clock } from "lucide-react"
import { ConstraintSection } from "./constraint-section"
import { TimelineOptions } from "./timeline-options"
import type { Timeline } from "@/types/plan"

interface TimelineConstraintsProps {
  timeline: Timeline
  onTimelineChange: (value: Timeline) => void
  defaultOpen?: boolean
}

export function TimelineConstraints({
  timeline,
  onTimelineChange,
  defaultOpen = false,
}: TimelineConstraintsProps) {
  const isComplete = timeline !== "exploring"

  return (
    <ConstraintSection
      title="Timeline"
      icon={<Clock className="h-4 w-4" />}
      description="When do you want to start?"
      defaultOpen={defaultOpen}
      isComplete={isComplete}
    >
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          How soon do you want to implement?
        </label>
        <TimelineOptions value={timeline} onChange={onTimelineChange} />
      </div>
    </ConstraintSection>
  )
}
