import { useEffect, useState } from 'react'
import { getProjectContextualAnalytics } from '../../../api/projects.api'
import type { ContextualAnalyticsDto } from '@orchest/shared'
import { Card } from '../../../components/ui'

type AnalyticsTabProps = {
  projectId: string
}

export default function AnalyticsTab({ projectId }: AnalyticsTabProps) {
  const [data, setData] = useState<ContextualAnalyticsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getProjectContextualAnalytics(projectId)
        setData(analytics)
      } catch (err: any) {
        console.error('Failed to fetch project analytics:', err)
        if (err.response?.status === 403) {
          setError('You do not have permission to view this project\'s analytics.')
        } else {
          setError('Failed to load analytics data. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [projectId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="h-6 w-48 bg-surface-container-high animate-pulse rounded mb-4" />
          <div className="h-32 bg-surface-container-high animate-pulse rounded" />
        </Card>
        <Card>
          <div className="h-6 w-48 bg-surface-container-high animate-pulse rounded mb-4" />
          <div className="h-48 bg-surface-container-high animate-pulse rounded" />
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mb-4">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h3 className="font-heading text-lg font-bold text-on-surface mb-2">
            {error ? 'Access Denied' : 'Error Loading Analytics'}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            {error || 'Unable to load analytics data.'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Role Badge Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-xl font-semibold text-on-surface">
          Story Points Analytics
        </h3>
        {data.userRole === 'PM' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-900 text-blue-200 border border-blue-700/50">
            <span className="material-symbols-outlined text-[16px]">badge</span>
            Project Manager View
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-neutral-800 text-neutral-300 border border-neutral-600/50">
            <span className="material-symbols-outlined text-[16px]">person</span>
            Team Member View
          </span>
        )}
      </div>

      {/* Conditional Render Based on Role */}
      {data.userRole === 'PM' ? <PMView data={data} /> : <MemberView data={data} />}
    </div>
  )
}

// ─── PM View ────────────────────────────────────────────────────────
type PMViewProps = {
  data: ContextualAnalyticsDto
}

function PMView({ data }: PMViewProps) {
  const { projectSummary, teamWorkload } = data

  return (
    <>
      {/* Project Scope Completion Card */}
      <Card>
        <h3 className="font-heading text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-electric-blue">analytics</span>
          Project Scope Completion
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Stats */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-on-surface">
                {projectSummary.completedPoints}
              </span>
              <span className="text-xl text-on-surface-variant">
                / {projectSummary.totalPoints} SP
              </span>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-on-surface-variant">Remaining: </span>
                <span className="font-semibold text-on-surface">
                  {projectSummary.remainingPoints} SP
                </span>
              </div>
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="flex flex-col justify-center">
            <div className="text-right mb-2">
              <span className="text-3xl font-bold text-electric-blue">
                {projectSummary.completionPercentage.toFixed(0)}%
              </span>
              <span className="text-sm text-on-surface-variant ml-2">Complete</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric-blue to-[#6366f1] rounded-full transition-all duration-500"
                style={{ width: `${projectSummary.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Team Workload Matrix */}
      {teamWorkload && teamWorkload.length > 0 && (
        <Card>
          <h3 className="font-heading text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-blue">groups</span>
            Team Workload Distribution
          </h3>

          <div className="space-y-3">
            {teamWorkload.map((member) => (
              <div
                key={member.userId}
                className="bg-surface-container-high rounded-lg p-4 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue to-primary-container flex items-center justify-center text-white font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-on-surface">{member.name}</div>
                      <div className="text-xs text-on-surface-variant">
                        {member.pointsAssigned} SP assigned
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-on-surface">
                      {member.pointsCompleted} / {member.pointsAssigned}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {member.pointsRemaining} SP remaining
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-electric-blue to-[#6366f1] rounded-full transition-all duration-500"
                    style={{
                      width: `${member.pointsAssigned > 0 ? (member.pointsCompleted / member.pointsAssigned) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}

// ─── Member View ────────────────────────────────────────────────────
type MemberViewProps = {
  data: ContextualAnalyticsDto
}

function MemberView({ data }: MemberViewProps) {
  const { personalSummary, projectSummary } = data

  return (
    <>
      {/* Personal Contribution Progress Card */}
      <Card>
        <h3 className="font-heading text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-electric-blue">person</span>
          My Contribution Progress
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Stats */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-on-surface">
                {personalSummary.myCompletedPoints.toFixed(1)}
              </span>
              <span className="text-xl text-on-surface-variant">
                / {personalSummary.myTotalPoints.toFixed(1)} SP
              </span>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-on-surface-variant">Remaining: </span>
                <span className="font-semibold text-on-surface">
                  {personalSummary.myRemainingPoints.toFixed(1)} SP
                </span>
              </div>
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="flex flex-col justify-center">
            <div className="text-right mb-2">
              <span className="text-3xl font-bold text-electric-blue">
                {personalSummary.myCompletionPercentage.toFixed(0)}%
              </span>
              <span className="text-sm text-on-surface-variant ml-2">Complete</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric-blue to-[#6366f1] rounded-full transition-all duration-500"
                style={{ width: `${personalSummary.myCompletionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Project Overview (Read-only) */}
      <Card>
        <h3 className="font-heading text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-electric-blue">info</span>
          Project Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-high rounded-lg p-4 border border-white/5">
            <div className="text-xs text-on-surface-variant mb-1">Total Points</div>
            <div className="text-2xl font-bold text-on-surface">
              {projectSummary.totalPoints} SP
            </div>
          </div>
          <div className="bg-surface-container-high rounded-lg p-4 border border-white/5">
            <div className="text-xs text-on-surface-variant mb-1">Completed</div>
            <div className="text-2xl font-bold text-electric-blue">
              {projectSummary.completedPoints} SP
            </div>
          </div>
          <div className="bg-surface-container-high rounded-lg p-4 border border-white/5">
            <div className="text-xs text-on-surface-variant mb-1">Remaining</div>
            <div className="text-2xl font-bold text-on-surface">
              {projectSummary.remainingPoints} SP
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
