'use client';

import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFormStore } from '@/lib/stores/formStore';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, label: 'Upload', description: 'Upload Data' },
  { id: 2, label: 'Map', description: 'Map Columns' },
  { id: 3, label: 'Ethnicity', description: 'Map Ethnicities' },
  { id: 4, label: 'Settings', description: 'Configure Settings' },
  { id: 5, label: 'Threshold', description: 'Set Thresholds' },
  { id: 6, label: 'Result', description: 'View Results' },
];

export function StepperNavigation() {
  const { currentStep, completedSteps } = useFormStore();

  return (
    <div className="w-full">
      {/* Step Indicators with Integrated Progress */}
      <div className="flex items-center justify-between relative">
        {/* Background connector line that spans between all step markers */}
        <div className="absolute top-4.5 left-5 right-5 h-1 bg-muted rounded-full" />
        {/* Progress connector line that fills progressively between steps */}
        <div
          className="absolute top-4 left-5 h-2 bg-primary rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * (100 - 8))}%`,
          }}
        />

        {steps.map((step, _index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = currentStep === step.id;
          const isAccessible = step.id <= currentStep || isCompleted;

          return (
            <div key={step.id} className="flex flex-col items-center space-y-2 relative">
              {/* Step Circle */}
              <Badge
                variant={
                  isCompleted
                    ? 'default'
                    : isCurrent
                      ? 'secondary'
                      : 'outline'
                }
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium bg-background border-2 z-10',
                  {
                    'bg-primary text-primary-foreground border-primary': isCompleted,
                    'bg-accent text-accent-foreground border-accent': isCurrent,
                    'bg-background text-muted-foreground border-muted': !isAccessible && !isCurrent,
                  },
                )}
              >
                {isCompleted ? <Check /> : step.id}
              </Badge>

              {/* Step Label */}
              <div className="text-center">
                <div className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                )}
                >
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground hidden md:block">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
