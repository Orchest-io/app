import { useNavigate } from 'react-router-dom'
import type { ProjectListItemDto } from '@orchest/shared'
import { Card, ProgressBar, Button } from '../../components/ui'
import { useProjects } from '../../hooks/useProjects'
import { useTranslation } from 'react-i18next'

export default function ProjectsList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: projects = [], isLoading, isError, refetch } = useProjects()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'medium':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'active':
        return 'text-electric-blue bg-electric-blue/10 border-electric-blue/20'
      case 'archived':
        return 'text-on-surface-variant bg-surface-glass border-border-low'
      default:
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return t('projects.priorityHigh')
      case 'medium':
        return t('projects.priorityMedium')
      default:
        return t('projects.priorityLow')
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t('projects.statusCompleted')
      case 'active':
        return t('projects.statusActive')
      case 'archived':
        return t('projects.statusArchived')
      default:
        return t('projects.statusPlanning')
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-heading text-[32px] font-semibold text-on-surface">
            {t('projects.workspaceProjects')}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('projects.workspaceProjectsDesc')}
          </p>
        </div>

        <div className="flex gap-3">
          <Button icon="add" onClick={() => navigate('/projects/create')}>
            {t('projects.createProject')}
          </Button>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-surface-container rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-surface-container rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-surface-container rounded w-1/2 mb-6"></div>
              <div className="h-2 bg-surface-container rounded w-full mb-3"></div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-surface-glass border border-border-low flex items-center justify-center text-red-400 mb-4">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">{t('projects.failedLoad')}</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
            {t('projects.failedLoadDesc')}
          </p>
          <Button icon="refresh" onClick={() => refetch()}>
            {t('projects.retry')}
          </Button>
        </Card>
      ) : projects.length === 0 ? (
        <Card className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-surface-glass border border-border-low flex items-center justify-center text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-[32px]">tactic</span>
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">{t('projects.noProjects')}</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
            {t('projects.noProjectsDesc')}
          </p>
          <Button icon="add" onClick={() => navigate('/projects/create')}>
            {t('projects.createProject')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project: ProjectListItemDto) => (
            <Card
              key={project.id}
              hoverable
              onClick={() => navigate(`/projects/${project.id}`)}
              className="flex flex-col h-full justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-heading text-lg font-semibold text-on-surface hover:text-electric-blue transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(project.priority)}`}>
                      {getPriorityLabel(project.priority)}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant mb-6 line-clamp-3 leading-relaxed">
                  {project.description || t('projects.noDescription')}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-on-surface-variant mb-2">
                  <span>{t('projects.progress')}</span>
                  <span className="font-semibold text-on-surface">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} glow className="mb-4" />

                <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2 border-t border-t-border-low">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    {t('projects.viewDetails')}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
