import type {
  AnalyseRequest,
  FileUploadResponse,
} from './types';
import type { AnalysisResponse } from '@/types/analysis';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { rApiClient, supabase } from '@/lib/api/client';

export const useFileUpload = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<FileUploadResponse> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from('data-files')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from('data-files')
        .getPublicUrl(filePath);

      return {
        url: data.publicUrl,
        path: filePath,
      };
    },
  });
};

export const useAnalyse = () => {
  return useMutation({
    mutationFn: async (data: AnalyseRequest): Promise<AnalysisResponse> => {
      const response = await rApiClient.post<AnalysisResponse>('/api/analyse', data);
      return response;
    },
  });
};

// Suspense query for analysis
export const useAnalysisSuspenseQuery = (data: AnalyseRequest) => {
  return useSuspenseQuery({
    queryKey: ['analysis', data.file_url, data.settings],
    queryFn: async (): Promise<AnalysisResponse> => {
      const response = await rApiClient.post<AnalysisResponse>('/api/analyse', data);
      return response;
    },
    staleTime: Infinity, // Don't refetch once we have data
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};
