import { create } from 'zustand';
import { SettingsState } from './types';
import { AnalysisSettings, RiskScore, RiskRegion, CholesterolUnit } from '@/types/settings';

interface SettingsStore extends SettingsState {
  updateSettings: (settings: Partial<AnalysisSettings>) => void;
  setRiskScores: (scores: RiskScore[]) => void;
  setRiskRegion: (region: RiskRegion) => void;
  setCholesterolUnit: (unit: CholesterolUnit) => void;
  setMinScores: (min: number) => void;
  setPercentileThresholds: (thresholds: Partial<AnalysisSettings['percentileThresholds']>) => void;
  resetSettings: () => void;
}

const defaultSettings: AnalysisSettings = {
  riskScores: ['frs'],
  riskRegion: 'Low',
  minScores: 1,
  cholesterolUnit: 'mmol/L',
  percentileThresholds: {
    resilient: 20,
    reference_low: 40,
    reference_high: 60,
    susceptible: 80
  }
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,

  updateSettings: (newSettings: Partial<AnalysisSettings>) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    })),

  setRiskScores: (scores: RiskScore[]) =>
    set((state) => ({
      settings: { ...state.settings, riskScores: scores }
    })),

  setRiskRegion: (region: RiskRegion) =>
    set((state) => ({
      settings: { ...state.settings, riskRegion: region }
    })),

  setCholesterolUnit: (unit: CholesterolUnit) =>
    set((state) => ({
      settings: { ...state.settings, cholesterolUnit: unit }
    })),

  setMinScores: (min: number) =>
    set((state) => ({
      settings: { ...state.settings, minScores: min }
    })),

  setPercentileThresholds: (thresholds: Partial<AnalysisSettings['percentileThresholds']>) =>
    set((state) => ({
      settings: {
        ...state.settings,
        percentileThresholds: { ...state.settings.percentileThresholds, ...thresholds }
      }
    })),

  resetSettings: () =>
    set({ settings: defaultSettings })
}));