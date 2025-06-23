import { UploadedFile, ColumnMapping, EthnicityMapping } from '@/types/data';
import { AnalysisSettings } from '@/types/settings';
import { AnalysisResult, AnalysisSummary, PlotData } from '@/types/analysis';

export interface FormState {
  currentStep: number;
  completedSteps: Set<number>;
  isStepValid: (step: number) => boolean;
  canProceed: boolean;
}

export interface DataState {
  uploadedFile: UploadedFile | null;
  columnMappings: ColumnMapping;
  ethnicityMappings: EthnicityMapping;
  hasEthnicityColumn: boolean;
}

export interface SettingsState {
  settings: AnalysisSettings;
}

export interface ResultsState {
  results: AnalysisResult[] | null;
  plots: PlotData | null;
  summary: AnalysisSummary | null;
  isLoading: boolean;
  error: string | null;
}