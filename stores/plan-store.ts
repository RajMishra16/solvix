import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Plan, PlanConstraints, PlanArea } from '@/types/plan';
import { getSamplePlans } from '@/lib/mock-data';
import { safeJSONStorage } from '@/lib/zustand-storage';

interface PlanState {
  plans: Plan[];
  currentPlanId: string | null;
  initialized: boolean;
  
  initializeSampleData: () => void;
  setCurrentPlan: (id: string | null) => void;
  getCurrentPlan: () => Plan | undefined;
  addPlan: (plan: Plan) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  
  draftArea: PlanArea | null;
  setDraftArea: (area: PlanArea | null) => void;
  
  draftConstraints: Partial<PlanConstraints> | null;
  setDraftConstraints: (constraints: Partial<PlanConstraints> | null) => void;
  updateDraftConstraints: (updates: Partial<PlanConstraints>) => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      currentPlanId: null,
      draftArea: null,
      draftConstraints: null,
      initialized: false,

      initializeSampleData: () => {
        const { initialized, plans } = get();
        if (!initialized && plans.length === 0) {
          set({ plans: getSamplePlans(), initialized: true });
        }
      },

      setCurrentPlan: (id) => set({ currentPlanId: id }),
      
      getCurrentPlan: () => {
        const { plans, currentPlanId } = get();
        return plans.find((p) => p.id === currentPlanId);
      },

      addPlan: (plan) =>
        set((state) => ({
          plans: [...state.plans, plan],
          currentPlanId: plan.id,
        })),

      updatePlan: (id, updates) =>
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),

      deletePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
          currentPlanId: state.currentPlanId === id ? null : state.currentPlanId,
        })),

      setDraftArea: (area) => set({ draftArea: area }),
      
      setDraftConstraints: (constraints) => set({ draftConstraints: constraints }),
      
      updateDraftConstraints: (updates) =>
        set((state) => ({
          draftConstraints: state.draftConstraints
            ? { ...state.draftConstraints, ...updates }
            : updates,
        })),
    }),
    {
      name: 'Solvix-plans',
      storage: safeJSONStorage,
    }
  )
);
