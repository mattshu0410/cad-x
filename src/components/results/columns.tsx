'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { AnalysisResult } from '@/types/analysis';
import { ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const columns: ColumnDef<AnalysisResult>[] = [
  {
    accessorKey: 'subject_id',
    header: 'ID',
    cell: ({ row }) => {
      const value = row.getValue('subject_id');
      // Check if subject_id is an empty object (when no ID column is uploaded)
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
        return '-';
      }
      return value || '-';
    },
  },
  {
    accessorKey: 'original_data.age',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Age
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const age = row.original.original_data?.age as number | undefined;
      return age || '-';
    },
  },
  {
    accessorKey: 'cacs',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          CACS
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'risk_scores.frs',
    header: 'FRS',
    cell: ({ row }) => {
      const value = row.original.risk_scores?.frs;
      return value ? value.toFixed(1) : '-';
    },
  },
  {
    accessorKey: 'risk_scores.ascvd',
    header: 'ASCVD',
    cell: ({ row }) => {
      const value = row.original.risk_scores?.ascvd;
      return value ? value.toFixed(1) : '-';
    },
  },
  {
    accessorKey: 'risk_scores.mesa',
    header: 'MESA',
    cell: ({ row }) => {
      const value = row.original.risk_scores?.mesa;
      return value ? value.toFixed(1) : '-';
    },
  },
  {
    accessorKey: 'risk_scores.score2',
    header: 'SCORE2',
    cell: ({ row }) => {
      const value = row.original.risk_scores?.score2;
      return value ? value.toFixed(1) : '-';
    },
  },
  {
    accessorKey: 'average_normalized_score',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Avg Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue('average_normalized_score') as number | undefined;
      return value ? value.toFixed(2) : '-';
    },
  },
  {
    accessorKey: 'cacs_percentile',
    header: 'CACS %ile',
    cell: ({ row }) => {
      const value = row.getValue('cacs_percentile') as number | undefined;
      return value ? `${value}%` : '-';
    },
  },
  {
    accessorKey: 'classification',
    header: 'Classification',
    cell: ({ row }) => {
      const classification = row.getValue('classification') as string;
      const variant
        = classification === 'Resilient'
          ? 'default'
          : classification === 'Susceptible'
            ? 'destructive'
            : classification === 'Reference'
              ? 'secondary'
              : 'outline';

      return (
        <Badge variant={variant} className="font-medium">
          {classification}
        </Badge>
      );
    },
  },
];
