export type Classification = 'Resilient' | 'Reference' | 'Susceptible' | 'Other';

export interface AnalysisResult {
  subject_id?: string;
  original_data: Record<string, unknown>;
  risk_scores: {
    frs?: number;
    ascvd?: number;
    mesa?: number;
    score2?: number;
  };
  average_normalized_score: number;
  cacs_percentile: number;
  classification: Classification;
}

export interface AnalysisSummary {
  n_total: number;
  n_complete: number;
  classifications: {
    resilient: number;
    reference: number;
    susceptible: number;
    other: number;
  };
}

export interface PlotData {
  cacs_vs_risk: unknown; // Plotly JSON
  risk_distribution: unknown;
  percentile_distribution: unknown;
}

export interface AnalysisResponse {
  success: boolean;
  data: {
    results: AnalysisResult[];
    plots: PlotData;
    summary: AnalysisSummary;
  };
  error?: string;
}