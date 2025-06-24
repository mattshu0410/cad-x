import type { AnalysisResult } from '@/types/analysis';
import { Activity, AlertCircle, CheckCircle, Shield, Users } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SummaryCardsProps = {
  data: AnalysisResult[];
  summary?: {
    n_total: number;
    n_complete: number;
    classifications: {
      resilient: number;
      reference: number;
      susceptible: number;
      other: number;
    };
  };
};

export function SummaryCards({ data, summary }: SummaryCardsProps) {
  // Use summary from API if available, otherwise calculate from data
  const total = summary?.n_total || data.length;
  const withCompleteScores = summary?.n_complete || data.filter(d => d.average_normalized_score !== 0).length;

  const classifications = summary?.classifications || data.reduce((acc, curr) => {
    acc[curr.classification] = (acc[curr.classification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cards = [
    {
      title: 'Total Subjects',
      value: total,
      description: 'Analysed in dataset',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Complete Analysis',
      value: withCompleteScores,
      description: `${((withCompleteScores / total) * 100).toFixed(1)}% with valid scores`,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Resilient',
      value: ('resilient' in classifications ? classifications.resilient : classifications.Resilient) || 0,
      description: 'Low CACS, high risk',
      icon: Shield,
      color: 'text-purple-600',
    },
    {
      title: 'Susceptible',
      value: ('susceptible' in classifications ? classifications.susceptible : classifications.Susceptible) || 0,
      description: 'High CACS, low risk',
      icon: AlertCircle,
      color: 'text-red-600',
    },
    {
      title: 'Reference',
      value: ('reference' in classifications ? classifications.reference : classifications.Reference) || 0,
      description: 'Expected CACS for risk',
      icon: Activity,
      color: 'text-gray-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
