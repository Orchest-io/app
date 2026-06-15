import { useQuery } from '@tanstack/react-query';
import { checkAiUsageLimit } from '../api/ai.api';

/**
 * Hook to get user's AI usage statistics
 * Returns: used, limit, canUse, resetsAt
 */
export const useAiUsage = () => {
  return useQuery({
    queryKey: ['ai-usage'],
    queryFn: checkAiUsageLimit,
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
};
