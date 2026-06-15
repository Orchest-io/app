import apiClient from './client';
import type { ActivityLog } from '@orchest/shared';

export type { ActivityLog };

export interface ActivityLogFilters {
  userId?: string;
  projectId?: string;
}

export const getActivityLogs = async (
  filters: ActivityLogFilters = {},
): Promise<ActivityLog[]> => {
  const params: Record<string, string> = {};
  if (filters.userId) params['user_id'] = filters.userId;
  if (filters.projectId) params['project_id'] = filters.projectId;

  const response = await apiClient.get<ActivityLog[]>('/activity-logs', { params });
  return response.data;
};
