import { ColumnMapping, EthnicityMapping } from '@/types/data';

export interface PrepareDataRequest {
  file_url: string;
  column_mappings: ColumnMapping;
  cholesterol_unit: 'mmol/L' | 'mg/dL';
  id_column?: string;
}

export interface AnalyzeRequest {
  prepared_data_id: string;
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
}

export interface FileUploadResponse {
  url: string;
  path: string;
}

export interface PrepareDataResponse {
  success: boolean;
  prepared_data_id: string;
  preview: Record<string, unknown>[];
}

export interface ApiError {
  success: false;
  error: string;
  details?: string;
}