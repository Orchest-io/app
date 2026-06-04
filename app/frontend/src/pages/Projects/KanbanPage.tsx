import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import type { Task, BoardState, FilterState, Assignee, TaskPriority } from './types/kanban.types'
import TaskFilters from './components/TaskFilters'
import KanbanColumn from './components/KanbanColumn'
import TaskDetails from './components/TaskDetails'

// Mock Project database (using localStorage to persist edits if needed)
const MOCK_ASSIGNEES: Assignee[] = [
  {
    id: 'usr-1',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALpmsdD7t0NrCz_QXEtc-LUS5jbLdsULNVMiZga-7Xp-fqeE4sqk8Fcfw5LWA272Vrt1lO0xZYM6WLHggUMcOLyuqHmAVEGiJqis1_F8_K3oepyO5qnhZjZtVxOTCh4J5Lvcen_t-yspdK1RQc4LB35bO3ws2bcKw7RBY--Wr2w_5cZlZ5TTsCdiWMPBXFzF0siJSyX_Rch5_elALklA5njkBf8DvBO7C-4Hn1QDXTN4x1YA2YGknrfQaTKVWNGI3jqiSBxv1CmCM',
  },
  {
    id: 'usr-2',
    name: 'Mike Miller',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7x4ZNNxFeNakinswqwULq5s6IhJZcMAwix5S9ikA_hRUo4C73b47pdyXaIAt4AW3v5xeNTTL18GRRPAONg1SLqBs0i6PdjvOhBGKKmLZ_wh4I3GkiFYkizZjEjxuxlc4RCe4jVbjP3DjumdMOMQHoS5-9fkqKcr2BSLmWyNjOpjTTWZY607wG5Kqq_q26yIt1fvnuNq1YZg-uVpYaNd1P6OAhe6PSwZHlYvn80Z1EpMkyZxAtmQeSRKNM31YUZMocQe5bKiwgdos',
  },
  {
    id: 'usr-3',
    name: 'Dave Patterson',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCajyKtSik1ULTk31XhB0OimvkxFfjIE_xJt_Bq46zUh4B0OLWcskZ_zRfOEjTlDD1wvn3-35vudxAkkRXsdZxUB0NYDA7CdubGChgP3KZUFDRVV7_KiKP15j80cwhJiumAnFaO8LAMJT1GZxcIDqNcenQlKP0vd7ZJ9xPLXmHKmRVsAnEWgry1kuBb1WLqX1x7tNPhaESPayYsHuVew2ggeByAMlHWIucpQX6IqUwGFCHYeljA7Fjsf3VvRGp6v8O2rpOF64KIudQ',
  },
  {
    id: 'usr-4',
    name: 'Anna Watson',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo7XjbN4cTvjy_kuz-1Pjc_q8RdNYpDovlQtv0xZFx7TRbmdKApWFdpGPNBek1iDMi-42vdlIejNwhJvmeIcPG1mC2We9ODKSno4pDg_W1bF1dkA8JXw2qrkReSB8EYk6KyPjhsiwoq9tC3plffPQeGvz3Kp-U6n9EgakEdvUbZbwPc40BVIY176Og9Ee9Ae_s8HRW8UyBr5T33gbPNTCrBKOz4KxRqiiEo9VT7fiU9LQm7uqvx6oDJTzHUfRSwZ52TSktQ7jTenw',
  },
]

