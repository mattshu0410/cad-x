# BioHEART Resilience Calculator - Development Execution Plan

## 1. Infrastructure Setup Phase

### 1.1 Development Environment

```bash
# Project initialization
npx create-next-app@latest cad-x --typescript --tailwind --app
cd cad-x

# Core dependencies
npm install zustand @tanstack/react-query @tanstack/react-table
npm install recharts reactgrid
npm install zod react-hook-form @hookform/resolvers
npm install @supabase/supabase-js
npm install posthog-js
npm install papaparse xlsx

# UI dependencies
npm install @radix-ui/react-* # Shadcn UI components
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Development dependencies
npm install -D @types/papaparse
```

### 1.2 Supabase Configuration

```sql
-- Tables schema
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  file_url TEXT NOT NULL,
  settings JSONB NOT NULL,
  results JSONB,
  status TEXT DEFAULT 'pending',
  error TEXT,
  user_session_id TEXT
);

CREATE INDEX idx_analyses_session ON analyses(user_session_id);
CREATE INDEX idx_analyses_created ON analyses(created_at);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-files', 'analysis-files', false);

-- RLS policies
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'analysis-files');

CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'analysis-files');
```

### 1.3 R Microservice Setup (Plumber)

```r
# plumber.R
library(plumber)
library(BioHEARTResilience)
library(jsonlite)

#* @apiTitle BioHEART Resilience Analysis API
#* @apiVersion 1.0.0

#* Prepare cohort data
#* @param file_url URL of uploaded file
#* @param column_mappings JSON object of column mappings
#* @param cholesterol_unit Either "mmol/L" or "mg/dL"
#* @param id_column Optional ID column name
#* @post /prepare-data
function(file_url, column_mappings, cholesterol_unit = "mmol/L", id_column = NULL) {
  tryCatch({
    # Download file from Supabase
    temp_file <- tempfile(fileext = tools::file_ext(file_url))
    download.file(file_url, temp_file)

    # Read data based on file type
    if (grepl("\\.csv$", file_url)) {
      data <- read.csv(temp_file, stringsAsFactors = FALSE)
    } else {
      data <- readxl::read_excel(temp_file)
    }

    # Apply column mappings
    mappings <- jsonlite::fromJSON(column_mappings)

    # Prepare data using package function
    prepared <- prepare_cohort_data(
      data,
      cacs_col = mappings$cacs,
      age_col = mappings$age,
      gender_col = mappings$gender,
      tc_col = mappings$tc,
      hdl_col = mappings$hdl,
      sbp_col = mappings$sbp,
      smoking_col = mappings$smoking,
      diabetes_col = mappings$diabetes,
      bp_med_col = mappings$bp_med,
      lipid_med_col = mappings$lipid_med,
      fh_ihd_col = mappings$fh_ihd,
      ethnicity_col = mappings$ethnicity,
      id_col = id_column,
      cholesterol_unit = cholesterol_unit,
      validate = TRUE
    )

    # Save prepared data temporarily
    prepared_id <- uuid::UUIDgenerate()
    saveRDS(prepared, file.path("/tmp", paste0(prepared_id, ".rds")))

    list(
      success = TRUE,
      prepared_id = prepared_id,
      n_rows = nrow(prepared),
      summary = summary(prepared)
    )

  }, error = function(e) {
    list(
      success = FALSE,
      error = e$message
    )
  })
}

#* Run resilience analysis
#* @param prepared_data_id ID of prepared data
#* @param settings JSON object with analysis settings
#* @post /analyze
function(prepared_data_id, settings) {
  tryCatch({
    # Load prepared data
    prepared <- readRDS(file.path("/tmp", paste0(prepared_data_id, ".rds")))
    settings <- jsonlite::fromJSON(settings)

    # Run analysis
    results <- resilience_analysis(
      prepared,
      risk_scores = settings$risk_scores,
      risk_region = settings$risk_region,
      percentile_thresholds = unlist(settings$percentile_thresholds),
      min_scores = settings$min_scores,
      include_plots = TRUE,
      ethnicity_mappings = settings$ethnicity_mappings
    )

    # Convert plots to plotly JSON
    plots <- list()
    if (!is.null(results$plots)) {
      plots$cacs_vs_risk <- plotly::ggplotly(results$plots$cacs_vs_risk)
      plots$risk_distribution <- plotly::ggplotly(results$plots$risk_distribution)
      plots$percentile_distribution <- plotly::ggplotly(results$plots$percentile_distribution)
    }

    # Return results
    list(
      success = TRUE,
      data = results$final_data,
      plots = plots,
      summary = list(
        n_total = nrow(results$final_data),
        n_complete = results$model_diagnostics$fit_statistics$n_observations,
        classifications = attr(results$classifications, "class_summary")
      )
    )

  }, error = function(e) {
    list(
      success = FALSE,
      error = e$message
    )
  })
}
```

