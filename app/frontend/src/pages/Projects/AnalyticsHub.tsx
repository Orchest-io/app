import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAnalyticsHub } from '../../api/projects.api'
import type { AnalyticsHubProjectDto } from '@orchest/shared'

export default function AnalyticsHub() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<AnalyticsHubProjectDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getAnalyticsHub()
        setProjects(data)
      } catch (error) {
        console.error('Failed to fetch analytics hub:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-surface-container animate-pulse rounded mb-2" />
            <div className="h-5 w-64 bg-surface-container animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container rounded-lg border border-white/5 p-6 animate-pulse"
              >
                <div className="h-12 w-12 bg-surface-container-high rounded-lg mb-4" />
                <div className="h-4 w-20 bg-surface-container-high rounded mb-3" />
                <div className="h-6 w-full bg-surface-container-high rounded mb-2" />
                <div className="h-4 w-24 bg-surface-container-high rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-on-surface mb-2">
              Analytics Hub
            </h1>
            <p className="text-on-surface-variant">
              Select a project to explore metrics
            </p>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
              <span className="material-symbols-outlined text-[32px]">bar_chart</span>
            </div>
            <h2 className="font-heading text-xl font-semibold text-on-surface mb-2">
              No Projects Found
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md">
              You're not a member of any projects yet. Join or create a project to view analytics.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-on-surface mb-2">
            Analytics Hub
          </h1>
          <p className="text-on-surface-variant">
            Select a project to explore metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}/analytics`)}
              className="bg-surface-container rounded-lg border border-white/5 p-6 hover:border-white/10 hover:bg-surface-container-high transition-all cursor-pointer group"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-electric-blue to-primary-container flex items-center justify-center text-white mb-4 shadow-[0_0_15px_rgba(0,123,255,0.3)] group-hover:shadow-[0_0_20px_rgba(0,123,255,0.4)] transition-all">
                <span className="material-symbols-outlined text-[24px]">bar_chart</span>
              </div>

              {/* Role Badge */}
              <div className="mb-3">
                {project.userRole === 'PM' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-900 text-blue-200 border border-blue-700/50">
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    PM
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-600/50">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Member
                  </span>
                )}
              </div>

              {/* Project Title */}
              <h3 className="font-heading text-lg font-semibold text-on-surface mb-2 line-clamp-2">
                {project.title}
              </h3>

              {/* View Link */}
              <div className="flex items-center gap-1 text-sm text-electric-blue group-hover:gap-2 transition-all">
                <span>View Analytics</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
