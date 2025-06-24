export type Classification = 'Resilient' | 'Reference' | 'Susceptible' | 'Other';

export type AnalysisResult = {
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
};

export type AnalysisSummary = {
  n_total: number;
  n_complete: number;
  classifications: {
    resilient: number;
    reference: number;
    susceptible: number;
    other: number;
  };
};

export type PlotData = {
  cacs_vs_risk: unknown; // Plotly JSON
  risk_distribution: unknown;
  percentile_distribution: unknown;
};

export type AnalysisResponse = {
  success: boolean;
  data: {
    results: AnalysisResult[];
    plots: PlotData;
    summary: AnalysisSummary;
  };
  error?: string;
};
