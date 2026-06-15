import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import apiClient from '../../api/client'
import { getMilestones } from '../../api/projects.api'
import type { Task, TaskPriority, Subtask } from './types/kanban.types'

export default function TaskDetailsPage() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [projectMembers, setProjectMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingAssignee, setIsAddingAssignee] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPriority, setEditedPriority] = useState<TaskPriority>('medium')
  const [editedDueDate, setEditedDueDate] = useState('')
  const [editedStoryPoints, setEditedStoryPoints] = useState<number | ''>('')
  const [editedMilestoneId, setEditedMilestoneId] = useState<string>('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
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

  const fetchComments = async (tid: string) => {
    try {
      setIsLoadingComments(true)
      const res = await apiClient.get(`/tasks/${tid}/comments`)
      setComments(res.data)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  useEffect(() => {
    if (!taskId || !projectId) return

    const fetchTaskData = async () => {
      try {
        setIsLoading(true)
        const [taskRes, membersRes, milestonesRes] = await Promise.all([
          apiClient.get(`/tasks/${taskId}`),
          apiClient.get(`/projects/${projectId}`),
          getMilestones(projectId)
        ])
        
        const apiTask = taskRes.data
        const taskObj: Task = {
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
          storyPoints: apiTask.storyPoints,
          milestoneId: apiTask.milestoneId || null,
          milestone: apiTask.milestone || null,
        }
        
        setTask(taskObj)
        setEditedTitle(taskObj.title)
        setEditedDescription(taskObj.description)
        setEditedPriority(taskObj.priority)
        setEditedDueDate(taskObj.dueDate || '')
        setEditedStoryPoints(taskObj.storyPoints || '')
        setEditedMilestoneId(taskObj.milestoneId || '')
        
        setProjectMembers(membersRes.data.members || [])
        setMilestones(milestonesRes || [])
        
        fetchComments(taskId)
      } catch (error) {
        console.error('Failed to fetch task details:', error)
        toast.error('Failed to load task')
        navigate(`/projects/${projectId}/board`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskData()
  }, [taskId, projectId, navigate])

  const onUpdateTask = (updatedTask: Task) => {
    setTask(updatedTask)
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

  const handleDelete = async () => {
    if (!task) return
    try {
      await apiClient.delete(`/tasks/${task.id}`)
      toast.success('Task deleted')
      navigate(`/projects/${projectId}/board`)
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!task) return
    const sub = task.subtasks.find((s) => s.id === subtaskId)
    if (!sub) return
    try {
      const isCompleted = !sub.completed
      await apiClient.patch(`/tasks/subtasks/${subtaskId}`, { isCompleted })
      const updatedSubtasks = task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: isCompleted } : s
      )
      onUpdateTask({ ...task, subtasks: updatedSubtasks })
    } catch (error) {
      toast.error('Failed to update subtask')
    }
  }

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim() || !task) return
    try {
      const res = await apiClient.post(`/tasks/${task.id}/subtasks`, { title: newSubtaskTitle.trim() })
      const newSubtask: Subtask = {
        id: res.data.id,
        title: res.data.title,
        completed: res.data.isCompleted,
      }
      onUpdateTask({ ...task, subtasks: [...task.subtasks, newSubtask] })
      setNewSubtaskTitle('')
    } catch (error) {
      toast.error('Failed to add subtask')
    }
  }

  const handleRemoveSubtask = async (subtaskId: string) => {
    if (!task) return
    try {
      await apiClient.delete(`/tasks/subtasks/${subtaskId}`)
      const updatedSubtasks = task.subtasks.filter((sub) => sub.id !== subtaskId)
      onUpdateTask({ ...task, subtasks: updatedSubtasks })
    } catch (error) {
      toast.error('Failed to delete subtask')
    }
  }

  const handleSave = async () => {
    if (!task) return
    const selectedMilestone = milestones.find((m) => m.id === editedMilestoneId)

    try {
      await apiClient.patch(`/tasks/${task.id}`, {
        title: editedTitle,
        description: editedDescription,
        priority: editedPriority,
        dueDate: editedDueDate || null,
        storyPoints: editedStoryPoints ? Number(editedStoryPoints) : undefined,
        milestoneId: editedMilestoneId || null,
      })
      onUpdateTask({
        ...task,
        title: editedTitle,
        description: editedDescription,
        priority: editedPriority,
        dueDate: editedDueDate || undefined,
        storyPoints: editedStoryPoints ? Number(editedStoryPoints) : undefined,
        milestoneId: editedMilestoneId || null,
        milestone: selectedMilestone ? {
          id: selectedMilestone.id,
          title: selectedMilestone.title,
          color: selectedMilestone.color,
          status: selectedMilestone.status,
        } : null,
      })
      setIsEditing(false)
      toast.success('Task updated')
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message
      toast.error('Failed to update task: ' + (Array.isArray(msg) ? msg.join(', ') : msg))
    }
  }

  const handleAddAssignee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMemberId || !task) return
    try {
      await apiClient.post(`/tasks/${task.id}/assignees`, { userId: selectedMemberId })
      const member = projectMembers.find(m => m.userId === selectedMemberId)
      if (member) {
        onUpdateTask({
          ...task,
          assignees: [
            ...task.assignees,
            { id: member.userId, name: member.user?.name || 'Unknown', avatarUrl: member.user?.avatarUrl || '' },
          ],
        })
      }
      setIsAddingAssignee(false)
      setSelectedMemberId('')
      toast.success('Assignee added')
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error('User is already assigned')
      } else {
        toast.error('Failed to add assignee')
      }
    }
  }

  const handleRemoveAssignee = async (userId: string) => {
    if (!task) return
    try {
      await apiClient.delete(`/tasks/${task.id}/assignees/${userId}`)
      onUpdateTask({
        ...task,
        assignees: task.assignees.filter(a => a.id !== userId),
      })
      toast.success('Assignee removed')
    } catch (error) {
      toast.error('Failed to remove assignee')
    }
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
      </div>
    )
  }

  if (!task) return null

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length
  const progressPercentage = task.subtasks.length
    ? Math.round((completedSubtasksCount / task.subtasks.length) * 100)
    : 0

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 pb-24 animate-fade-in relative">
      {/* Back to Board Navigation */}
      <button
        onClick={() => navigate(`/projects/${projectId}/board`)}
        className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to Board
      </button>

      {/* Main Page Container */}
      <div className="bg-surface border border-white/5 rounded-2xl shadow-xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="text-xs text-on-surface-variant font-mono bg-white/5 px-2 py-1 rounded">TASK DETAILS</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDeleting(true)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 text-sm font-semibold transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Task
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-8">
          {isEditing ? (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-electric-blue/50 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-electric-blue/50 text-sm resize-none transition-all custom-scrollbar"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value as TaskPriority)}
                    className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-electric-blue/50 text-sm transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-electric-blue/50 text-sm transition-all text-on-surface-variant"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Story Points
                  </label>
                  <select
                    value={editedStoryPoints}
                    onChange={(e) => setEditedStoryPoints(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-electric-blue/50 text-sm transition-all"
                  >
                    <option value="">None</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="5">5</option>
                    <option value="8">8</option>
                    <option value="13">13</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Milestone
                  </label>
                  <select
                    value={editedMilestoneId}
                    onChange={(e) => setEditedMilestoneId(e.target.value)}
                    className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-electric-blue/50 text-sm transition-all"
                  >
                    <option value="">No Milestone</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="bg-electric-blue text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-electric-blue/20"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-white/5 border border-white/10 text-on-surface px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/10 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* View Mode Header Area */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h2 className="font-heading text-3xl font-bold text-on-surface leading-tight">
                    {task.title}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-sm font-semibold rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Task
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className={`text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  {task.storyPoints && (
                    <span className="text-[11px] bg-surface-variant text-on-surface-variant border border-white/10 px-3 py-1 rounded-md font-bold flex items-center justify-center shadow-sm">
                      {task.storyPoints} SP
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="text-[11px] bg-white/5 text-on-surface-variant border border-white/10 px-3 py-1 rounded-md font-medium flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {task.milestone && (
                    <span
                      className="text-[11px] border px-3 py-1 rounded-md font-medium flex items-center gap-1.5"
                      style={{
                        backgroundColor: `${task.milestone.color || '#6366f1'}20`,
                        borderColor: `${task.milestone.color || '#6366f1'}40`,
                        color: task.milestone.color || '#6366f1',
                      }}
                    >
                      <span className="material-symbols-outlined text-[14px]">flag</span>
                      Milestone: {task.milestone.title}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  Description
                </h4>
                <div className="text-[15px] text-on-surface-variant leading-relaxed bg-surface-container-low p-6 rounded-xl border border-white/5 min-h-[100px] shadow-inner">
                  {task.description ? (
                    <p className="whitespace-pre-wrap">{task.description}</p>
                  ) : (
                    <p className="italic opacity-60">No description provided.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Assignees */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      Assignees
                    </h4>
                    <button
                      onClick={() => setIsAddingAssignee(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-semibold rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add
                    </button>
                  </div>

                  {task.assignees.length === 0 ? (
                    <p className="text-sm text-on-surface-variant/60 italic p-4 border border-dashed border-white/10 rounded-xl text-center">Unassigned</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {task.assignees.map((assignee) => (
                        <div
                          key={assignee.id}
                          className="flex items-center justify-between gap-3 bg-surface-container-low p-3 rounded-xl border border-white/5 group/assignee transition-colors hover:bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-3">
                            {assignee.avatarUrl ? (
                              <img
                                src={assignee.avatarUrl}
                                alt={assignee.name}
                                className="w-10 h-10 rounded-full border border-white/10 object-cover shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full border border-white/10 bg-electric-blue/10 flex items-center justify-center text-electric-blue text-sm font-bold shadow-sm">
                                {assignee.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-[15px] font-medium text-on-surface">{assignee.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveAssignee(assignee.id)}
                            className="text-on-surface-variant hover:text-error opacity-0 group-hover/assignee:opacity-100 transition-opacity p-1.5 rounded hover:bg-white/5"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Assignee Form */}
                  {isAddingAssignee && (
                    <form onSubmit={handleAddAssignee} className="mt-4 p-4 bg-surface-container-low rounded-xl border border-white/5 shadow-lg animate-fade-in">
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        Select Team Member
                      </label>
                      <select
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className="w-full bg-surface-container-lowest text-on-surface border border-white/10 rounded-lg p-2.5 text-sm focus:outline-none focus:border-electric-blue/50 mb-3"
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
                          className="flex-1 bg-electric-blue text-white py-2 rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                        >
                          Add Assignee
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingAssignee(false)
                            setSelectedMemberId('')
                          }}
                          className="flex-1 bg-white/5 border border-white/10 text-on-surface py-2 rounded-lg text-xs font-semibold hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Subtasks */}
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">checklist</span>
                      <span>Subtasks</span>
                    </div>
                    <span className="text-on-surface bg-white/5 px-2 py-0.5 rounded text-xs">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden mb-5 border border-white/5">
                    <div
                      className="bg-electric-blue h-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {task.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-white/5 group/sub transition-colors hover:bg-white/[0.02]"
                      >
                        <label className="flex items-center gap-3 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sub.completed}
                            onChange={() => handleToggleSubtask(sub.id)}
                            className="w-4.5 h-4.5 rounded border-white/10 bg-transparent text-electric-blue focus:ring-electric-blue/20"
                          />
                          <span
                            className={`text-sm transition-all duration-200 ${
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
                          className="text-on-surface-variant hover:text-error opacity-0 group-hover/sub:opacity-100 transition-opacity p-1.5 rounded hover:bg-white/5"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                    {task.subtasks.length === 0 && (
                      <p className="text-sm text-on-surface-variant/60 italic text-center p-4 border border-dashed border-white/10 rounded-xl">No subtasks added yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddSubtask} className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Add a new subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 bg-surface-container-low border border-white/10 text-on-surface placeholder:text-on-surface-variant/40 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-electric-blue/50 transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface text-sm font-semibold px-5 py-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Add
                    </button>
                  </form>
                </div>
              </div>

              {/* Comments Section */}
              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    <h3 className="font-heading text-xl font-bold">Comments Activity</h3>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {isLoadingComments ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-10 bg-surface-container-low border border-dashed border-white/10 rounded-2xl">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-4xl mb-2">forum</span>
                      <p className="text-sm text-on-surface-variant/60 italic">No comments yet. Be the first to start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-5 rounded-2xl bg-surface-container-low/50 border border-white/5">
                          {/* Avatar */}
                          <div className="shrink-0">
                            {comment.user?.avatarUrl ? (
                              <img src={comment.user.avatarUrl} alt={comment.user?.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-sm" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-sm font-bold text-electric-blue border border-white/10 shadow-sm">
                                {comment.user?.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                          {/* Content */}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-semibold text-on-surface">{comment.user?.name || 'Unknown User'}</span>
                              <span className="text-xs text-on-surface-variant/60 font-medium">{formatTimeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-[15px] text-on-surface-variant leading-relaxed break-words pt-1">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="mt-8">
                  <form onSubmit={handleAddComment} className="flex flex-col gap-3 relative group">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                      className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-2xl p-4 pr-24 focus:outline-none focus:border-electric-blue/50 text-[15px] resize-none custom-scrollbar shadow-sm transition-all group-focus-within:bg-surface-container"
                    />
                    <div className="absolute right-3 bottom-3">
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="flex items-center justify-center w-10 h-10 bg-electric-blue text-white rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        title="Send comment"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleting && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2 shadow-inner">
                  <span className="material-symbols-outlined text-red-400 text-3xl">warning</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-on-surface">
                  Delete Task
                </h3>
                <p className="text-[15px] text-on-surface-variant leading-relaxed">
                  Are you sure you want to delete <strong className="text-on-surface">"{task.title}"</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="flex-1 bg-white/5 border border-white/10 text-on-surface py-3 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
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
