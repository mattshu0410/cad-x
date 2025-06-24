import type { AnalysisResult } from '@/types/analysis';
import React from 'react';
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ScatterPlotProps = {
  data: AnalysisResult[];
  onPointClick?: (data: AnalysisResult) => void;
};

type PlotData = {
  x: number;
  y: number;
  classification: string;
  subject_id?: string;
  original: AnalysisResult;
};

const classificationColors = {
  Resilient: '#8833d8',
  Susceptible: '#dc2626',
  Reference: '#6b7280',
  Other: '#d1d5db',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = (payload[0]).payload as PlotData;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="text-sm font-medium">
          {data.subject_id ? `ID: ${data.subject_id}` : 'Subject'}
        </p>
        <p className="text-sm">
          CACS:
          {' '}
          {data.original.cacs}
        </p>
        <p className="text-sm">
          Avg Score:
          {' '}
          {data.x.toFixed(2)}
        </p>
        <p className="text-sm font-medium" style={{ color: classificationColors[data.classification as keyof typeof classificationColors] }}>
          {data.classification}
        </p>
      </div>
    );
  }
  return null;
};

export function ScatterPlot({ data, onPointClick }: ScatterPlotProps) {
  const plotData: PlotData[] = data.map(d => ({
    x: d.average_normalized_score || 0,
    y: Math.log(1 + d.cacs),
    classification: d.classification,
    subject_id: d.subject_id,
    original: d,
  }));

  const groupedData = {
    Resilient: plotData.filter(d => d.classification === 'Resilient'),
    Susceptible: plotData.filter(d => d.classification === 'Susceptible'),
    Reference: plotData.filter(d => d.classification === 'Reference'),
    Other: plotData.filter(d => d.classification === 'Other'),
  };
  console.warn(groupedData);
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">CACS vs Average Normalized Risk Score</h3>
        <p className="text-sm text-muted-foreground">
          Click on a point to view details
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            name="Average Normalized Risk Score"
            label={{
              value: 'Average Normalized Risk Score',
              position: 'insideBottom',
              offset: -10,
            }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name="CACS"
            domain={['dataMin', 'dataMax']}
            label={{
              value: 'log(1 + CACS)',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Object.entries(groupedData).map(([key, values]) => (
            <Scatter
              key={key}
              name={key}
              data={values}
              fill={classificationColors[key as keyof typeof classificationColors]}
              onClick={(data: PlotData) => {
                if (onPointClick && data?.original) {
                  onPointClick(data.original);
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