## 2. Frontend Development Phases

### Phase 1: Foundation (Week 1-2)

#### 2.1 Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── analysis/
│       └── page.tsx
├── components/
│   └── [organized by feature]
├── lib/
│   ├── supabase.ts
│   ├── api.ts
│   └── validation.ts
├── hooks/
│   ├── useAnalysis.ts
│   └── useFileUpload.ts
├── store/
│   └── analysisStore.ts
└── types/
    └── index.ts
```

#### 2.2 Core Layout Implementation

```typescript
// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-primary-200 to-white">
            <header className="border-b bg-white/80 backdrop-blur">
              <div className="container mx-auto px-4 py-4">
                <h1 className="text-2xl font-heading text-primary-900">
                  BioHEART Resilience Calculator
                </h1>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

#### 2.3 State Management Setup

```typescript
// store/analysisStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AnalysisState {
  currentStep: number;
  completedSteps: Set<number>;

  // File data
  file: {
    name: string;
    url: string;
    columns: string[];
    preview: any[];
  } | null;

  // Mappings
  columnMappings: Record<string, string>;
  ethnicityMappings: Record<string, { ascvd: string; mesa: string }>;

  // Settings
  settings: {
    riskScores: string[];
    riskRegion: string;
    minScores: number;
    cholesterolUnit: "mmol/L" | "mg/dL";
    percentileThresholds: {
      resilient: number;
      reference_low: number;
      reference_high: number;
      susceptible: number;
    };
  };

  // Results
  results: any | null;

  // Actions
  setFile: (file: any) => void;
  setColumnMappings: (mappings: Record<string, string>) => void;
  setEthnicityMappings: (mappings: any) => void;
  updateSettings: (settings: Partial<AnalysisState["settings"]>) => void;
  setResults: (results: any) => void;
  goToStep: (step: number) => void;
  completeStep: (step: number) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  devtools(
    persist(
      (set) => ({
        currentStep: 1,
        completedSteps: new Set(),
        file: null,
        columnMappings: {},
        ethnicityMappings: {},
        settings: {
          riskScores: ["frs", "ascvd", "mesa", "score2"],
          riskRegion: "Low",
          minScores: 1,
          cholesterolUnit: "mmol/L",
          percentileThresholds: {
            resilient: 20,
            reference_low: 40,
            reference_high: 60,
            susceptible: 80,
          },
        },
        results: null,

        setFile: (file) => set({ file }),
        setColumnMappings: (mappings) => set({ columnMappings: mappings }),
        setEthnicityMappings: (mappings) =>
          set({ ethnicityMappings: mappings }),
        updateSettings: (newSettings) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),
        setResults: (results) => set({ results }),
        goToStep: (step) => set({ currentStep: step }),
        completeStep: (step) =>
          set((state) => ({
            completedSteps: new Set([...state.completedSteps, step]),
          })),
        reset: () =>
          set({
            currentStep: 1,
            completedSteps: new Set(),
            file: null,
            columnMappings: {},
            ethnicityMappings: {},
            results: null,
          }),
      }),
      {
        name: "bioheart-analysis",
      }
    )
  )
);
```

### Phase 2: Form Components (Week 3-4)

#### 2.4 File Upload Implementation

```typescript
// components/forms/FileUploader.tsx
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { parseFile } from "@/lib/fileParser";

export function FileUploader({
  onComplete,
}: {
  onComplete: (data: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setError(null);

      try {
        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("analysis-files")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Parse file to get columns and preview
        const parsed = await parseFile(file);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("analysis-files").getPublicUrl(fileName);

        onComplete({
          name: file.name,
          url: publicUrl,
          columns: parsed.columns,
          preview: parsed.preview,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? "border-primary-600 bg-primary-50"
              : "border-gray-300"
          }
          ${
            uploading
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-primary-400"
          }
        `}
      >
        <input {...getInputProps()} disabled={uploading} />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? "Drop your file here" : "Drop your file here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or{" "}
              <span className="text-primary-600 font-medium">browse files</span>{" "}
              to upload
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Accepted: CSV, XLSX, XLS (max 50MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Phase 3: Analysis Integration (Week 5-6)

#### 2.5 API Integration

```typescript
// lib/api.ts
import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_R_API_URL;

export async function prepareData(params: {
  file_url: string;
  column_mappings: Record<string, string>;
  cholesterol_unit: string;
  id_column?: string;
}) {
  const response = await fetch(`${API_URL}/prepare-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to prepare data");
  }

  return response.json();
}

