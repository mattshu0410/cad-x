import type { FormState } from './types';
import { create } from 'zustand';

type FormStore = {
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (step: number) => void;
  resetForm: () => void;
} & FormState;

export const useFormStore = create<FormStore>((set, get) => ({
  currentStep: 0,
  completedSteps: new Set(),
  canProceed: false,

  isStepValid: (step: number) => {
    const { completedSteps } = get();
    return completedSteps.has(step);
  },

  setCurrentStep: (step: number) => {
    console.warn('setting current step', step);
    set({ currentStep: step });
  },

  nextStep: () => {
    set(state => ({
      currentStep: Math.min(state.currentStep + 1, 6),
    }));
  },

  previousStep: () =>
    set(state => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  completeStep: (step: number) =>
    set(state => ({
      completedSteps: new Set([...state.completedSteps, step]),
      canProceed: true,
    })),

  resetForm: () =>
    set({
      currentStep: 1,
      completedSteps: new Set(),
      canProceed: false,
    }),
}));
