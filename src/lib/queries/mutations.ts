import { useMutation } from '@tanstack/react-query';
import { supabase, rApiClient } from '@/lib/api/client';
import { useResultsStore } from '@/lib/stores/resultsStore';
import { 
  PrepareDataRequest, 
  AnalyzeRequest, 
  FileUploadResponse, 
  PrepareDataResponse 
} from './types';
import { AnalysisResponse } from '@/types/analysis';

export const useFileUpload = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<FileUploadResponse> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from('data-files')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('data-files')
        .getPublicUrl(filePath);

      return {
        url: data.publicUrl,
        path: filePath
      };
    },
  });
};

export const usePrepareData = () => {
  return useMutation({
    mutationFn: async (data: PrepareDataRequest): Promise<PrepareDataResponse> => {
      return rApiClient.post<PrepareDataResponse>('/api/prepare-data', data);
    },
  });
};

export const useAnalyze = () => {
  const { setResults, setPlots, setSummary, setLoading, setError } = useResultsStore();

  return useMutation({
    mutationFn: async (data: AnalyzeRequest): Promise<AnalysisResponse> => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await rApiClient.post<AnalysisResponse>('/api/analyze', data);
        
        if (response.success) {
          setResults(response.data.results);
          setPlots(response.data.plots);
          setSummary(response.data.summary);
        } else {
          setError(response.error || 'Analysis failed');
        }
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
};