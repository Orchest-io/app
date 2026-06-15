import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import type { Task, Column, BoardState, FilterState, TaskPriority } from './types/kanban.types'
import TaskFilters from './components/TaskFilters'
import KanbanColumn from './components/KanbanColumn'
import apiClient from '../../api/client'

// Column definitions (fixed structure)
const COLUMNS: Record<string, Column> = {
  'backlog': { id: 'backlog', title: 'Backlog', taskIds: [] },
  'todo': { id: 'todo', title: 'To Do', taskIds: [] },
  'in-progress': { id: 'in-progress', title: 'In Progress', taskIds: [] },
  'review': { id: 'review', title: 'Review', taskIds: [] },
  'done': { id: 'done', title: 'Done', taskIds: [] },
}

const COLUMN_ORDER = ['backlog', 'todo', 'in-progress', 'review', 'done']

export default function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  // State Management
  const [board, setBoard] = useState<BoardState>({
    tasks: {},
    columns: COLUMNS,
    columnOrder: COLUMN_ORDER,
  })

  const [loading, setLoading] = useState(true)
  const [projectMembers, setProjectMembers] = useState<any[]>([])

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    priority: 'all',
  })

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [targetColumnId, setTargetColumnId] = useState('')
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
    assigneeId: '', // Add assignee field
  })

  // Fetch tasks from backend
  useEffect(() => {
    if (!projectId) return

    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/tasks/board/${projectId}`)
        const tasksFromAPI = response.data

        // Transform API response to board state
        const tasksMap: Record<string, Task> = {}
        const columnsMap: Record<string, any> = {}

        // Initialize columns with taskIds arrays
        COLUMN_ORDER.forEach(colId => {
          columnsMap[colId] = { 
            id: colId, 
            title: COLUMNS[colId].title,
            taskIds: [] 
          }
        })

        // Map tasks to board structure
        tasksFromAPI.forEach((apiTask: any) => {
          const task: Task = {
            id: apiTask.id,
            projectId: apiTask.projectId,
            title: apiTask.title,
            description: apiTask.description || '',
            priority: apiTask.priority || 'medium',
            assignees: apiTask.assignees?.map((a: any) => ({
              id: a.userId,
              name: a.user?.name || 'Unknown',
              avatarUrl: a.user?.avatarUrl || '',
            })) || [],
            subtasks: apiTask.subtasks?.map((s: any) => ({
              id: s.id,
              title: s.title,
              completed: s.isCompleted,
            })) || [],
            dueDate: apiTask.dueDate,
            columnId: apiTask.status || 'backlog',
          }

          tasksMap[task.id] = task
          
          // Add task to appropriate column
          const colId = task.columnId
          if (columnsMap[colId]) {
            columnsMap[colId].taskIds.push(task.id)
          }
        })

        setBoard({
          tasks: tasksMap,
          columns: columnsMap,
          columnOrder: COLUMN_ORDER,
        })
      } catch (error: any) {
        console.error('Failed to fetch tasks:', error)
        if (error?.response?.status === 401) {
          toast.error('Authentication required')
          navigate('/login')
        } else {
          toast.error('Failed to load tasks')
        }
      } finally {
        setLoading(false)
      }
    }

    const fetchProjectMembers = async () => {
      try {
        const response = await apiClient.get(`/projects/${projectId}`)
        setProjectMembers(response.data.members || [])
      } catch (error) {
        console.error('Failed to fetch project members:', error)
      }
    }

    fetchTasks()
    fetchProjectMembers()
  }, [projectId, navigate])

  // Handle Drag & Drop Callback
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const sourceCol = board.columns[source.droppableId]
    const destCol = board.columns[destination.droppableId]

    // Update UI optimistically
    const newColumns = { ...board.columns }
    const newSourceTaskIds = [...sourceCol.taskIds]
    const taskIndexInSource = newSourceTaskIds.indexOf(draggableId)
    
    if (taskIndexInSource !== -1) {
      newSourceTaskIds.splice(taskIndexInSource, 1)
    }

    const newDestTaskIds = source.droppableId === destination.droppableId 
      ? newSourceTaskIds 
      : [...destCol.taskIds]

    newDestTaskIds.splice(destination.index, 0, draggableId)

    newColumns[source.droppableId] = { ...sourceCol, taskIds: newSourceTaskIds }
    newColumns[destination.droppableId] = { ...destCol, taskIds: newDestTaskIds }

    const updatedTask = {
      ...board.tasks[draggableId],
      columnId: destination.droppableId,
    }

    setBoard({
      ...board,
      tasks: { ...board.tasks, [draggableId]: updatedTask },
      columns: newColumns,
    })

    // Update backend
    try {
      await apiClient.patch(`/tasks/${draggableId}`, {
        status: destination.droppableId,
      })
      toast.success('Task moved successfully')
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to move task')
      // Revert on error
      setBoard(board)
    }
  }

  // Trigger Add Task Dialog
  const handleOpenAddTask = (columnId: string) => {
    setTargetColumnId(columnId)
    setNewTaskData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assigneeId: '',
    })
    setIsAddModalOpen(true)
  }

  // Create Task Form Submit
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskData.title.trim() || !projectId) return

    const userId = localStorage.getItem('orchest_user_id')
    if (!userId) {
      toast.error('User not authenticated')
      return
    }

    try {
      const response = await apiClient.post('/tasks', {
        projectId,
        createdBy: userId,
        title: newTaskData.title.trim(),
        description: newTaskData.description.trim(),
        priority: newTaskData.priority,
        status: targetColumnId,
        dueDate: newTaskData.dueDate || null,
      })

      const createdTask = response.data

      // Assign task to user if selected
      if (newTaskData.assigneeId) {
        try {
          await apiClient.post(`/tasks/${createdTask.id}/assignees`, {
            userId: newTaskData.assigneeId,
          })
        } catch (assignError) {
          console.error('Failed to assign task:', assignError)
          toast.warning('Task created but assignment failed')
        }
      }

      const assignedMember = projectMembers.find(m => m.userId === newTaskData.assigneeId)

      const newTask: Task = {
        id: createdTask.id,
        projectId: createdTask.projectId,
        title: createdTask.title,
        description: createdTask.description || '',
        priority: createdTask.priority || 'medium',
        assignees: assignedMember ? [{
          id: assignedMember.userId,
          name: assignedMember.user?.name || 'Unknown',
          avatarUrl: assignedMember.user?.avatarUrl || '',
        }] : [],
        subtasks: [],
        dueDate: createdTask.dueDate,
        columnId: targetColumnId,
      }

      setBoard({
        ...board,
        tasks: { ...board.tasks, [newTask.id]: newTask },
        columns: {
          ...board.columns,
          [targetColumnId]: {
            ...board.columns[targetColumnId],
            taskIds: [...board.columns[targetColumnId].taskIds, newTask.id],
          },
        },
      })

      setIsAddModalOpen(false)
      toast.success('Task created successfully')
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }

  // Filter Tasks Map
  const filteredTasksByColumn: Record<string, Task[]> = {}
  board.columnOrder.forEach((colId) => {
    const colTaskIds = board.columns[colId]?.taskIds || []
    filteredTasksByColumn[colId] = colTaskIds
      .map((tid) => board.tasks[tid])
      .filter((task) => {
        if (!task) return false
        const matchesSearch = task.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
        const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
        return matchesSearch && matchesPriority
      })
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading tasks...</p>
        </div>
      </div>
    )
  }

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
                  onCardClick={(task) => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                  onAddTask={handleOpenAddTask}
                />
              )
            })}
          </div>
        </DragDropContext>
      </div>

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

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Assign To
                </label>
                <select
                  value={newTaskData.assigneeId}
                  onChange={(e) => setNewTaskData({ ...newTaskData, assigneeId: e.target.value })}
                  className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user?.name || 'Unknown'} ({member.role})
                    </option>
                  ))}
                </select>
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
