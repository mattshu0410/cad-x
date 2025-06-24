'use client';

import { Suspense } from 'react';
import { useFormStore } from '@/lib/stores/formStore';
import { ColumnMapper } from './forms/ColumnMapper';
import { EthnicityGrid } from './forms/EthnicityGrid';
import { FileUploader } from './forms/FileUploader';
import { SettingsForm } from './forms/SettingsForm';
import { ThresholdSelector } from './forms/ThresholdSelector';
import { AnalysisErrorBoundary } from './results/AnalysisErrorBoundary';
import { LoadingResults } from './results/LoadingResults';
import { ResultsViewSuspense } from './results/ResultsViewSuspense';

export function MultiStepForm() {
  const { currentStep } = useFormStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FileUploader />;
      case 2:
        return <ColumnMapper />;
      case 3:
        return <EthnicityGrid />;
      case 4:
        return <SettingsForm />;
      case 5:
        return <ThresholdSelector />;
      case 6:
        return (
          <AnalysisErrorBoundary>
            <Suspense fallback={<LoadingResults />}>
              <ResultsViewSuspense />
            </Suspense>
          </AnalysisErrorBoundary>
        );
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-heading mb-4">Invalid Step</h2>
            <p className="text-muted-foreground">Please start from the beginning.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderStep()}
    </div>
  );
}