export async function runAnalysis(params: {
  prepared_data_id: string;
  settings: any;
}) {
  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Analysis failed");
  }

  return response.json();
}

export async function saveAnalysis(analysisId: string, results: any) {
  const { error } = await supabase
    .from("analyses")
    .update({ results, status: "completed" })
    .eq("id", analysisId);

  if (error) throw error;
}
```

### Phase 4: Results & Visualization (Week 7-8)

#### 2.6 Results Table with Tanstack

```typescript
// components/results/ResultsTable.tsx
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

export function ResultsTable({ data, onRowClick }: ResultsTableProps) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
      },
      {
        accessorKey: "age",
        header: "Age",
        size: 80,
      },
      {
        accessorKey: "cacs",
        header: "CACS",
        size: 100,
      },
      {
        accessorKey: "average_norm_score",
        header: "Avg Score",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value.toFixed(2);
        },
      },
      {
        accessorKey: "classification",
        header: "Classification",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          const colorMap = {
            resilient: "text-green-700 bg-green-50",
            susceptible: "text-red-700 bg-red-50",
            reference: "text-blue-700 bg-blue-50",
            other: "text-gray-700 bg-gray-50",
          };
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                colorMap[value] || colorMap.other
              }`}
            >
              {value}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row.original)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <span className="text-sm text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}
```

## 3. Testing Strategy

### 3.1 Unit Testing Setup

```typescript
// __tests__/validation.test.ts
import { validateColumnMappings, validateThresholds } from "@/lib/validation";

describe("Column Mapping Validation", () => {
  test("validates required fields", () => {
    const mappings = {
      cacs: "CAC_Score",
      age: "Age",
      // missing required fields
    };

    const result = validateColumnMappings(mappings);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("gender is required");
  });
});
```

### 3.2 Integration Testing

```typescript
// __tests__/analysis-flow.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalysisPage } from "@/app/analysis/page";

describe("Analysis Flow", () => {
  test("completes full analysis workflow", async () => {
    render(<AnalysisPage />);

    // Upload file
    const file = new File(["col1,col2\n1,2"], "test.csv", { type: "text/csv" });
    const input = screen.getByLabelText(/drop.*file/i);
    await userEvent.upload(input, file);

    // Map columns
    await waitFor(() => {
      expect(screen.getByText("Map Your Data Columns")).toBeInTheDocument();
    });

    // Continue through steps...
  });
});
```

## 4. Deployment Strategy

### 4.1 Environment Configuration

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_R_API_URL=https://your-r-api.digitalocean.app
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
```

### 4.2 Deployment Steps

1. **R Microservice** (DigitalOcean App Platform)

   - Dockerize Plumber API
   - Configure auto-scaling
   - Set up health checks

2. **Next.js Frontend** (Vercel)

   - Connect GitHub repository
   - Configure environment variables
   - Set up preview deployments

3. **Database** (Supabase)
   - Apply migrations
   - Configure backup schedule
   - Set up monitoring

## 5. Monitoring & Analytics

### 5.1 PostHog Setup

```typescript
// lib/analytics.ts
import posthog from "posthog-js";

export function trackEvent(event: string, properties?: any) {
  if (typeof window !== "undefined") {
    posthog.capture(event, properties);
  }
}

// Usage
trackEvent("analysis_started", {
  file_size: file.size,
  risk_scores: settings.riskScores,
});
```

### 5.2 Error Tracking

```typescript
// lib/errorTracking.ts
export function reportError(error: Error, context?: any) {
  console.error("Error:", error, context);

  // Send to monitoring service
  if (process.env.NODE_ENV === "production") {
    // Sentry, LogRocket, etc.
  }
}
```

## 6. Optimization Opportunities

### 6.1 Performance

- Implement request queuing for R analysis
- Add caching layer for repeated analyses
- Optimize file parsing with Web Workers
- Use React.memo for expensive components

### 6.2 User Experience

- Add analysis templates
- Implement auto-save for progress
- Add collaborative features
- Create guided tutorials

### 6.3 Scalability

- Implement horizontal scaling for R service
- Add Redis for job queue management
- Use CDN for static assets
- Implement database connection pooling
