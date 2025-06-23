"use client";

import { useState, useEffect } from "react";
import { ReactGrid, Column, Row, CellChange, Cell } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/stores/dataStore";
import { useFormStore } from "@/lib/stores/formStore";
import { EthnicityMapping } from "@/types/data";

// Define option types for ReactGrid dropdowns
type OptionType = {
  label: string;
  value: string;
};

interface DropdownCell extends Cell {
  type: "dropdown";
  selectedValue?: string;
  values: OptionType[];
  isDisabled?: boolean;
  isOpen?: boolean;
  inputValue?: string;
}

const ASCVD_OPTIONS: OptionType[] = [
  { value: "white", label: "White" },
  { value: "african-american", label: "African American" },
  { value: "other", label: "Other" },
];

const MESA_OPTIONS: OptionType[] = [
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
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);

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

      // Setup ReactGrid columns
      const gridColumns: Column[] = [
        { columnId: "ethnicity", width: 200 },
        { columnId: "ascvd", width: 200 },
        { columnId: "mesa", width: 200 },
      ];
      setColumns(gridColumns);

      // Setup ReactGrid rows
      const headerRow: Row = {
        rowId: "header",
        cells: [
          { type: "header", text: "Your Data" },
          { type: "header", text: "ACC/AHA ASCVD" },
          { type: "header", text: "MESA" },
        ],
      };

      const dataRows: Row[] = unique.map((ethnicity) => ({
        rowId: ethnicity, // Use ethnicity as rowId for easier mapping
        cells: [
          { type: "text", text: ethnicity },
          {
            type: "dropdown",
            selectedValue: initialMappings[ethnicity].ascvd,
            values: ASCVD_OPTIONS,
          } as DropdownCell,
          {
            type: "dropdown",
            selectedValue: initialMappings[ethnicity].mesa,
            values: MESA_OPTIONS,
          } as DropdownCell,
        ],
      }));

      setRows([headerRow, ...dataRows]);
    }
  }, [uploadedFile, hasEthnicityColumn, columnMappings]);

  // Handle changes from ReactGrid
  const handleChanges = (changes: CellChange[]) => {
    changes.forEach((change) => {
      if (change.type !== 'dropdown') return;
      
      const ethnicity = change.rowId as string;
      const columnId = change.columnId as string;
      const newValue = (change.newCell as DropdownCell).selectedValue;

      if (columnId === "ascvd" && newValue) {
        setMappings((prev) => ({
          ...prev,
          [ethnicity]: {
            ...prev[ethnicity],
            ascvd: newValue as 'white' | 'african-american' | 'other',
          },
        }));
      } else if (columnId === "mesa" && newValue) {
        setMappings((prev) => ({
          ...prev,
          [ethnicity]: {
            ...prev[ethnicity],
            mesa: newValue as 'white' | 'african-american' | 'chinese' | 'hispanic',
          },
        }));
      }
    });
  };

  // Skip this step if no ethnicity column is mapped
  useEffect(() => {
    if (!hasEthnicityColumn) {
      completeStep(3);
      nextStep();
    }
  }, [hasEthnicityColumn, completeStep, nextStep]);

  if (!hasEthnicityColumn) {
    return null;
  }

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

      {/* Mapping Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Ethnicity Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <ReactGrid
              rows={rows}
              columns={columns}
              onCellsChanged={handleChanges}
            />
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
