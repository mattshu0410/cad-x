import Papa from 'papaparse';

type ParsedFileData = {
  columns: string[];
  preview: Record<string, unknown>[];
  hasHeaders: boolean;
  firstRowData: string[];
};

export async function parseFile(file: File, userHasHeaders?: boolean): Promise<ParsedFileData> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'csv') {
    return parseCSV(file, userHasHeaders);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcel();
  } else {
    throw new Error(
      'Unsupported file format. Please upload CSV or Excel files.',
    );
  }
}

function detectHeaders(firstRow: string[]): boolean {
  // Simple heuristic: if more than half of the values are non-numeric strings
  // and don't look like typical data values, assume they're headers
  const nonNumericCount = firstRow.filter(value => {
    if (!value || typeof value !== 'string') return false;
    // Check if it's a number
    if (!isNaN(Number(value)) && value.trim() !== '') return false;
    // Check if it looks like common data patterns (dates, yes/no, etc.)
    const lowerValue = value.toLowerCase().trim();
    if (['yes', 'no', 'true', 'false', 'male', 'female', 'm', 'f'].includes(lowerValue)) return false;
    // If it contains underscores or is camelCase, likely a column name
    if (value.includes('_') || /^[a-z]+[A-Z]/.test(value)) return true;
    // If it's a descriptive word/phrase, likely a header
    return value.length > 1 && /^[a-zA-Z\s_]+$/.test(value);
  }).length;
  
  return nonNumericCount > firstRow.length * 0.5;
}

function generateColumnNames(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Column ${i + 1}`);
}

async function parseCSV(file: File, userHasHeaders?: boolean): Promise<ParsedFileData> {
  return new Promise((resolve, reject) => {
    // First, parse without headers to get raw data
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      preview: 11, // Get 11 rows to have first row + 10 preview rows
      complete: (rawResults) => {
        if (rawResults.errors.length > 0) {
          const errorMessage = rawResults.errors
            .map(err => err.message)
            .join(', ');
          reject(new Error(`CSV parsing error: ${errorMessage}`));
          return;
        }

        if (!rawResults.data || rawResults.data.length === 0) {
          reject(new Error('No data found in the CSV file'));
          return;
        }

        const rawData = rawResults.data as string[][];
        const firstRow = rawData[0];
        const hasHeaders = userHasHeaders !== undefined ? userHasHeaders : detectHeaders(firstRow);
        
        // Now parse again with proper header setting
        Papa.parse(file, {
          header: hasHeaders,
          skipEmptyLines: true,
          preview: 10,
          dynamicTyping: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              const errorMessage = results.errors
                .map(err => err.message)
                .join(', ');
              reject(new Error(`CSV parsing error: ${errorMessage}`));
              return;
            }

            if (!results.data || results.data.length === 0) {
              reject(new Error('No data found in the CSV file'));
              return;
            }

            let columns: string[];
            let firstRowData: string[];
            
            if (hasHeaders) {
              columns = Object.keys(results.data[0] as Record<string, unknown>);
              // First row data is the actual first data row (second row in file)
              const firstDataRow = results.data[0] as Record<string, unknown>;
              firstRowData = columns.map(col => String(firstDataRow[col] || ''));
            } else {
              // Generate column names and use first row as data
              columns = generateColumnNames(firstRow.length);
              firstRowData = firstRow.map(String);
            }

            if (columns.length === 0) {
              reject(new Error('No columns found in the CSV file'));
              return;
            }

            resolve({
              columns,
              preview: results.data as Record<string, unknown>[],
              hasHeaders,
              firstRowData,
            });
          },
          error: (error) => {
            reject(new Error(`Failed to parse CSV: ${error.message}`));
          },
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

async function parseExcel(): Promise<ParsedFileData> {
  // For now, provide a fallback that suggests converting to CSV
  // In production, you would use a library like xlsx to parse Excel files
  throw new Error(
    'Excel file parsing is not yet implemented. Please convert your file to CSV format and try again.',
  );
}
