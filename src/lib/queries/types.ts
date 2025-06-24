import type { ColumnMapping, EthnicityMapping } from '@/types/data';

export type PrepareDataRequest = {
  file_url: string;
  column_mappings: ColumnMapping;
  cholesterol_unit: 'mmol/L' | 'mg/dL';
  id_column?: string;
};

export type AnalyseRequest = {
  file_url: string;
  column_mappings: ColumnMapping;
  cholesterol_unit: 'mmol/L' | 'mg/dL';
  settings: {
    risk_scores: string[];
    risk_region: string;
    ethnicity_mappings: EthnicityMapping;
    percentile_thresholds: {
      resilient: number;
      reference_low: number;
      reference_high: number;
      susceptible: number;
    };
    min_scores: number;
  };
};

export type FileUploadResponse = {
  url: string;
  path: string;
};

export type PrepareDataResponse = {
  success: boolean;
  prepared_data_id?: string;
  n_rows?: number;
  columns?: string[];
  error?: string;
};

export type ApiError = {
  success: false;
  error: string;
  details?: string;
};
