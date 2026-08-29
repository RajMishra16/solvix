'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnalysisPhase = 
  | 'data-collection'
  | 'constraint-integration'
  | 'technology-optimization'
  | 'system-design'
  | 'financial-modeling'
  | 'complete';

export interface PhaseConfig {
  id: AnalysisPhase;
  label: string;
  description: string;
}

export const ANALYSIS_PHASES: PhaseConfig[] = [
  { id: 'data-collection', label: 'Data Collection', description: 'Gathering terrain & climate data' },
  { id: 'constraint-integration', label: 'Constraint Integration', description: 'Applying your requirements' },
  { id: 'technology-optimization', label: 'Technology Optimization', description: 'Selecting optimal equipment' },
  { id: 'system-design', label: 'System Design', description: 'Creating layout & placement' },
  { id: 'financial-modeling', label: 'Financial Modeling', description: 'Calculating ROI & payback' },
  { id: 'complete', label: 'Complete', description: 'Analysis finished' },
];

interface AgentProgressProps {
  currentPhase: AnalysisPhase;
  className?: string;
}

function getPhaseIndex(phase: AnalysisPhase): number {
  return ANALYSIS_PHASES.findIndex(p => p.id === phase);
}

export function AgentProgress({ currentPhase, className }: AgentProgressProps) {
  const currentIndex = getPhaseIndex(currentPhase);
  
  return (
    <div className={cn('py-2', className)}>
      <div className="flex items-center gap-2">
        {ANALYSIS_PHASES.slice(0, -1).map((phase, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          
          return (
            <div key={phase.id} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isCurrent ? 1.1 : 1, 
                  opacity: 1 
                }}
                transition={{ 
                  type: 'spring', 
                  damping: 20, 
                  stiffness: 300,
                  delay: index * 0.05 
                }}
                className={cn(
                  'relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all duration-300',
                  isComplete && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background',
                  isPending && 'bg-muted text-muted-foreground/50'
                )}
              >
                {isComplete ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
                
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {index < ANALYSIS_PHASES.length - 2 && (
                <div className="relative mx-1.5 h-0.5 w-8 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: isComplete ? '100%' : '0%' 
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <motion.div
        key={currentPhase}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-3 text-center"
      >
        <p className="text-sm font-medium text-foreground">
          {ANALYSIS_PHASES[currentIndex]?.label}
        </p>
        <p className="text-xs text-muted-foreground">
          {ANALYSIS_PHASES[currentIndex]?.description}
        </p>
      </motion.div>
    </div>
  );
}
