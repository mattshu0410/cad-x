'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingResults() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mx-auto mb-2"></div>
          <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
        </div>
      </div>

      {/* Summary Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array.from({ length: 4 })].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Scatter Plot Loading */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-64" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Analyzing data...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table Loading */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-40" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table header */}
            <div className="grid grid-cols-6 gap-4 p-4 bg-muted rounded">
              {[...Array.from({ length: 6 })].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* Table rows */}
            {[...Array.from({ length: 8 })].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 p-4 border rounded">
                {[...Array.from({ length: 6 })].map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading Messages */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Running resilience analysis with your BioHEART data...
            </p>
            <p className="text-xs text-muted-foreground">
              This may take a few moments depending on dataset size
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
