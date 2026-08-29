"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface ConstraintSectionProps {
  title: string
  icon?: React.ReactNode
  description?: string
  children: React.ReactNode
  defaultOpen?: boolean
  isComplete?: boolean
  className?: string
}

export function ConstraintSection({
  title,
  icon,
  description,
  children,
  defaultOpen = false,
  isComplete = false,
  className,
}: ConstraintSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("border-b border-border/50 last:border-0", className)}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between py-4 text-left hover:bg-muted/30 transition-colors group px-1">
        <div className="flex items-center gap-3 overflow-hidden">
          {icon && (
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                isComplete
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-muted border-transparent text-muted-foreground group-hover:text-foreground"
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : icon}
            </div>
          )}
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className={cn("text-sm font-medium truncate", isComplete && "text-primary")}>
              {title}
            </span>
            {description && <span className="text-xs text-muted-foreground truncate">{description}</span>}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-6 pt-2 px-1 space-y-6">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  )
}