const INITIAL_BOARD_STATE: BoardState = {
  tasks: {
    'tsk-1': {
      id: 'tsk-1',
      projectId: 'default',
      title: "Refactor authentication service for OAuth 2.1",
      description: "Migrate existing logic to the new security standards including PKCE validation.",
      priority: 'high',
      assignees: [MOCK_ASSIGNEES[0], MOCK_ASSIGNEES[1]],
      subtasks: [
        { id: 'sub-1', title: 'Establish handshake protocol for secure tunneling', completed: true },
        { id: 'sub-2', title: 'Implement Redis adapter for horizontal scaling', completed: false },
      ],
      dueDate: '2026-06-12',
      columnId: 'col-backlog',
    },
    'tsk-2': {
      id: 'tsk-2',
      projectId: 'default',
      title: "CSS Grid alignment issues in Safari",
      description: "Fix visual alignment issues on Safari browser related to card headers.",
      priority: 'low',
      assignees: [MOCK_ASSIGNEES[2]],
      subtasks: [],
      dueDate: '2026-06-20',
      columnId: 'col-backlog',
    },
    'tsk-3': {
      id: 'tsk-3',
      projectId: 'default',
      title: "Database Migration: PostgreSQL Cluster Upgrade",
      description: "Upgrade Postgres database clusters from v14 to v16 with minimal downtime.",
      priority: 'high',
      assignees: [MOCK_ASSIGNEES[3]],
      subtasks: [
        { id: 'sub-3', title: 'Setup replication logs backup', completed: true },
      ],
      dueDate: '2026-06-08',
      columnId: 'col-todo',
    },
    'tsk-4': {
      id: 'tsk-4',
      projectId: 'default',
      title: "Integrating LLM for Smart Team Tagging",
      description: "Create standard service calling the internal API for matching skills with task tagging requests.",
      priority: 'medium',
      assignees: [MOCK_ASSIGNEES[0]],
      subtasks: [
        { id: 'sub-4', title: 'Write unit tests for tags matching', completed: false },
      ],
      dueDate: '2026-06-15',
      columnId: 'col-in-progress',
    },
    'tsk-5': {
      id: 'tsk-5',
      projectId: 'default',
      title: "Final UI Review for Mobile Dashboard",
      description: "Verify elements paddings and text hierarchies for portrait displays.",
      priority: 'medium',
      assignees: [MOCK_ASSIGNEES[1], MOCK_ASSIGNEES[2]],
      subtasks: [],
      dueDate: '2026-06-10',
      columnId: 'col-review',
    },
    'tsk-6': {
      id: 'tsk-6',
      projectId: 'default',
      title: "Setup CI/CD Pipeline",
      description: "Configure GitHub actions workflow to automate test runs and deployment stages.",
      priority: 'high',
      assignees: [MOCK_ASSIGNEES[3]],
      subtasks: [
        { id: 'sub-5', title: 'Setup dev staging env triggers', completed: true },
      ],
      dueDate: '2026-06-03',
      columnId: 'col-done',
    },
  },
  columns: {
    'col-backlog': {
      id: 'col-backlog',
      title: 'Backlog',
      taskIds: ['tsk-1', 'tsk-2'],
    },
    'col-todo': {
      id: 'col-todo',
      title: 'To Do',
      taskIds: ['tsk-3'],
    },
    'col-in-progress': {
      id: 'col-in-progress',
      title: 'In Progress',
      taskIds: ['tsk-4'],
    },
    'col-review': {
      id: 'col-review',
      title: 'Review',
      taskIds: ['tsk-5'],
    },
    'col-done': {
      id: 'col-done',
      title: 'Done',
      taskIds: ['tsk-6'],
    },
  },
  columnOrder: ['col-backlog', 'col-todo', 'col-in-progress', 'col-review', 'col-done'],
}

