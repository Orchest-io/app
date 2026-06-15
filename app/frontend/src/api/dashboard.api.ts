import apiClient from './client';

export interface DashboardStatsDto {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProgress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  unreadNotifications: number;
  recentActivityCount: number;
}

export const getDashboardStats = async (): Promise<DashboardStatsDto> => {
  const response = await apiClient.get<DashboardStatsDto>('/dashboard/stats');
  return response.data;
};
