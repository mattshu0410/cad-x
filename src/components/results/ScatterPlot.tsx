import type { AnalysisResult } from '@/types/analysis';
import React from 'react';
import {
  CartesianGrid,
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
  fill: string;
  stroke: string;
};

const classificationColors = {
  resilient: '#22c55e', // green
  susceptible: '#dc2626', // red
  reference: '#3b82f6', // blue
  other: '#6b7280', // grey
};

// Helper function to add transparency to hex colors
const addTransparency = (hexColor: string, opacity: number): string => {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hexColor}${alpha}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = (payload[0]).payload as PlotData;
    const original = data.original;
    const originalData = original.original_data;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
        <p className="text-sm font-medium mb-2">
          {data.subject_id ? `ID: ${data.subject_id}` : 'Subject'}
        </p>

        {/* Basic Demographics */}
        {originalData?.age && (
          <p className="text-xs">
            Age:
            {' '}
            {originalData.age}
          </p>
        )}
        {originalData?.gender && (
          <p className="text-xs">
            Sex:
            {' '}
            {originalData.gender}
          </p>
        )}

        {/* CACS */}
        <p className="text-xs">
          CACS:
          {' '}
          {original.cacs}
        </p>
        {original.cacs_percentile && (
          <p className="text-xs">
            CACS %tile:
            {' '}
            {(original.cacs_percentile * 100).toFixed(1)}
            %
          </p>
        )}

        {/* Blood Pressure */}
        {originalData?.sbp && (
          <p className="text-xs">
            Sys. BP:
            {' '}
            {originalData.sbp}
          </p>
        )}
        {originalData?.bp_med !== undefined && (
          <p className="text-xs">
            BP Med:
            {' '}
            {originalData.bp_med ? 'Yes' : 'No'}
          </p>
        )}

        {/* Cholesterol */}
        {originalData?.hdl && (
          <p className="text-xs">
            HDL(mmol/L):
            {' '}
            {(originalData.hdl as number).toFixed(2)}
          </p>
        )}
        {originalData?.hdl_mgdl && (
          <p className="text-xs">
            HDL(mg/dL):
            {' '}
            {originalData.hdl_mgdl}
          </p>
        )}
        {originalData?.tc && (
          <p className="text-xs">
            TC(mmol/L):
            {' '}
            {(originalData.tc as number).toFixed(2)}
          </p>
        )}
        {originalData?.tc_mgdl && (
          <p className="text-xs">
            TC(mg/dL):
            {' '}
            {originalData.tc_mgdl}
          </p>
        )}

        {/* Risk Factors */}
        {originalData?.cvhx_dm !== undefined && (
          <p className="text-xs">
            DM:
            {' '}
            {originalData.cvhx_dm ? 'Yes' : 'No'}
          </p>
        )}
        {originalData?.curr_smok !== undefined && (
          <p className="text-xs">
            Curr. Smoker:
            {' '}
            {originalData.curr_smok ? 'Yes' : 'No'}
          </p>
        )}

        {/* Scores */}
        <p className="text-xs">
          Avg Score:
          {' '}
          {data.x.toFixed(2)}
        </p>

        <p className="text-xs font-medium mt-2" style={{ color: classificationColors[data.classification as keyof typeof classificationColors] }}>
          {data.classification}
        </p>
      </div>
    );
  }
  return null;
};

export function ScatterPlot({ data, onPointClick }: ScatterPlotProps) {
  const plotDataLog: PlotData[] = data.map((d) => {
    const baseColor = classificationColors[d.classification as keyof typeof classificationColors] || '#6b7280';
    return {
      x: d.average_normalized_score || 0,
      y: Math.log(1 + d.cacs),
      classification: d.classification,
      subject_id: d.subject_id,
      original: d,
      fill: addTransparency(baseColor, 0.4),
      stroke: baseColor, // Full opacity for stroke/border
    };
  });

  const plotDataRaw: PlotData[] = data.map((d) => {
    const baseColor = classificationColors[d.classification as keyof typeof classificationColors] || '#6b7280';
    return {
      x: d.average_normalized_score || 0,
      y: d.cacs || 0,
      classification: d.classification,
      subject_id: d.subject_id,
      original: d,
      fill: addTransparency(baseColor, 0.4), // 40% opacity for fill
      stroke: baseColor, // Full opacity for stroke/border
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">CACS vs Average Normalized Risk Score</h3>
        <p className="text-sm text-muted-foreground">
          Click on a point to view details
        </p>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.entries(classificationColors).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm capitalize">{key}</span>
          </div>
        ))}
      </div>

      {/* Two charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: log(1 + CACS) */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">log(1 + CACS)</h4>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={plotDataLog} margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                name="Average Normalized Risk Score"
                label={{
                  value: 'Avg Normalized Risk Score',
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
              <Scatter
                dataKey="y"
                fill="#8884d8"
                strokeWidth={0.1}
                onClick={(data: PlotData) => {
                  if (onPointClick && data?.original) {
                    onPointClick(data.original);
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Raw CACS */}
        <div>
          <h4 className="text-md font-medium mb-2 text-center">CACS</h4>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={plotDataRaw} margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                name="Average Normalized Risk Score"
                label={{
                  value: 'Avg Normalized Risk Score',
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
                  value: 'CACS',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                dataKey="y"
                fill="#8884d8"
                strokeWidth={0.1}
                onClick={(data: PlotData) => {
                  if (onPointClick && data?.original) {
                    onPointClick(data.original);
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
