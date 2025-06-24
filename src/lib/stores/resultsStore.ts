import type { ResultsState } from './types';
import type { AnalysisResult, AnalysisSummary, PlotData } from '@/types/analysis';
import { create } from 'zustand';

type ResultsStore = {
  setResults: (results: AnalysisResult[]) => void;
  setPlots: (plots: PlotData) => void;
  setSummary: (summary: AnalysisSummary) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
} & ResultsState;

export const useResultsStore = create<ResultsStore>(set => ({
  results: null,
  plots: null,
  summary: null,
  isLoading: false,
  error: null,

  setResults: (results: AnalysisResult[]) =>
    set({ results }),

  setPlots: (plots: PlotData) =>
    set({ plots }),

  setSummary: (summary: AnalysisSummary) =>
    set({ summary }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  clearResults: () =>
    set({
      results: null,
      plots: null,
      summary: null,
      isLoading: false,
      error: null,
    }),
}));
