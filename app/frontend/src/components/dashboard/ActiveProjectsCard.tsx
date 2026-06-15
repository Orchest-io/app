import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Card from '../ui/Card/Card'
import ProjectItem from './ProjectItem'
import type { ProjectListItemDto } from '../../pages/Dashboard/dashboard.types'

interface ActiveProjectsCardProps {
  projects: ProjectListItemDto[]
  isLoading: boolean
  isError: boolean
}

function ProjectSkeleton() {
  return (
    <div className="animate-pulse p-4 rounded-lg bg-surface-container-low border border-border-low">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-container shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-container rounded w-3/5" />
          <div className="h-3 bg-surface-container rounded w-2/5" />
          <div className="h-1.5 bg-surface-container rounded-full w-full mt-3" />
        </div>
      </div>
    </div>
  )
}

export default function ActiveProjectsCard({
  projects,
  isLoading,
  isError,
}: ActiveProjectsCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const activeProjects = projects.filter(
    (p) =>
      p.status === 'active' ||
      p.status === 'on-track' ||
      p.status === 'at-risk' ||
      p.status === 'planning',
  )

  return (
    <Card className="flex flex-col h-full" padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading text-base font-semibold text-on-surface flex items-center gap-2">
          <span
            className="material-symbols-outlined text-electric-blue text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            tactic
          </span>
          {t('dashboard.activeProjects')}
        </h3>
        <button
          className="text-[11px] font-semibold text-electric-blue hover:text-primary transition-colors cursor-pointer uppercase tracking-wider"
          onClick={() => navigate('/projects')}
        >
          {t('dashboard.viewAll')}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <ProjectSkeleton />
            <ProjectSkeleton />
          </>
        ) : isError ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-[32px] text-error/60 mb-2 block">
              error
            </span>
            <p className="text-sm text-on-surface-variant">{t('dashboard.failedLoadProjects')}</p>
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="text-center py-8">
            <span
              className="material-symbols-outlined text-[40px] text-on-surface-variant/30 mb-2 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              tactic
            </span>
            <p className="text-sm text-on-surface-variant font-medium">{t('dashboard.noActiveProjectsCard')}</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              {t('dashboard.createProjectToStart')}
            </p>
          </div>
        ) : (
          activeProjects.slice(0, 3).map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))
        )}
      </div>
    </Card>
  )
}