export default function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  // State Management
  const [board, setBoard] = useState<BoardState>(() => {
    const saved = localStorage.getItem(`kanban_board_${projectId || 'default'}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved board state, fallback to initial.', e)
      }
    }
    return INITIAL_BOARD_STATE
  })

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    priority: 'all',
  })

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [targetColumnId, setTargetColumnId] = useState('')
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigneeIds: [] as string[],
    dueDate: '',
  })

  // Save board to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(`kanban_board_${projectId || 'default'}`, JSON.stringify(board))
  }, [board, projectId])

  // Get active selected task with fresh data
  const activeTask = selectedTask ? board.tasks[selectedTask.id] || null : null

  // Handle Drag & Drop Callback
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const sourceCol = board.columns[source.droppableId]
    const destCol = board.columns[destination.droppableId]

    // Tasks list inside target columns based on filters
    const getFilteredTasksForCol = (colId: string) => {
      const colTaskIds = board.columns[colId].taskIds
      return colTaskIds
        .map((tid) => board.tasks[tid])
        .filter((task) => {
          const matchesSearch = task.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
          const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
          return matchesSearch && matchesPriority
        })
    }

    const destFiltered = getFilteredTasksForCol(destination.droppableId)

    // Moving tasks in board
    const newColumns = { ...board.columns }

    // 1. Remove task ID from the source column taskIds array
    const newSourceTaskIds = [...sourceCol.taskIds]
    const taskIndexInSource = newSourceTaskIds.indexOf(draggableId)
    if (taskIndexInSource !== -1) {
      newSourceTaskIds.splice(taskIndexInSource, 1)
    }

    // 2. Insert task ID into the destination column taskIds array
    const newDestTaskIds = source.droppableId === destination.droppableId ? newSourceTaskIds : [...destCol.taskIds]

    // Determine target index based on filtered views
    let targetIndex = destination.index

    if (filters.searchQuery || filters.priority !== 'all') {
      // Find the item currently at targetIndex in the filtered list
      const targetItem = destFiltered[destination.index]

      if (targetItem) {
        // Find index of that target item in the updated target column list
        const origIndex = newDestTaskIds.indexOf(targetItem.id)
        targetIndex = origIndex >= 0 ? origIndex : destination.index
      } else {
        // If dropped after all filtered items, append to end
        targetIndex = newDestTaskIds.length
      }
    }

    newDestTaskIds.splice(targetIndex, 0, draggableId)

    // Update column state
    newColumns[source.droppableId] = {
      ...sourceCol,
      taskIds: newSourceTaskIds,
    }

    newColumns[destination.droppableId] = {
      ...destCol,
      taskIds: newDestTaskIds,
    }

    // Update individual task's columnId
    const updatedTask = {
      ...board.tasks[draggableId],
      columnId: destination.droppableId,
    }

    setBoard({
      ...board,
      tasks: {
        ...board.tasks,
        [draggableId]: updatedTask,
      },
      columns: newColumns,
    })
  }

  // Update Task Info (Called from TaskDetails)
  const handleUpdateTask = (updatedTask: Task) => {
    setBoard({
      ...board,
      tasks: {
        ...board.tasks,
        [updatedTask.id]: updatedTask,
      },
    })
  }

  // Trigger Add Task Dialog
  const handleOpenAddTask = (columnId: string) => {
    setTargetColumnId(columnId)
    setNewTaskData({
      title: '',
      description: '',
      priority: 'medium',
      assigneeIds: [],
      dueDate: '',
    })
    setIsAddModalOpen(true)
  }

  // Create Task Form Submit
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskData.title.trim()) return

    const newTaskId = `tsk-${Date.now()}`
    const assignees = MOCK_ASSIGNEES.filter((a) => newTaskData.assigneeIds.includes(a.id))

    const newTask: Task = {
      id: newTaskId,
      projectId: projectId || 'default',
      title: newTaskData.title.trim(),
      description: newTaskData.description.trim(),
      priority: newTaskData.priority,
      assignees,
      subtasks: [],
      dueDate: newTaskData.dueDate || undefined,
      columnId: targetColumnId,
    }

    setBoard({
      ...board,
      tasks: {
        ...board.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...board.columns,
        [targetColumnId]: {
          ...board.columns[targetColumnId],
          taskIds: [...board.columns[targetColumnId].taskIds, newTaskId],
        },
      },
    })

    setIsAddModalOpen(false)
  }

  // Toggle Assignee Selection in Modal
  const handleToggleAssignee = (id: string) => {
    const ids = newTaskData.assigneeIds.includes(id)
      ? newTaskData.assigneeIds.filter((aid) => aid !== id)
      : [...newTaskData.assigneeIds, id]
    setNewTaskData({ ...newTaskData, assigneeIds: ids })
  }

  // Filter Tasks Map
  const filteredTasksByColumn: Record<string, Task[]> = {}
  board.columnOrder.forEach((colId) => {
    const colTaskIds = board.columns[colId].taskIds
    filteredTasksByColumn[colId] = colTaskIds
      .map((tid) => board.tasks[tid])
      .filter((task) => {
        if (!task) return false
        const matchesSearch = task.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
        const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
        return matchesSearch && matchesPriority
      })
  })

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Board Navigation Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate(`/projects/${projectId || ''}`)}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface mb-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Project Details
          </button>
          <h2 className="font-heading text-2xl font-semibold text-on-surface">
            Task Board
          </h2>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full min-w-max">
            {board.columnOrder.map((colId) => {
              const column = board.columns[colId]
              const tasksInCol = filteredTasksByColumn[colId] || []
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksInCol}
                  onCardClick={setSelectedTask}
                  onAddTask={handleOpenAddTask}
                />
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Task Details Side Drawer */}
      <TaskDetails
        task={activeTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
      />

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="font-heading text-lg font-semibold text-on-surface mb-4">
              Add New Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Task description..."
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
                    className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                    className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                  />
                </div>
              </div>

              {/* Assignees Selection */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Assign To
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {MOCK_ASSIGNEES.map((assignee) => {
                    const isSelected = newTaskData.assigneeIds.includes(assignee.id)
                    return (
                      <div
                        key={assignee.id}
                        onClick={() => handleToggleAssignee(assignee.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'bg-electric-blue/10 border-electric-blue text-on-surface'
                            : 'bg-surface-container-low border-white/5 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <img
                          src={assignee.avatarUrl}
                          alt={assignee.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs truncate">{assignee.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-electric-blue text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
