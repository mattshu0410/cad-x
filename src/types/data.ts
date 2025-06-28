export type UploadedFile = {
  name: string;
  url: string;
  columns: string[];
  preview: Record<string, unknown>[];
  size: number;
  hasHeaders: boolean;
  firstRowData: string[];
};

export type ColumnMapping = {
  cacs: string;
  age: string;
  gender: string;
  total_cholesterol: string;
  hdl_cholesterol: string;
  systolic_bp: string;
  smoking_status: string;
  diabetes_status: string;
  bp_medication: string;
  lipid_medication?: string;
  family_history_ihd?: string;
  ethnicity?: string;
  subject_id?: string;
};

export type RequiredField = {
  key: string;
  label: string;
  description: string;
  required: boolean;
};

export type EthnicityMapping = {
  [ethnicityValue: string]: {
    ascvd: 'white' | 'aa' | 'other';
    mesa: 'white' | 'aa' | 'chinese' | 'hispanic';
  };
};

export type DataRow = {
  [key: string]: unknown;
  // Core required fields
  cacs?: number;
  age?: number;
  gender?: string;
  total_cholesterol?: number;
  hdl_cholesterol?: number;
  systolic_bp?: number;
  smoking_status?: number;
  diabetes_status?: number;
  bp_medication?: number;
  // Optional fields
  lipid_medication?: number;
  family_history_ihd?: number;
  ethnicity?: string;
  subject_id?: string;
};
