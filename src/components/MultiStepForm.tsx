'use client';

import { useFormStore } from '@/lib/stores/formStore';
import { FileUploader } from './forms/FileUploader';
import { ColumnMapper } from './forms/ColumnMapper';
import { EthnicityGrid } from './forms/EthnicityGrid';
import { SettingsForm } from './forms/SettingsForm';
import { ThresholdSelector } from './forms/ThresholdSelector';

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
          <div className="text-center py-20">
            <h2 className="text-2xl font-heading mb-4">Step 6: Results</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
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