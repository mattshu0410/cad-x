'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

  const progress = ((completedSteps.size) / steps.length) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = currentStep === step.id;
          const isAccessible = step.id <= currentStep || isCompleted;

          return (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              {/* Step Circle */}
              <div className="flex items-center">
                <Badge
                  variant={
                    isCompleted
                      ? 'default'
                      : isCurrent
                        ? 'secondary'
                        : 'outline'
                  }
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium',
                    {
                      'bg-primary text-primary-foreground': isCompleted,
                      'bg-accent text-accent-foreground border-accent': isCurrent,
                      'bg-muted text-muted-foreground': !isAccessible && !isCurrent,
                    },
                  )}
                >
                  {isCompleted ? '✓' : step.id}
                </Badge>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-12 ml-2',
                      isCompleted ? 'bg-primary' : 'bg-muted',
                    )}
                  />
                )}
              </div>

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
