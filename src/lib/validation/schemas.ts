import { z } from 'zod';

export const requiredFields = [
  {
    key: 'cacs',
    label: 'CACS Score',
    description: 'Coronary Artery Calcium Score',
    required: true,
  },
  {
    key: 'age',
    label: 'Age',
    description: 'Age in years',
    required: true,
  },
  {
    key: 'gender',
    label: 'Gender',
    description: 'Male/Female or 0/1',
    required: true,
  },
  {
    key: 'total_cholesterol',
    label: 'Total Cholesterol',
    description: 'Total cholesterol level',
    required: true,
  },
  {
    key: 'hdl_cholesterol',
    label: 'HDL Cholesterol',
    description: 'HDL cholesterol level',
    required: true,
  },
  {
    key: 'systolic_bp',
    label: 'Systolic BP',
    description: 'Systolic blood pressure',
    required: true,
  },
  {
    key: 'smoking_status',
    label: 'Smoking Status',
    description: 'Current smoking status (0/1)',
    required: true,
  },
  {
    key: 'diabetes_status',
    label: 'Diabetes Status',
    description: 'Diabetes diagnosis (0/1)',
    required: true,
  },
  {
    key: 'bp_medication',
    label: 'BP Medication',
    description: 'Blood pressure medication (0/1)',
    required: true,
  },
];

export const optionalFields = [
  {
    key: 'lipid_medication',
    label: 'Lipid Medication',
    description: 'Lipid-lowering medication (0/1)',
    required: false,
  },
  {
    key: 'family_history_ihd',
    label: 'Family History IHD',
    description: 'Family history of heart disease (0/1)',
    required: false,
  },
  {
    key: 'ethnicity',
    label: 'Ethnicity',
    description: 'Ethnic background',
    required: false,
  },
  {
    key: 'subject_id',
    label: 'Subject ID',
    description: 'Unique subject identifier',
    required: false,
  },
];

export const columnMappingSchema = z.object({
  cacs: z.string().min(1, 'CACS column is required'),
  age: z.string().min(1, 'Age column is required'),
  gender: z.string().min(1, 'Gender column is required'),
  total_cholesterol: z.string().min(1, 'Total cholesterol column is required'),
  hdl_cholesterol: z.string().min(1, 'HDL cholesterol column is required'),
  systolic_bp: z.string().min(1, 'Systolic BP column is required'),
  smoking_status: z.string().min(1, 'Smoking status column is required'),
  diabetes_status: z.string().min(1, 'Diabetes status column is required'),
  bp_medication: z.string().min(1, 'BP medication column is required'),
  lipid_medication: z.string().optional(),
  family_history_ihd: z.string().optional(),
  ethnicity: z.string().optional(),
  subject_id: z.string().optional(),
});
