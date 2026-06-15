import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/dashboard.api';

/**
 * Fetches aggregated dashboard statistics from GET /api/v1/dashboard/stats.
 * Cached by ['dashboard-stats']. Refreshes every 60 seconds.
 */
export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 60_000,
  });
