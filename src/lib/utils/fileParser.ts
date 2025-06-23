import Papa from "papaparse";

interface ParsedFileData {
  columns: string[];
  preview: Record<string, unknown>[];
}

export async function parseFile(file: File): Promise<ParsedFileData> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  if (fileExtension === "csv") {
    return parseCSV(file);
  } else if (fileExtension === "xlsx" || fileExtension === "xls") {
    return parseExcel();
  } else {
    throw new Error(
      "Unsupported file format. Please upload CSV or Excel files."
    );
  }
}

async function parseCSV(file: File): Promise<ParsedFileData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 10, // Only parse first 10 rows for preview
      dynamicTyping: true, // Automatically convert numbers
      complete: (results) => {
        if (results.errors.length > 0) {
          const errorMessage = results.errors
            .map((err) => err.message)
            .join(", ");
          reject(new Error(`CSV parsing error: ${errorMessage}`));
          return;
        }

        if (!results.data || results.data.length === 0) {
          reject(new Error("No data found in the CSV file"));
          return;
        }

        // Get column names from the first row
        const columns = Object.keys(results.data[0] as Record<string, unknown>);

        if (columns.length === 0) {
          reject(new Error("No columns found in the CSV file"));
          return;
        }

        resolve({
          columns,
          preview: results.data as Record<string, unknown>[],
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
    "Excel file parsing is not yet implemented. Please convert your file to CSV format and try again."
  );
}
