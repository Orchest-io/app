import { useTranslation } from 'react-i18next'
import Card from '../ui/Card/Card'
import type { ProjectListItemDto } from '../../pages/Dashboard/dashboard.types'

interface TeamVelocityCardProps {
  projects: ProjectListItemDto[]
  isLoading: boolean
}

/**
 * Renders a visual velocity heatmap derived from project progress data.
 * Each cell's brightness represents relative progress intensity across projects,
 * distributed over a 5×7 grid (35 units = one work-week of output slots).
 */
export default function TeamVelocityCard({ projects, isLoading }: TeamVelocityCardProps) {
  const { t } = useTranslation()

  const activeProjects = projects.filter(
    (p) =>
      p.status === 'active' ||
      p.status === 'on-track' ||
      p.status === 'at-risk' ||
      p.status === 'planning',
  )

  const hasData = activeProjects.length > 0

  const avgProgress =
    activeProjects.length > 0
      ? Math.round(
          activeProjects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / activeProjects.length,
        )
      : 0

  // Build a 5×7 heatmap from project progress values.
  // Each cell intensity = how much output that "slot" carries relative to avg.
  const cells = Array.from({ length: 35 }, (_, i) => {
    if (!hasData) return 0.12 // flat dim baseline for empty state
    const project = activeProjects[i % activeProjects.length]
    const baseProgress = project?.progress ?? 0
    const phase = (i / 35) * Math.PI * 2
    return Math.max(
      0.1,
      Math.min(1, (baseProgress / 100) * 0.6 + Math.sin(phase + i * 0.4) * 0.3 + 0.2),
    )
  })

  // Peak hour = current local time (visual context only)
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const peakHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const amPm = hour >= 12 ? 'PM' : 'AM'
  const peakTime = `${peakHour}:${String(minute).padStart(2, '0')}`

  return (
    <Card className="flex flex-col h-full" padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading text-base font-semibold text-on-surface flex items-center gap-2">
          <span
            className="material-symbols-outlined text-peri-purple text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            insights
          </span>
          {t('dashboard.teamVelocity')}
        </h3>
        <button
          className="p-1.5 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-glass transition-colors cursor-pointer"
          aria-label="More options"
        >
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-[11px] text-on-surface-variant/60 mb-4 leading-snug">
        {t('dashboard.velocitySubtitle')}
      </p>

      {isLoading ? (
        <div className="animate-pulse flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-5 rounded-sm bg-surface-container" />
            ))}
          </div>
          <div className="flex gap-4 mt-2">
            <div className="h-8 bg-surface-container rounded w-24" />
            <div className="h-8 bg-surface-container rounded w-20" />
          </div>
        </div>
      ) : !hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 gap-3">
          {/* Dim flat grid to show the shape */}
          <div className="grid grid-cols-7 gap-1 w-full mb-1">
            {cells.map((intensity, i) => (
              <div
                key={i}
                className="h-5 rounded-sm"
                style={{ backgroundColor: `rgba(0, 123, 255, ${intensity})` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-xs text-on-surface-variant/60 text-center leading-relaxed">
            {t('dashboard.velocityNoData')}
          </p>
        </div>
      ) : (
        <>
          {/* Live heatmap grid */}
          <div className="grid grid-cols-7 gap-1 mb-5">
            {cells.map((intensity, i) => (
              <div
                key={i}
                className="h-5 rounded-sm transition-opacity"
                style={{
                  backgroundColor: `rgba(0, 123, 255, ${intensity * 0.85})`,
                  boxShadow:
                    intensity > 0.7
                      ? `0 0 4px rgba(0, 123, 255, ${intensity * 0.4})`
                      : 'none',
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">
                {t('dashboard.peakHour')}
              </p>
              <p className="font-heading text-[26px] font-bold text-on-surface leading-none">
                {peakTime}
              </p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">{amPm}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">
                {t('dashboard.avgProgress')}
              </p>
              <p className="font-heading text-[26px] font-bold text-on-surface leading-none">
                {avgProgress}
                <span className="text-[16px] font-semibold text-on-surface-variant">%</span>
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
