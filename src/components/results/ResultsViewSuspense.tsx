'use client';

import type { AnalysisResult } from '@/types/analysis';
import React, { useMemo, useState } from 'react';
import { useAnalysisSuspenseQuery } from '@/lib/queries/mutations';
import { useDataStore } from '@/lib/stores/dataStore';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { ResultsTable } from './ResultsTable';
import { ScatterPlot } from './ScatterPlot';
import { SummaryCards } from './SummaryCards';

export function ResultsViewSuspense() {
  const { uploadedFile, columnMappings, ethnicityMappings } = useDataStore();
  const { settings } = useSettingsStore();
  const [_selectedRow, setSelectedRow] = useState<AnalysisResult | null>(null);

  // Prepare the request data
  const requestData = useMemo(() => ({
    file_url: uploadedFile?.url || '',
    column_mappings: columnMappings,
    cholesterol_unit: settings.cholesterolUnit,
    settings: {
      risk_scores: settings.riskScores,
      risk_region: settings.riskRegion,
      ethnicity_mappings: ethnicityMappings,
      percentile_thresholds: {
        resilient: settings.percentileThresholds.resilient,
        reference_low: settings.percentileThresholds.reference_low,
        reference_high: settings.percentileThresholds.reference_high,
        susceptible: settings.percentileThresholds.susceptible,
      },
      min_scores: settings.minScores,
    },
  }), [uploadedFile?.url, columnMappings, ethnicityMappings, settings]);

  // Don't render if no file URL
  if (!uploadedFile?.url) {
    throw new Error('No file uploaded');
  }

  // Use the suspense query - this will suspend while loading
  const { data: response } = useAnalysisSuspenseQuery(requestData);

  // With useSuspenseQuery, data is guaranteed to be defined
  // Check if the response indicates success
  if (!response.success || !response.data?.results) {
    throw new Error(response.error || 'Analysis failed');
  }

  const data = response.data.results;
  const summary = response.data.summary;

  const handleRowClick = (row: AnalysisResult) => {
    setSelectedRow(row);
    // Could highlight point in chart
  };

  const handlePointClick = (point: AnalysisResult) => {
    setSelectedRow(point);
    // Could scroll to row in table
  };

  const handleExport = () => {
    // CSV export will be implemented later
    console.warn('Export CSV - to be implemented');
  };

  return (
    <div className="space-y-6">
      <SummaryCards data={data} summary={summary} />

      <ScatterPlot
        data={data}
        onPointClick={handlePointClick}
      />

      <ResultsTable
        data={data}
        onRowClick={handleRowClick}
        onExport={handleExport}
      />
    </div>
  );
}
