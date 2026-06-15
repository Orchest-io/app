import { useMemo } from 'react';
import { useProjects } from './useProjects';
import { useRecentActivity } from './useRecentActivity';
import { useNotifications } from './useNotifications';
import { useDashboardStats } from './useDashboardStats';
import type { DashboardStats } from '../pages/Dashboard/dashboard.types';

/**
 * Aggregates all data required by the Dashboard page.
 * Orchestrates existing hooks — does not duplicate any business logic.
 *
 * - apiStats: live data from GET /dashboard/stats (the real backend aggregation)
 * - stats: lightweight client-side fallback derived from the projects cache,
 *          used while apiStats is still loading so the hero renders immediately.
 */
export function useDashboard() {
  const userId = localStorage.getItem('orchest_user_id') ?? undefined;

  const projectsQuery = useProjects();
  const activityQuery = useRecentActivity({ userId });
  const notificationsQuery = useNotifications(1, 10);
  const statsQuery = useDashboardStats();

  // Client-side derived stats — renders instantly from the projects cache
  const stats = useMemo<DashboardStats>(() => {
    const projects = projectsQuery.data ?? [];

    const activeProjects = projects.filter(
      (p) => p.status === 'active' || p.status === 'on-track' || p.status === 'at-risk',
    ).length;

    const averageProgress =
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / projects.length,
          )
        : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const completedThisWeek = projects.filter(
      (p) =>
        p.status === 'completed' &&
        p.updatedAt &&
        new Date(p.updatedAt) >= oneWeekAgo,
    ).length;

    return {
      totalProjects: projects.length,
      activeProjects,
      averageProgress,
      completedThisWeek,
    };
  }, [projectsQuery.data]);

  return {
    // Projects
    projects: projectsQuery.data ?? [],
    projectsLoading: projectsQuery.isLoading,
    projectsError: projectsQuery.isError,

    // Activity log
    activityLogs: activityQuery.data ?? [],
    activityLoading: activityQuery.isLoading,
    activityError: activityQuery.isError,

    // Notifications
    notifications: notificationsQuery.data?.data ?? [],
    notificationsLoading: notificationsQuery.isLoading,

    // Client-side derived stats (instant, from projects cache)
    stats,

    // Server-side aggregated stats (from GET /dashboard/stats)
    apiStats: statsQuery.data ?? null,
    apiStatsLoading: statsQuery.isLoading,
    apiStatsError: statsQuery.isError,
  };
}
