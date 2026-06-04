import { Draggable } from '@hello-pangea/dnd'
import type { Task, TaskPriority } from '../types/kanban.types'

interface KanbanCardProps {
  task: Task
  index: number
  onClick: (task: Task) => void
}

export default function KanbanCard({ task, index, onClick }: KanbanCardProps) {
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

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-surface-container-low border hover:border-white/20 rounded-xl p-4 transition-all duration-200 cursor-pointer group relative flex flex-col gap-3 shadow-md ${
            snapshot.isDragging
              ? 'border-electric-blue/40 shadow-xl bg-surface-container-high scale-[1.02]'
              : 'border-white/5'
          }`}
        >
          {/* Drag Handle Overlay Indicator */}
          <div className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-on-surface-variant/40">
            <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
          </div>

          {/* Card Badges */}
          <div className="flex gap-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
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
            {/* Left elements: Assignees Stack & Subtasks progress */}
            <div className="flex items-center gap-3">
              {/* Assignees */}
              {task.assignees.length > 0 && (
                <div className="flex -space-x-1.5 overflow-hidden">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <img
                      key={assignee.id}
                      src={assignee.avatarUrl}
                      alt={assignee.name}
                      title={assignee.name}
                      className="w-5.5 h-5.5 rounded-full border border-surface-container-low object-cover shrink-0"
                    />
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
                  <span>
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </span>
              )}
            </div>

            {/* Right element: Due Date Tag */}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium shrink-0">
                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
