import React, { useState, useEffect } from 'react'
import type { Task, TaskPriority, Subtask } from '../types/kanban.types'

interface TaskDetailsProps {
  task: Task | null
  onClose: () => void
  onUpdateTask: (updatedTask: Task) => void
}

export default function TaskDetails({ task, onClose, onUpdateTask }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPriority, setEditedPriority] = useState<TaskPriority>('medium')
  const [editedDueDate, setEditedDueDate] = useState('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title)
      setEditedDescription(task.description)
      setEditedPriority(task.priority)
      setEditedDueDate(task.dueDate || '')
      setIsEditing(false)
    }
  }, [task])

  if (!task) return null

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    )
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    })
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    }

    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSubtask],
    })
    setNewSubtaskTitle('')
  }

  const handleRemoveSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter((sub) => sub.id !== subtaskId)
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    })
  }

  const handleSave = () => {
    onUpdateTask({
      ...task,
      title: editedTitle,
      description: editedDescription,
      priority: editedPriority,
      dueDate: editedDueDate || undefined,
    })
    setIsEditing(false)
  }

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

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length
  const progressPercentage = task.subtasks.length
    ? Math.round((completedSubtasksCount / task.subtasks.length) * 100)
    : 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
      {/* Click outside to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Slide-over Content */}
      <div className="relative w-full max-w-lg bg-surface border-l border-white/10 h-screen flex flex-col shadow-2xl z-10 transition-transform duration-300 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-container">
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">TASK DETAILS</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-1.5 hover:bg-white/10 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isEditing ? (
            // Edit Mode Form
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value as TaskPriority)}
                    className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
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
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-electric-blue/50 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-electric-blue text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-white/5 border border-white/10 text-on-surface py-2 rounded-lg text-sm font-semibold hover:bg-white/10 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode Content
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h2 className="font-heading text-xl font-bold text-on-surface">
                    {task.title}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-semibold rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  {task.dueDate && (
                    <span className="text-[10px] bg-white/5 text-on-surface-variant border border-white/10 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Description
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-4 rounded-xl border border-white/5 min-h-[80px]">
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {/* Assignees */}
              <div>
                <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Assignees
                </h4>
                {task.assignees.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/60 italic">Unassigned</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {task.assignees.map((assignee) => (
                      <div
                        key={assignee.id}
                        className="flex items-center gap-3 bg-surface-container-low p-2 rounded-xl border border-white/5"
                      >
                        <img
                          src={assignee.avatarUrl}
                          alt={assignee.name}
                          className="w-8 h-8 rounded-full border border-white/10 object-cover"
                        />
                        <span className="text-sm font-medium text-on-surface">{assignee.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtasks Progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  <span>Subtasks checklist</span>
                  <span className="text-on-surface">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden mb-4 border border-white/5">
                  <div
                    className="bg-electric-blue h-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Subtask Checklist */}
                <div className="space-y-2">
                  {task.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-white/5 group/sub"
                    >
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() => handleToggleSubtask(sub.id)}
                          className="w-4 h-4 rounded border-white/10 bg-transparent text-electric-blue focus:ring-electric-blue/20"
                        />
                        <span
                          className={`text-sm transition-all duration-150 ${
                            sub.completed
                              ? 'line-through text-on-surface-variant/40'
                              : 'text-on-surface'
                          }`}
                        >
                          {sub.title}
                        </span>
                      </label>
                      <button
                        onClick={() => handleRemoveSubtask(sub.id)}
                        className="text-on-surface-variant hover:text-error opacity-0 group-hover/sub:opacity-100 transition-opacity p-1 rounded hover:bg-white/5"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Form */}
                <form onSubmit={handleAddSubtask} className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Add subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 bg-surface-container-low border border-white/10 text-on-surface placeholder:text-on-surface-variant/40 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-electric-blue/50"
                  />
                  <button
                    type="submit"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface text-xs font-semibold px-4 py-2 rounded-lg transition-all active:scale-95"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
