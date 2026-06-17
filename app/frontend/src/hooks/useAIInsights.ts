import { useQuery } from '@tanstack/react-query';
import { getAIDashboardInsights, getAIProjectInsights } from '../api/ai.api';

/**
 * Fetch AI-powered insights for dashboard
 * Cached for 5 minutes to avoid excessive API calls
 */
export const useAIInsights = () => {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: getAIDashboardInsights,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Fetch AI-powered insights for specific project
 */
export const useProjectInsights = (projectId: string) => {
  return useQuery({
    queryKey: ['ai-insights', projectId],
    queryFn: () => getAIProjectInsights(projectId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!projectId,
  });
};
