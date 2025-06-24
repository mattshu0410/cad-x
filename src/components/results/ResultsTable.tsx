import type { AnalysisResult } from '@/types/analysis';
import React from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';

type ResultsTableProps = {
  data: AnalysisResult[];
  onRowClick?: (row: AnalysisResult) => void;
  onExport?: () => void;
};

export function ResultsTable({ data, onExport }: ResultsTableProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Analysis Results
        </h2>
        <p className="text-sm text-muted-foreground">
          {data.length}
          {' '}
          subjects Analysed
        </p>
      </div>
      <DataTable columns={columns} data={data} onExport={onExport} />
    </div>
  );
}
