import { Droppable } from '@hello-pangea/dnd'
import type { Task, Column } from '../types/kanban.types'
import KanbanCard from './KanbanCard'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onCardClick: (task: Task) => void
  onAddTask: (columnId: string) => void
}

export default function KanbanColumn({ column, tasks, onCardClick, onAddTask }: KanbanColumnProps) {
  return (
    <div className="w-80 flex flex-col gap-4 bg-surface-container/20 border border-white/5 rounded-2xl p-4 shrink-0 h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-bold text-on-surface">
            {column.title}
          </h3>
          <span className="bg-surface-container-high text-on-surface-variant font-mono px-2 py-0.5 rounded text-[10px] font-bold">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="text-on-surface-variant hover:text-electric-blue transition-colors p-1 hover:bg-white/5 rounded-lg"
          title="Add task to column"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      {/* Task List (Droppable Zone) */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-3 overflow-y-auto pr-1 min-h-[150px] transition-colors duration-200 rounded-lg ${
              snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-xl text-center">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-[28px] mb-1">
                  inbox
                </span>
                <p className="text-[11px] text-on-surface-variant/40 font-medium">No tasks here</p>
                <button
                  onClick={() => onAddTask(column.id)}
                  className="mt-2 text-[10px] text-electric-blue hover:underline font-semibold"
                >
                  Create one
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
