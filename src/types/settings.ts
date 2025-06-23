export type RiskScore = 'frs' | 'ascvd' | 'mesa' | 'score2';

export type RiskRegion = 'Low' | 'Moderate' | 'High' | 'Very High';

export type CholesterolUnit = 'mmol/L' | 'mg/dL';

export interface PercentileThresholds {
  resilient: number;
  reference_low: number;
  reference_high: number;
  susceptible: number;
}

export interface AnalysisSettings {
  riskScores: RiskScore[];
  riskRegion: RiskRegion;
  minScores: number;
  cholesterolUnit: CholesterolUnit;
  percentileThresholds: PercentileThresholds;
}

export interface ValidationRule {
  field: string;
  min?: number;
  max?: number;
  required: boolean;
  type: 'number' | 'binary' | 'string';
}