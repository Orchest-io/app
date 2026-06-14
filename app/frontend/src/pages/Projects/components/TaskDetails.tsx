import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import apiClient from '../../../api/client'
import type { Task, TaskPriority, Subtask } from '../types/kanban.types'

interface TaskDetailsProps {
  task: Task | null
  onClose: () => void
  onUpdateTask: (updatedTask: Task) => void
  onDeleteTask: (taskId: string) => void
  projectMembers?: any[]
}

export default function TaskDetails({ task, onClose, onUpdateTask, onDeleteTask, projectMembers = [] }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingAssignee, setIsAddingAssignee] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPriority, setEditedPriority] = useState<TaskPriority>('medium')
  const [editedDueDate, setEditedDueDate] = useState('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title)
      setEditedDescription(task.description)
      setEditedPriority(task.priority)
      setEditedDueDate(task.dueDate || '')
      setIsEditing(false)
      setIsDeleting(false)
      fetchComments(task.id)
    }
  }, [task])

  const fetchComments = async (taskId: string) => {
    try {
      setIsLoadingComments(true)
      const res = await apiClient.get(`/tasks/${taskId}/comments`)
      setComments(res.data)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !task) return

    try {
      const res = await apiClient.post(`/tasks/${task.id}/comments`, { content: commentText.trim() })
      setComments(prev => [...prev, { ...res.data, user: res.data.user || { name: 'You', avatarUrl: '' } }])
      setCommentText('')
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    }
  }

  if (!task) return null

  const handleDelete = () => {
    onDeleteTask(task.id)
    onClose()
  }

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

  const handleAddAssignee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId || !task) return

    try {
      await apiClient.post(`/tasks/${task.id}/assignees`, {
        userId: selectedMemberId,
      })

      const member = projectMembers.find(m => m.userId === selectedMemberId)
      if (member) {
        const updatedTask = {
          ...task,
          assignees: [
            ...task.assignees,
            {
              id: member.userId,
              name: member.user?.name || 'Unknown',
              avatarUrl: member.user?.avatarUrl || '',
            },
          ],
        }
        onUpdateTask(updatedTask)
      }

      setIsAddingAssignee(false)
      setSelectedMemberId('')
      toast.success('Assignee added successfully')
    } catch (error: any) {
      console.error('Failed to add assignee:', error)
      if (error?.response?.status === 409) {
        toast.error('User is already assigned to this task')
      } else {
        toast.error('Failed to add assignee')
      }
    }
  }

  const handleRemoveAssignee = async (userId: string) => {
    if (!task) return

    try {
      await apiClient.delete(`/tasks/${task.id}/assignees/${userId}`)

      const updatedTask = {
        ...task,
        assignees: task.assignees.filter(a => a.id !== userId),
      }
      onUpdateTask(updatedTask)
      toast.success('Assignee removed')
    } catch (error) {
      console.error('Failed to remove assignee:', error)
      toast.error('Failed to remove assignee')
    }
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDeleting(true)}
              className="flex items-center justify-center p-1.5 hover:bg-red-500/10 rounded-full text-red-400 hover:text-red-300 transition-all"
              title="Delete Task"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center p-1.5 hover:bg-white/10 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
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
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Assignees
                  </h4>
                  <button
                    onClick={() => setIsAddingAssignee(true)}
                    className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 text-xs font-semibold rounded text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Add
                  </button>
                </div>

                {task.assignees.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/60 italic">Unassigned</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {task.assignees.map((assignee) => (
                      <div
                        key={assignee.id}
                        className="flex items-center justify-between gap-3 bg-surface-container-low p-2 rounded-xl border border-white/5 group/assignee"
                      >
                        <div className="flex items-center gap-3">
                          {assignee.avatarUrl ? (
                            <img
                              src={assignee.avatarUrl}
                              alt={assignee.name}
                              className="w-8 h-8 rounded-full border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full border border-white/10 bg-electric-blue/10 flex items-center justify-center text-electric-blue text-xs font-bold">
                              {assignee.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-on-surface">{assignee.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveAssignee(assignee.id)}
                          className="text-on-surface-variant hover:text-error opacity-0 group-hover/assignee:opacity-100 transition-opacity p-1 rounded hover:bg-white/5"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Assignee Form */}
                {isAddingAssignee && (
                  <form onSubmit={handleAddAssignee} className="mt-3 p-3 bg-surface-container-low rounded-xl border border-white/5">
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                      Select Team Member
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-electric-blue/50 mb-3"
                      required
                    >
                      <option value="">Choose a member...</option>
                      {projectMembers
                        .filter(m => !task.assignees.some(a => a.id === m.userId))
                        .map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.user?.name || 'Unknown'} ({member.role})
                          </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-electric-blue text-white py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                      >
                        Add Assignee
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAssignee(false)
                          setSelectedMemberId('')
                        }}
                        className="flex-1 bg-white/5 border border-white/10 text-on-surface py-1.5 rounded-lg text-xs font-semibold hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
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

              {/* Comments Section */}
              <div className="pt-6 border-t border-white/5 flex flex-col h-[300px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <h3 className="font-heading text-lg font-bold">Comments</h3>
                  </div>
                </div>
                
                {/* Dedicated Scrollable Feed */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {isLoadingComments ? (
                    <div className="flex justify-center py-4">
                      <div className="w-5 h-5 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-on-surface-variant/60 italic text-center py-4">No comments yet. Start the conversation!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex flex-col gap-2 pb-4 border-b border-gray-200/10 last:border-0">
                        {/* User Identity Row */}
                        <div className="flex items-center gap-2">
                          {comment.user?.avatarUrl ? (
                            <img src={comment.user.avatarUrl} alt={comment.user?.name} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-electric-blue/20 flex items-center justify-center text-[10px] font-bold text-electric-blue border border-white/10">
                              {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-on-surface">{comment.user?.name || 'Unknown User'}</span>
                          <span className="text-xs text-on-surface-variant/60">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        {/* Content Block */}
                        <p className="text-sm text-on-surface-variant pl-8 break-words">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area anchored at the bottom */}
        {!isEditing && (
          <div className="p-4 border-t border-white/5 bg-surface-container shrink-0">
            <form onSubmit={handleAddComment} className="flex flex-col gap-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="w-full bg-surface-container-low text-on-surface border border-dashed border-white/20 rounded-xl p-3 focus:outline-none focus:border-electric-blue/50 text-sm resize-none custom-scrollbar"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="flex items-center gap-2 bg-electric-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Send
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center p-6">
            <div className="bg-surface border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400">warning</span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-on-surface">
                  Delete Task?
                </h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-6">
                Are you sure you want to delete "<strong>{task.title}</strong>"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="flex-1 bg-white/5 border border-white/10 text-on-surface py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
