'use client';

import { LandingPage } from '@/components/LandingPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { MultiStepForm } from '@/components/MultiStepForm';
import { useFormStore } from '@/lib/stores/formStore';

export default function Home() {
  const { currentStep } = useFormStore();

  // Show landing page if we're at step 0 or haven't started
  const showLanding = currentStep === 0;

  return (
    <AppLayout showStepper={!showLanding}>
      {showLanding
        ? (
            <LandingPage />
          )
        : (
            <MultiStepForm />
          )}
    </AppLayout>
  );
}
