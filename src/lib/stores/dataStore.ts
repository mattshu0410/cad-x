import type { DataState } from './types';
import type { ColumnMapping, EthnicityMapping, UploadedFile } from '@/types/data';
import { create } from 'zustand';

const emptyColumnMapping: ColumnMapping = {
  cacs: '',
  age: '',
  gender: '',
  total_cholesterol: '',
  hdl_cholesterol: '',
  systolic_bp: '',
  smoking_status: '',
  diabetes_status: '',
  bp_medication: '',
  lipid_medication: '',
  family_history_ihd: '',
  ethnicity: '',
  subject_id: '',
};

type DataStore = {
  autoSuggestionsApplied: boolean;
  setUploadedFile: (file: UploadedFile) => void;
  setColumnMappings: (mappings: ColumnMapping) => void;
  setEthnicityMappings: (mappings: EthnicityMapping) => void;
  setAutoSuggestionsApplied: (applied: boolean) => void;
  setHasHeaders: (hasHeaders: boolean) => void;
  clearData: () => void;
} & DataState;

export const useDataStore = create<DataStore>(set => ({
  uploadedFile: null,
  columnMappings: emptyColumnMapping,
  ethnicityMappings: {},
  hasEthnicityColumn: false,
  hasHeaders: true,
  autoSuggestionsApplied: false,

  setUploadedFile: (file: UploadedFile) =>
    set({ uploadedFile: file, hasHeaders: file.hasHeaders, autoSuggestionsApplied: false }),

  setColumnMappings: (mappings: ColumnMapping) => {
    console.warn('Store setColumnMappings called with:', mappings);
    set(() => ({
      columnMappings: mappings,
      hasEthnicityColumn: 'ethnicity' in mappings && !!mappings.ethnicity,
    }));
  },

  setEthnicityMappings: (mappings: EthnicityMapping) =>
    set({ ethnicityMappings: mappings }),

  setAutoSuggestionsApplied: (applied: boolean) =>
    set({ autoSuggestionsApplied: applied }),

  setHasHeaders: (hasHeaders: boolean) =>
    set({ hasHeaders, autoSuggestionsApplied: false }),

  clearData: () =>
    set({
      uploadedFile: null,
      columnMappings: emptyColumnMapping,
      ethnicityMappings: {},
      hasEthnicityColumn: false,
      hasHeaders: true,
      autoSuggestionsApplied: false,
    }),
}));
