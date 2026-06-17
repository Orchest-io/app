
import { useDashboard } from '../../hooks/useDashboard'
import { useMe } from '../../hooks/useSettings'
import DashboardHero from '../../components/dashboard/DashboardHero'
import ActiveProjectsCard from '../../components/dashboard/ActiveProjectsCard'
import RecentActivityCard from '../../components/dashboard/RecentActivityCard'
import SmartSuggestionCard from '../../components/dashboard/SmartSuggestionCard'

/**
 * Main Dashboard page.
 *
 * Simplified Layout:
 * ┌─────────────────────────────────────────┐
 * │         Hero (full width)               │
 * ├────────────────────────┬────────────────┤
 * │  Active Projects       │ Smart          │
 * │                        │ Suggestions    │
 * ├────────────────────────┴────────────────┤
 * │         Recent Activity                 │
 * └─────────────────────────────────────────┘
 *
 * Stats source priority:
 *   - apiStats (GET /dashboard/stats) — server-aggregated, most accurate
 *   - stats    (client useMemo)       — instant fallback from projects cache
 */
export default function Dashboard() {
  const {
    projects,
    projectsLoading,
    projectsError,
    activityLogs,
    activityLoading,
    activityError,
    stats,
    apiStats,
  } = useDashboard()

  const { data: me } = useMe()
  const userName = me?.fullName?.split(' ')[0] ?? 'there'

  return (
    <div className="max-w-[1400px] mx-auto pt-6">
      <div className="flex flex-col gap-6">
        <DashboardHero
          userName={userName}
          stats={stats}
          apiStats={apiStats}
          isLoading={projectsLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActiveProjectsCard
              projects={projects}
              isLoading={projectsLoading}
              isError={projectsError}
            />
          </div>
          <div className="lg:col-span-1">
            <SmartSuggestionCard
              projects={projects}
              isLoading={projectsLoading}
            />
          </div>
        </div>

        <RecentActivityCard
          logs={activityLogs}
          isLoading={activityLoading}
          isError={activityError}
        />
      </div>
    </div>
  )
}

