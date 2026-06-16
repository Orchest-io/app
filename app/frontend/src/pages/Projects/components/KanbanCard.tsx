import { Draggable } from '@hello-pangea/dnd'
import { useTranslation } from 'react-i18next'
import type { Task, TaskPriority } from '../types/kanban.types'

const MILESTONE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
]

interface KanbanCardProps {
  task: Task
  index: number
  onClick: (task: Task) => void
  milestones?: any[]
  milestoneColors?: string[]
}

export default function KanbanCard({ task, index, onClick, milestones = [], milestoneColors = MILESTONE_COLORS }: KanbanCardProps) {
  const { t } = useTranslation()

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'medium':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return t('projects.priorityHigh')
      case 'medium': return t('projects.priorityMedium')
      default: return t('projects.priorityLow')
    }
  }

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length

  // Resolve milestone color
  const getMilestoneColor = () => {
    if (!task.milestone) return null
    if (task.milestone.color) return task.milestone.color
    const idx = milestones.findIndex((ms) => ms.id === task.milestoneId)
    return milestoneColors[idx >= 0 ? idx % milestoneColors.length : 0]
  }

  const milestoneColor = getMilestoneColor()

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-surface-container-low border hover:border-white/20 rounded-xl p-4 transition-all duration-200 cursor-pointer group relative flex flex-col gap-3 shadow-md overflow-hidden h-[160px] shrink-0 ${
            snapshot.isDragging
              ? 'border-electric-blue/40 shadow-xl bg-surface-container-high scale-[1.02]'
              : 'border-white/5'
          }`}
        >
          {/* Milestone accent bar */}
          {milestoneColor && (
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: milestoneColor }}
            />
          )}

          {/* Drag Handle Overlay Indicator */}
          <div className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
          </div>

          {/* Card Badges row */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>

            {/* Milestone badge */}
            {task.milestone && milestoneColor && (
              <span
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${milestoneColor}20`,
                  color: milestoneColor,
                  border: `1px solid ${milestoneColor}40`,
                }}
              >
                <span className="material-symbols-outlined text-[11px]">flag</span>
                {task.milestone.title}
              </span>
            )}
          </div>

          {/* Title and Short Description */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-on-surface group-hover:text-electric-blue transition-colors line-clamp-1">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-on-surface-variant/80 mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Card Footer: Assignees, Subtasks & Due Date */}
          <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5 gap-2">
            {/* Left elements */}
            <div className="flex items-center gap-3">
              {/* Assignees */}
              {task.assignees.length > 0 && (
                <div className="flex -space-x-1.5 overflow-hidden">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    assignee.avatarUrl ? (
                      <img
                        key={assignee.id}
                        src={assignee.avatarUrl}
                        alt={assignee.name}
                        title={assignee.name}
                        className="w-5.5 h-5.5 rounded-full border border-surface-container-low object-cover shrink-0"
                      />
                    ) : (
                      <div
                        key={assignee.id}
                        title={assignee.name}
                        className="w-5.5 h-5.5 rounded-full border border-surface-container-low bg-electric-blue/10 text-electric-blue flex items-center justify-center text-[9px] font-bold shrink-0"
                      >
                        {assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="w-5.5 h-5.5 rounded-full border border-surface-container-low bg-white/5 text-[9px] font-bold text-on-surface flex items-center justify-center shrink-0">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Subtasks Count */}
              {totalSubtasks > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-[14px]">checklist</span>
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </span>
              )}
            </div>

            {/* Right element: Due Date Tag & Story Points */}
            <div className="flex items-center gap-2 shrink-0">
              {task.storyPoints && (
                <span className="flex items-center justify-center bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/5 shadow-sm">
                  {task.storyPoints} SP
                </span>
              )}
              {task.dueDate && (
                <span className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium shrink-0">
                  <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                  <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
