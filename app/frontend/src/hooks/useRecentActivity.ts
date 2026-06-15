import { useQuery } from '@tanstack/react-query';
import { getActivityLogs, type ActivityLogFilters } from '../api/activity-log.api';

/**
 * Fetches the recent activity log for the current user.
 * Cached by ['activity-logs', filters].
 */
export const useRecentActivity = (filters: ActivityLogFilters = {}) =>
  useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => getActivityLogs(filters),
    staleTime: 30_000,
  });
