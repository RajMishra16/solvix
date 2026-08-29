import { useMemo } from 'react';
import type { Technology, Timeline, FinancingType, EnergyGoal, GridConnection } from '@/types/plan';

export interface SectionValidation {
  id: string;
  label: string;
  isComplete: boolean;
  isRequired: boolean;
}

export interface ConstraintsValidation {
  sections: SectionValidation[];
  completedCount: number;
  requiredCount: number;
  requiredCompletedCount: number;
  isValid: boolean;
  canProceed: boolean;
}

interface ValidationInput {
  budget: [number, number];
  financing: FinancingType;
  primaryGoal: EnergyGoal;
  gridConnection: GridConnection;
  currentUse: string[];
  technologies: Technology[];
  timeline: Timeline;
}

export function useConstraintsValidation(input: ValidationInput): ConstraintsValidation {
  return useMemo(() => {
    const sections: SectionValidation[] = [
      {
        id: 'financial',
        label: 'Budget & Financing',
        isComplete: input.financing !== 'undecided' || input.budget[1] < 500000,
        isRequired: true,
      },
      {
        id: 'energy',
        label: 'Energy Goals',
        isComplete: !!input.primaryGoal && !!input.gridConnection,
        isRequired: true,
      },
      {
        id: 'land',
        label: 'Land Details',
        isComplete: input.currentUse.length > 0,
        isRequired: false,
      },
      {
        id: 'technical',
        label: 'Technology',
        isComplete: input.technologies.length > 0,
        isRequired: true,
      },
      {
        id: 'timeline',
        label: 'Timeline',
        isComplete: input.timeline !== 'exploring',
        isRequired: false,
      },
    ];

    const completedCount = sections.filter(s => s.isComplete).length;
    const requiredSections = sections.filter(s => s.isRequired);
    const requiredCount = requiredSections.length;
    const requiredCompletedCount = requiredSections.filter(s => s.isComplete).length;
    const isValid = requiredCompletedCount === requiredCount;
    const canProceed = isValid;

    return {
      sections,
      completedCount,
      requiredCount,
      requiredCompletedCount,
      isValid,
      canProceed,
    };
  }, [
    input.budget,
    input.financing,
    input.primaryGoal,
    input.gridConnection,
    input.currentUse,
    input.technologies,
    input.timeline,
  ]);
}
