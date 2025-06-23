'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { StepperNavigation } from './StepperNavigation';

interface AppLayoutProps {
  children: ReactNode;
  showStepper?: boolean;
}

export function AppLayout({ children, showStepper = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Card className="rounded-none border-0 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-heading font-bold text-primary">
                BioHEART Resilience Calculator
              </h1>
            </div>
            <Button variant="ghost" size="sm">
              Help ?
            </Button>
          </div>
        </div>
      </Card>

      {/* Stepper Navigation */}
      {showStepper && (
        <>
          <Card className="rounded-none border-0 border-b bg-muted/30">
            <div className="container mx-auto px-4 py-4">
              <StepperNavigation />
            </div>
          </Card>
          <Separator />
        </>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}