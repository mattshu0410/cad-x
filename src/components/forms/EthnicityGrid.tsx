"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/lib/stores/dataStore";
import { useFormStore } from "@/lib/stores/formStore";
import { EthnicityMapping } from "@/types/data";

const ASCVD_OPTIONS = [
  { value: "white", label: "White" },
  { value: "african-american", label: "African American" },
  { value: "other", label: "Other" },
];

const MESA_OPTIONS = [
  { value: "white", label: "White" },
  { value: "african-american", label: "African American" },
  { value: "chinese", label: "Chinese" },
  { value: "hispanic", label: "Hispanic" },
];

export function EthnicityGrid() {
  const {
    uploadedFile,
    columnMappings,
    hasEthnicityColumn,
    setEthnicityMappings,
  } = useDataStore();
  const { nextStep, completeStep, previousStep } = useFormStore();
  const [mappings, setMappings] = useState<EthnicityMapping>({});
  const [uniqueEthnicities, setUniqueEthnicities] = useState<string[]>([]);
  const hasSkippedRef = useRef(false);

  useEffect(() => {
    if (uploadedFile && hasEthnicityColumn && columnMappings.ethnicity) {
      // Extract unique ethnicity values from preview data
      const ethnicityColumn = columnMappings.ethnicity;
      const unique = Array.from(
        new Set(
          uploadedFile.preview
            .map((row) => row[ethnicityColumn])
            .filter((val) => val !== null && val !== undefined && val !== "")
            .map((val) => String(val).trim())
        )
      );
      setUniqueEthnicities(unique);

      // Initialize mappings with default values
      const initialMappings: EthnicityMapping = {};
      unique.forEach((ethnicity) => {
        initialMappings[ethnicity] = {
          ascvd: "other",
          mesa: "white",
        };
      });
      setMappings(initialMappings);
    }
  }, [uploadedFile, hasEthnicityColumn, columnMappings]);

  // Skip this step if no ethnicity column is mapped
  useEffect(() => {
    console.warn("hasEthnicityColumn changed to:", hasEthnicityColumn);
    if (!hasEthnicityColumn && !hasSkippedRef.current) {
      console.warn("no ethnicity column, completing step 3");
      hasSkippedRef.current = true;
      completeStep(3);
      nextStep();
    }
  }, [hasEthnicityColumn]);

  if (!hasEthnicityColumn) {
    return null;
  }

  const handleAscvdChange = (ethnicity: string, value: string) => {
    setMappings((prev) => ({
      ...prev,
      [ethnicity]: {
        ...prev[ethnicity],
        ascvd: value as "white" | "african-american" | "other",
      },
    }));
  };

  const handleMesaChange = (ethnicity: string, value: string) => {
    setMappings((prev) => ({
      ...prev,
      [ethnicity]: {
        ...prev[ethnicity],
        mesa: value as "white" | "african-american" | "chinese" | "hispanic",
      },
    }));
  };

  const handleNext = () => {
    setEthnicityMappings(mappings);
    completeStep(3);
    nextStep();
  };

  const isComplete = uniqueEthnicities.every(
    (ethnicity) => mappings[ethnicity]?.ascvd && mappings[ethnicity]?.mesa
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Map Ethnicities to Risk Score Categories</CardTitle>
          <CardDescription>
            Map the ethnicity values in your data to the categories used by
            different risk scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Found {uniqueEthnicities.length} unique ethnicity values in your
            data
          </div>
        </CardContent>
      </Card>

      {/* Mapping Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ethnicity Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg font-medium">
              <div>Your Data</div>
              <div>ACC/AHA ASCVD</div>
              <div>MESA</div>
            </div>

            {/* Data Rows */}
            {uniqueEthnicities.map((ethnicity) => (
              <div
                key={ethnicity}
                className="grid grid-cols-3 gap-4 p-4 border rounded-lg items-center"
              >
                {/* Ethnicity Name */}
                <div className="font-medium text-sm">{ethnicity}</div>

                {/* ASCVD Select */}
                <Select
                  value={mappings[ethnicity]?.ascvd || "other"}
                  onValueChange={(value) => handleAscvdChange(ethnicity, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASCVD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* MESA Select */}
                <Select
                  value={mappings[ethnicity]?.mesa || "white"}
                  onValueChange={(value) => handleMesaChange(ethnicity, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Mapping Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Risk scores were developed and validated on specific populations.
            Consider your cohort demographics when mapping ethnicities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">ACC/AHA ASCVD Categories:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • <strong>White:</strong> Non-Hispanic White
                </li>
                <li>
                  • <strong>African American:</strong> Non-Hispanic Black
                </li>
                <li>
                  • <strong>Other:</strong> All other ethnicities
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">MESA Categories:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • <strong>White:</strong> Non-Hispanic White
                </li>
                <li>
                  • <strong>African American:</strong> Non-Hispanic Black
                </li>
                <li>
                  • <strong>Chinese:</strong> Chinese American
                </li>
                <li>
                  • <strong>Hispanic:</strong> Hispanic/Latino
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={previousStep}>
          ← Previous
        </Button>
        <Button type="button" onClick={handleNext} disabled={!isComplete}>
          Next →
        </Button>
      </div>
    </div>
  );
}
