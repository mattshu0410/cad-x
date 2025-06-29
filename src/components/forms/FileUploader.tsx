'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useFileUpload } from '@/lib/queries/mutations';
import { useDataStore } from '@/lib/stores/dataStore';
import { useFormStore } from '@/lib/stores/formStore';
import { getExcelSheetAsCSV, parseExcelSheet, parseFile } from '@/lib/utils/fileParser';

// Helper function to convert CSV content to File
const createCsvFile = (csvContent: string, originalFileName: string): File => {
  const csvBlob = new Blob([csvContent], { type: 'text/csv' });
  const baseName = originalFileName.replace(/\.(xlsx|xls)$/i, '');
  return new File([csvBlob], `${baseName}.csv`, { type: 'text/csv' });
};

const ACCEPTED_FILE_TYPES = ['.csv', '.xlsx', '.xls'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSheetSelection, setShowSheetSelection] = useState(false);
  const [showHeaderConfig, setShowHeaderConfig] = useState(false);
  const [tempFileData, setTempFileData] = useState<any>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [isProcessingSheet, setIsProcessingSheet] = useState(false);
  const { mutate: uploadFile, isPending } = useFileUpload();
  const { setUploadedFile, hasHeaders, setHasHeaders } = useDataStore();
  const { nextStep, completeStep } = useFormStore();

  const handleFile = useCallback(
    (file: File) => {
      // Validate file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
        toast.error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 50MB');
        return;
      }

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      uploadFile(file, {
        onSuccess: async (response) => {
          clearInterval(progressInterval);
          setUploadProgress(90);

          try {
            const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

            // Parse file to extract columns and preview data
            const parseResult = await parseFile(file);

            setUploadProgress(100);

            // Store the original file for Excel sheet processing
            setOriginalFile(file);

            // Handle Excel files - show sheet selection
            if ((fileExtension === '.xlsx' || fileExtension === '.xls') && parseResult.sheetNames) {
              setTempFileData({
                name: file.name,
                url: response.url,
                size: file.size,
                sheetNames: parseResult.sheetNames,
              });
              setShowSheetSelection(true);
            } else {
              // Handle CSV files - go directly to header configuration
              const { columns, preview, hasHeaders: detectedHeaders, firstRowData } = parseResult;
              setTempFileData({
                name: file.name,
                url: response.url,
                columns,
                preview,
                size: file.size,
                hasHeaders: detectedHeaders,
                firstRowData,
              });

              // Set the detected header state and show configuration
              setHasHeaders(detectedHeaders);
              setShowHeaderConfig(true);
            }
          } catch (error) {
            clearInterval(progressInterval);
            setUploadProgress(0);
            toast.error(`Failed to parse file: ${(error as Error).message}`);
          }
        },
        onError: (error) => {
          clearInterval(progressInterval);
          setUploadProgress(0);
          toast.error(`Upload failed: ${error.message}`);
        },
      });
    },
    [uploadFile, setHasHeaders],
  );

  const handleNext = useCallback(() => {
    if (!tempFileData) {
      return;
    }

    // Re-parse the file with the user's header choice if different from detected
    if (tempFileData.hasHeaders !== hasHeaders) {
      // Update the file data based on user's header choice
      let updatedColumns: string[];
      let updatedFirstRowData: string[];

      if (hasHeaders) {
        // User says there are headers, use detected column names
        updatedColumns = tempFileData.columns;
        updatedFirstRowData = tempFileData.firstRowData;
      } else {
        // User says no headers, generate Column 1, Column 2, etc.
        updatedColumns = Array.from({ length: tempFileData.columns.length }, (_, i) => `Column ${i + 1}`);
        updatedFirstRowData = tempFileData.columns; // Original first row becomes data
      }

      setUploadedFile({
        ...tempFileData,
        columns: updatedColumns,
        hasHeaders,
        firstRowData: updatedFirstRowData,
      });
    } else {
      // Use the file data as-is
      setUploadedFile(tempFileData);
    }

    completeStep(1);
    nextStep();
  }, [tempFileData, hasHeaders, setUploadedFile, completeStep, nextStep]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile],
  );

  const handleSheetSelection = useCallback(async () => {
    if (!originalFile || !selectedSheet) {
      toast.error('Please select a sheet first.');
      return;
    }

    setIsProcessingSheet(true);

    try {
      // Get CSV content from the selected Excel sheet
      const csvContent = await getExcelSheetAsCSV(originalFile, selectedSheet);

      // Create a CSV file from the content
      const csvFile = createCsvFile(csvContent, originalFile.name);

      // Upload the converted CSV file to Supabase
      uploadFile(csvFile, {
        onSuccess: async (response) => {
          try {
            // Parse the CSV file
            const { columns, preview, hasHeaders: detectedHeaders, firstRowData } = await parseExcelSheet(originalFile, selectedSheet);

            // Update temp file data with sheet-specific data and new CSV URL
            setTempFileData((prev: any) => ({
              ...prev,
              name: csvFile.name,
              url: response.url,
              columns,
              preview,
              hasHeaders: detectedHeaders,
              firstRowData,
              selectedSheet,
              size: csvFile.size,
            }));

            // Set the detected header state and show configuration
            setHasHeaders(detectedHeaders);
            setShowSheetSelection(false);
            setShowHeaderConfig(true);
          } catch (error) {
            toast.error(`Failed to parse converted CSV: ${(error as Error).message}`);
          }
        },
        onError: (error) => {
          toast.error(`Failed to upload converted CSV: ${error.message}`);
        },
      });
    } catch (error) {
      toast.error(`Failed to convert sheet to CSV: ${(error as Error).message}`);
    } finally {
      setIsProcessingSheet(false);
    }
  }, [originalFile, selectedSheet, setHasHeaders, uploadFile]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Area */}
      {!showSheetSelection && !showHeaderConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Data</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file containing cardiovascular data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="text-4xl">📁</div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop your file here</p>
                  <p className="text-muted-foreground">
                    or
                    {' '}
                    <Label
                      htmlFor="file-upload"
                      className="text-primary cursor-pointer hover:underline"
                    >
                      browse files
                    </Label>
                    {' '}
                    to upload
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACCEPTED_FILE_TYPES.map(type => (
                    <Badge key={type} variant="outline">
                      {type.toUpperCase()}
                    </Badge>
                  ))}
                  <Badge variant="outline">max 50MB</Badge>
                </div>
              </div>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept={ACCEPTED_FILE_TYPES.join(',')}
                onChange={handleInputChange}
                disabled={isPending}
              />
            </div>

            {/* Upload Progress */}
            {isPending && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>
                    {uploadProgress}
                    %
                  </span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sheet Selection */}
      {showSheetSelection && tempFileData && (
        <Card>
          <CardHeader>
            <CardTitle>Select Sheet</CardTitle>
            <CardDescription>
              Your Excel file contains multiple sheets. Please select which sheet to process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sheet-select">Available Sheets</Label>
              <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sheet..." />
                </SelectTrigger>
                <SelectContent>
                  {tempFileData.sheetNames?.map((sheetName: string) => (
                    <SelectItem key={sheetName} value={sheetName}>
                      {sheetName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSheetSelection}
                disabled={!selectedSheet || isProcessingSheet}
                className="flex-1"
              >
                {isProcessingSheet ? 'Processing...' : 'Process Selected Sheet →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Configuration */}
      {showHeaderConfig && tempFileData && (
        <Card>
          <CardHeader>
            <CardTitle>Data Header Configuration</CardTitle>
            <CardDescription>
              Configure how your data should be interpreted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="has-headers">My data has column headers</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle this if your first row contains column names
                </p>
              </div>
              <Switch
                id="has-headers"
                checked={hasHeaders}
                onCheckedChange={setHasHeaders}
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Data Preview</Label>
              <div className="border rounded-md p-3 bg-muted/50">
                <div className="text-sm font-medium mb-2">
                  {hasHeaders ? 'Column Headers:' : 'First Row Data:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {(hasHeaders ? tempFileData.columns : tempFileData.firstRowData).slice(0, 6).map((item: string, index: number) => (
                    <div key={index} className="bg-background rounded px-2 py-1 border">
                      {hasHeaders ? item : `Column ${index + 1}: ${item}`}
                    </div>
                  ))}
                  {(hasHeaders ? tempFileData.columns : tempFileData.firstRowData).length > 6 && (
                    <div className="text-muted-foreground px-2 py-1">
                      +
                      {(hasHeaders ? tempFileData.columns : tempFileData.firstRowData).length - 6}
                      {' '}
                      more...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={handleNext} className="w-full">
              Next: Map Columns →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Best Practices */}
      {!showSheetSelection && !showHeaderConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>ℹ️</span>
              <span>Best Practice</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Ensure your data includes CACS values and basic cardiovascular risk
              factors for all subjects.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>
                Include all required fields: CACS, age, gender, cholesterol
                levels, blood pressure, smoking status, diabetes, and BP
                medication
              </li>
              <li>Use consistent units for cholesterol measurements</li>
              <li>Binary fields should use 0/1 values</li>
              <li>
                Remove any identifying information to protect patient privacy
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
