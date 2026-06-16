
import { useDashboard } from '../../hooks/useDashboard'
import { useMe } from '../../hooks/useSettings'
import DashboardHero from '../../components/dashboard/DashboardHero'
import ActiveProjectsCard from '../../components/dashboard/ActiveProjectsCard'
import TeamVelocityCard from '../../components/dashboard/TeamVelocityCard'
import RecentActivityCard from '../../components/dashboard/RecentActivityCard'
import AiCopilotPanel from '../../components/dashboard/AiCopilotPanel'

/**
 * Main Dashboard page.
 *
 * Layout:
 * ┌─────────────────────────────────┬──────────────────┐
 * │         Hero (full width)       │                  │
 * ├──────────────────┬──────────────┤   AI Copilot     │
 * │  Active Projects │ Team Velocity│   Panel          │
 * ├──────────────────┴──────────────┤                  │
 * │         Recent Activity         │                  │
 * └─────────────────────────────────┴──────────────────┘
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
    <div className="max-w-[1400px] mx-auto">
      <div className="flex gap-6 items-start">
        {/* ── Main content column ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <DashboardHero
            userName={userName}
            stats={stats}
            apiStats={apiStats}
            isLoading={projectsLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <ActiveProjectsCard
                projects={projects}
                isLoading={projectsLoading}
                isError={projectsError}
              />
            </div>
            <div className="lg:col-span-2">
              <TeamVelocityCard
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

        {/* ── AI Copilot panel — sticky sidebar (xl+) ───────────────────── */}
        <div className="hidden xl:flex w-[320px] shrink-0 sticky top-[80px] h-[calc(100vh-104px)]">
          <AiCopilotPanel projects={projects} />
        </div>
      </div>

      {/* AI Copilot — full width on smaller screens */}
      <div className="xl:hidden mt-6">
        <div className="h-[480px]">
          <AiCopilotPanel projects={projects} />
        </div>
      </div>
    </div>
  )
}

