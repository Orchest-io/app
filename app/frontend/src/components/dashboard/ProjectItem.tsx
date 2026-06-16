import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProgressBar from '../ui/ProgressBar/ProgressBar'
import type { ProjectListItemDto } from '../../pages/Dashboard/dashboard.types'

interface ProjectItemProps {
  project: ProjectListItemDto
}

const STATUS_ICON: Record<string, string> = {
  active: 'rocket_launch',
  'on-track': 'trending_up',
  planning: 'edit_note',
  'at-risk': 'warning',
  delayed: 'schedule',
  completed: 'task_alt',
  archived: 'inventory_2',
}

export default function ProjectItem({ project }: ProjectItemProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const iconName = STATUS_ICON[project.status] ?? 'tactic'

  const memberCount =
    (project as unknown as { members?: unknown[] }).members?.length ?? 0

  const daysRemaining = project.endDate
    ? Math.ceil(
        (new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
    : null

  const getDueLabel = () => {
    if (daysRemaining === null) return t('projects.noDueDate')
    if (daysRemaining > 0) return t('projects.dueIn', { count: daysRemaining })
    if (daysRemaining === 0) return t('projects.dueToday')
    return t('projects.overdueBy', { count: Math.abs(daysRemaining) })
  }

  return (
    <button
      className="w-full text-left p-4 rounded-lg bg-surface-container-low border border-border-low hover:border-electric-blue/30 hover:bg-surface-container transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/projects/${project.id}`)}
      aria-label={`View project ${project.name}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center shrink-0 group-hover:bg-electric-blue/15 transition-colors">
          <span
            className="material-symbols-outlined text-electric-blue text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {iconName}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-heading text-sm font-semibold text-on-surface truncate group-hover:text-electric-blue transition-colors">
              {project.name}
            </p>
            <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-electric-blue/60 text-[16px] shrink-0 transition-colors">
              chevron_right
            </span>
          </div>

          <p className="text-[11px] text-on-surface-variant mb-3">
            {getDueLabel()}
            {memberCount > 0 && ` · ${t('projects.activeMember', { count: memberCount })}`}
          </p>

          <ProgressBar value={project.progress ?? 0} glow />
        </div>
      </div>
    </button>
  )
}
