import { create } from 'zustand';
import { DataState } from './types';
import { UploadedFile, ColumnMapping, EthnicityMapping } from '@/types/data';

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

interface DataStore extends DataState {
  setUploadedFile: (file: UploadedFile) => void;
  setColumnMappings: (mappings: ColumnMapping) => void;
  setEthnicityMappings: (mappings: EthnicityMapping) => void;
  clearData: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  uploadedFile: null,
  columnMappings: emptyColumnMapping,
  ethnicityMappings: {},
  hasEthnicityColumn: false,

  setUploadedFile: (file: UploadedFile) => 
    set({ uploadedFile: file }),

  setColumnMappings: (mappings: ColumnMapping) => 
    set(() => ({
      columnMappings: mappings,
      hasEthnicityColumn: 'ethnicity' in mappings && !!mappings.ethnicity
    })),

  setEthnicityMappings: (mappings: EthnicityMapping) => 
    set({ ethnicityMappings: mappings }),

  clearData: () => 
    set({
      uploadedFile: null,
      columnMappings: emptyColumnMapping,
      ethnicityMappings: {},
      hasEthnicityColumn: false
    })
}));