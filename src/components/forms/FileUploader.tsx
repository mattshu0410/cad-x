"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFileUpload } from "@/lib/queries/mutations";
import { useDataStore } from "@/lib/stores/dataStore";
import { useFormStore } from "@/lib/stores/formStore";
import { parseFile } from "@/lib/utils/fileParser";

const ACCEPTED_FILE_TYPES = [".csv", ".xlsx", ".xls"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { mutate: uploadFile, isPending } = useFileUpload();
  const { setUploadedFile } = useDataStore();
  const { nextStep, completeStep } = useFormStore();

  const handleFile = useCallback(
    (file: File) => {
      // Validate file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
        alert("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert("File size must be less than 50MB");
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
            // Parse file to extract columns and preview data
            const { columns, preview } = await parseFile(file);

            setUploadProgress(100);
            setUploadedFile({
              name: file.name,
              url: response.url,
              columns,
              preview,
              size: file.size,
            });

            completeStep(1);
            setTimeout(() => nextStep(), 1000);
          } catch (error) {
            clearInterval(progressInterval);
            setUploadProgress(0);
            alert("Failed to parse file: " + (error as Error).message);
          }
        },
        onError: (error) => {
          clearInterval(progressInterval);
          setUploadProgress(0);
          alert("Upload failed: " + error.message);
        },
      });
    },
    [uploadFile, setUploadedFile, completeStep, nextStep]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Area */}
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
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
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
                  or{" "}
                  <Label
                    htmlFor="file-upload"
                    className="text-primary cursor-pointer hover:underline"
                  >
                    browse files
                  </Label>{" "}
                  to upload
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ACCEPTED_FILE_TYPES.map((type) => (
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
              accept={ACCEPTED_FILE_TYPES.join(",")}
              onChange={handleInputChange}
              disabled={isPending}
            />
          </div>

          {/* Upload Progress */}
          {isPending && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Practices */}
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
    </div>
  );
}
