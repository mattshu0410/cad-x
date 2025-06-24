'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormStore } from '@/lib/stores/formStore';

type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { previousStep } = useFormStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <span>⚠️</span>
            <span>Analysis Failed</span>
          </CardTitle>
          <CardDescription>
            There was an error processing your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={previousStep}>
              ← Go Back
            </Button>
            <Button onClick={resetErrorBoundary}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type AnalysisErrorBoundaryProps = {
  children: React.ReactNode;
};

export function AnalysisErrorBoundary({ children }: AnalysisErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={ErrorFallback}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
