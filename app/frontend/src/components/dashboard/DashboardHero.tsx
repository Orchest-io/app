import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '../ui/Button/Button'
import type { DashboardStats, DashboardStatsDto } from '../../pages/Dashboard/dashboard.types'

interface DashboardHeroProps {
  userName: string
  /** Client-side derived stats — available immediately from projects cache */
  stats: DashboardStats
  /** Server-side aggregated stats from GET /dashboard/stats — may be null while loading */
  apiStats: DashboardStatsDto | null
  isLoading: boolean
}

export default function DashboardHero({
  userName,
  stats,
  apiStats,
  isLoading,
}: DashboardHeroProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Prefer server stats when available, fall back to client-derived
  const avgProgress = apiStats?.averageProgress ?? stats.averageProgress
  const activeCount = apiStats?.activeProjects ?? stats.activeProjects
  const overdueTasks = apiStats?.overdueTasks ?? 0
  const completedTasks = apiStats?.completedTasks ?? 0
  const totalTasks = apiStats?.totalTasks ?? 0

  const systemStatus =
    avgProgress >= 80
      ? t('dashboard.systemOptimal')
      : avgProgress >= 50
        ? t('dashboard.onTrack')
        : t('dashboard.needsAttention')

  const heroMessage = (() => {
    if (overdueTasks > 0) {
      return t('dashboard.overdueTasks', { count: overdueTasks })
    }
    if (avgProgress >= 80) {
      return t('dashboard.highProgress', { completed: completedTasks, total: totalTasks })
    }
    if (activeCount > 0) {
      return t('dashboard.activeProjectsMsg', { count: activeCount })
    }
    return t('dashboard.noActiveProjects')
  })()

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-low bg-surface-container-lowest p-8 mb-6">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[340px] h-[220px] bg-electric-blue/8 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/2 w-[200px] h-[140px] bg-peri-purple/6 blur-[60px] pointer-events-none rounded-full" />

      {/* Background icon watermark */}
      <div className="absolute top-4 right-8 opacity-5 pointer-events-none select-none">
        <span 
          className="material-symbols-outlined" 
          style={{ fontSize: '240px', fontVariationSettings: "'FILL' 0" }}
        >
          tactic
        </span>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-5 bg-surface-container rounded-full w-28 mb-4" />
            <div className="h-8 bg-surface-container rounded w-2/5 mb-3" />
            <div className="h-4 bg-surface-container rounded w-3/4 mb-6" />
            <div className="flex gap-3">
              <div className="h-10 bg-surface-container rounded-md w-40" />
              <div className="h-10 bg-surface-container rounded-md w-36" />
            </div>
          </div>
        ) : (
          <>
            {/* Status badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[11px] font-heading font-bold uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-pulse" />
              {systemStatus}
            </div>

            <h2 className="font-heading text-[28px] md:text-[34px] font-bold text-on-surface mb-2 leading-tight">
              {t('dashboard.welcomeBack', { name: userName })}
            </h2>

            <p className="text-sm text-on-surface-variant max-w-[540px] leading-relaxed mb-6">
              {heroMessage}
            </p>

            {/* Quick stat pills — only when API stats are available */}
            {apiStats && (
              <div className="flex flex-wrap gap-3">
                <StatPill
                  icon="tactic"
                  label={t('dashboard.statProjects')}
                  value={String(apiStats.totalProjects)}
                  color="text-electric-blue"
                />
                <StatPill
                  icon="task_alt"
                  label={t('dashboard.statTasksDone')}
                  value={`${apiStats.completedTasks}/${apiStats.totalTasks}`}
                  color="text-emerald-400"
                />
                {apiStats.overdueTasks > 0 && (
                  <StatPill
                    icon="schedule"
                    label={t('dashboard.statOverdue')}
                    value={String(apiStats.overdueTasks)}
                    color="text-error"
                  />
                )}
                <StatPill
                  icon="monitoring"
                  label={t('dashboard.statAvgProgress')}
                  value={`${apiStats.averageProgress}%`}
                  color="text-peri-purple"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Internal helper ───────────────────────────────────────────────────────────

interface StatPillProps {
  icon: string
  label: string
  value: string
  color: string
}

function StatPill({ icon, label, value, color }: StatPillProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-border-low">
      <span className={`material-symbols-outlined text-[14px] ${color}`}>{icon}</span>
      <span className="text-xs text-on-surface-variant">{label}</span>
      <span className={`text-xs font-heading font-bold ${color}`}>{value}</span>
    </div>
  )
}
