import { create } from "zustand";
import { DataState } from "./types";
import { UploadedFile, ColumnMapping, EthnicityMapping } from "@/types/data";

const emptyColumnMapping: ColumnMapping = {
  cacs: "",
  age: "",
  gender: "",
  total_cholesterol: "",
  hdl_cholesterol: "",
  systolic_bp: "",
  smoking_status: "",
  diabetes_status: "",
  bp_medication: "",
  lipid_medication: "",
  family_history_ihd: "",
  ethnicity: "",
  subject_id: "",
};

interface DataStore extends DataState {
  autoSuggestionsApplied: boolean;
  setUploadedFile: (file: UploadedFile) => void;
  setColumnMappings: (mappings: ColumnMapping) => void;
  setEthnicityMappings: (mappings: EthnicityMapping) => void;
  setAutoSuggestionsApplied: (applied: boolean) => void;
  clearData: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  uploadedFile: null,
  columnMappings: emptyColumnMapping,
  ethnicityMappings: {},
  hasEthnicityColumn: false,
  autoSuggestionsApplied: false,

  setUploadedFile: (file: UploadedFile) =>
    set({ uploadedFile: file, autoSuggestionsApplied: false }),

  setColumnMappings: (mappings: ColumnMapping) => {
    console.warn("Store setColumnMappings called with:", mappings);
    set(() => ({
      columnMappings: mappings,
      hasEthnicityColumn: "ethnicity" in mappings && !!mappings.ethnicity,
    }));
  },

  setEthnicityMappings: (mappings: EthnicityMapping) =>
    set({ ethnicityMappings: mappings }),

  setAutoSuggestionsApplied: (applied: boolean) =>
    set({ autoSuggestionsApplied: applied }),

  clearData: () =>
    set({
      uploadedFile: null,
      columnMappings: emptyColumnMapping,
      ethnicityMappings: {},
      hasEthnicityColumn: false,
      autoSuggestionsApplied: false,
    }),
}));
