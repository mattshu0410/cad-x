import type { AnalysisResult, AnalysisSummary, PlotData } from '@/types/analysis';
import type { ColumnMapping, EthnicityMapping, UploadedFile } from '@/types/data';
import type { AnalysisSettings } from '@/types/settings';

export type FormState = {
  currentStep: number;
  completedSteps: Set<number>;
  isStepValid: (step: number) => boolean;
  canProceed: boolean;
};

export type DataState = {
  uploadedFile: UploadedFile | null;
  columnMappings: ColumnMapping;
  ethnicityMappings: EthnicityMapping;
  hasEthnicityColumn: boolean;
};

export type SettingsState = {
  settings: AnalysisSettings;
};

export type ResultsState = {
  results: AnalysisResult[] | null;
  plots: PlotData | null;
  summary: AnalysisSummary | null;
  isLoading: boolean;
  error: string | null;
};
