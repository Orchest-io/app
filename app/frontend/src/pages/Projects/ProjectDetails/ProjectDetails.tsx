import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, ProgressBar, Tabs, Button, Input, Select, TextArea } from '../../../components/ui'
import { useProject } from '../../../hooks/useProject'
import {
  useUpdateProject,
  useDeleteProject,
  useAddMember,
  useRemoveMember,
  useCreateMilestone,
  useUpdateMilestone,
  useRemoveMilestone,
} from '../../../hooks/useProjectMutations'
import type { UpdateMilestoneDto } from '@orchest/shared'

export default function ProjectDetailsOverview() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading, isError } = useProject(projectId)

  // Determine ownership
  const currentUserId = localStorage.getItem('orchest_user_id')
  const isOwner =
    project?.members?.some(
      (m) => m.userId === currentUserId && m.role === 'owner'
    ) ?? false

  const [activeTab, setActiveTab] = useState('overview')

  // Mutations
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const addMemberMutation = useAddMember()
  const removeMemberMutation = useRemoveMember()
  const createMilestoneMutation = useCreateMilestone()
  const updateMilestoneMutation = useUpdateMilestone()
  const removeMilestoneMutation = useRemoveMilestone()

  // Delete project confirm dialog
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // Add Member modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [memberRole, setMemberRole] = useState<'member' | 'owner'>('member')

  // Add Milestone modal
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)
  const [milestoneData, setMilestoneData] = useState({
    title: '',
    description: '',
    targetDate: '',
  })

  // Edit Milestone modal
  const [isEditMilestoneOpen, setIsEditMilestoneOpen] = useState(false)
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null)
  const [editMilestoneData, setEditMilestoneData] = useState<{
    title: string
    description: string
    targetDate: string
    status: string
  }>({ title: '', description: '', targetDate: '', status: 'upcoming' })

  // Edit Project modal
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [projectEditData, setProjectEditData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
  })

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId.trim() || !projectId) {
      toast.warning('Please enter a user ID')
      return
    }
    addMemberMutation.mutate(
      { projectId, dto: { userId: selectedUserId, role: memberRole as any } },
      {
        onSuccess: () => {
          toast.success('Team member added successfully!')
          setIsAddMemberOpen(false)
          setSelectedUserId('')
          setMemberRole('member')
        },
        onError: (err: any) => {
          toast.error('Failed to add member: ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleRemoveMember = (userId: string) => {
    if (!projectId) return
    removeMemberMutation.mutate(
      { projectId, userId },
      {
        onSuccess: () => toast.success('Member removed'),
        onError: (err: any) => {
          toast.error('Failed to remove member: ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!milestoneData.title.trim() || !projectId) {
      toast.warning('Please enter a milestone title')
      return
    }
    createMilestoneMutation.mutate(
      { projectId, dto: milestoneData },
      {
        onSuccess: () => {
          toast.success('Milestone created successfully!')
          setIsAddMilestoneOpen(false)
          setMilestoneData({ title: '', description: '', targetDate: '' })
        },
        onError: (err: any) => {
          toast.error('Failed to create milestone: ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleEditMilestoneOpen = (milestone: {
    id: string; title: string; description?: string; targetDate?: Date | string; status?: string
  }) => {
    setEditingMilestoneId(milestone.id)
    setEditMilestoneData({
      title: milestone.title,
      description: milestone.description ?? '',
      targetDate: milestone.targetDate
        ? (typeof milestone.targetDate === 'string'
          ? milestone.targetDate.split('T')[0]
          : (milestone.targetDate as Date).toISOString().split('T')[0])
        : '',
      status: milestone.status ?? 'upcoming',
    })
    setIsEditMilestoneOpen(true)
  }

  const handleEditMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMilestoneId || !projectId) return
    const dto: UpdateMilestoneDto = {
      title: editMilestoneData.title,
      description: editMilestoneData.description || undefined,
      targetDate: editMilestoneData.targetDate || undefined,
      status: editMilestoneData.status as any,
    }
    updateMilestoneMutation.mutate(
      { milestoneId: editingMilestoneId, projectId, dto },
      {
        onSuccess: () => {
          toast.success('Milestone updated')
          setIsEditMilestoneOpen(false)
          setEditingMilestoneId(null)
        },
        onError: (err: any) => {
          toast.error('Failed to update milestone: ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleRemoveMilestone = (milestoneId: string) => {
    if (!projectId) return
    removeMilestoneMutation.mutate(
      { milestoneId, projectId },
      {
        onSuccess: () => toast.success('Milestone deleted'),
        onError: (err: any) => {
          toast.error('Failed to delete milestone: ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleEditProjectOpen = () => {
    if (!project) return
    setProjectEditData({
      name: project.name,
      description: project.description ?? '',
      status: project.status ?? 'planning',
      priority: project.priority ?? 'medium',
      startDate: project.startDate
        ? (typeof project.startDate === 'string'
          ? project.startDate.split('T')[0]
          : (project.startDate as Date).toISOString().split('T')[0])
        : '',
      endDate: project.endDate
        ? (typeof project.endDate === 'string'
          ? project.endDate.split('T')[0]
          : (project.endDate as Date).toISOString().split('T')[0])
        : '',
    })
    setIsEditProjectOpen(true)
  }

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectEditData.name.trim() || !projectId) {
      toast.warning('Please enter a project name')
      return
    }
    updateProjectMutation.mutate(
      { id: projectId, dto: projectEditData as any },
      {
        onSuccess: () => {
          toast.success('Project updated successfully!')
          setIsEditProjectOpen(false)
        },
        onError: (err: any) => {
          toast.error('Failed to update project: ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleDeleteProject = () => {
    if (!projectId) return
    deleteProjectMutation.mutate(projectId, {
      onSuccess: () => {
        toast.success('Project deleted')
        navigate('/projects')
      },
      onError: (err: any) => {
        toast.error('Failed to delete project: ' + (err?.response?.data?.message ?? err.message))
      },
    })
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
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
      case 'done':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'active':
      case 'in-progress':
        return 'text-electric-blue bg-electric-blue/10 border-electric-blue/20'
      case 'archived':
      case 'backlog':
        return 'text-on-surface-variant bg-surface-glass border-border-low'
      default:
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    }
  }

  // ─── Loading / Error States ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-on-surface-variant">Loading project details...</p>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <Card className="max-w-[600px] mx-auto py-16 text-center mt-12">
        <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6 leading-relaxed">
          The project details you are looking for do not exist or you do not have permission to view them.
        </p>
        <Button variant="secondary" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </Card>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1100px] mx-auto py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface mb-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Projects
          </button>

          <h2 className="font-heading text-[32px] font-semibold text-on-surface">
            {project.name}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 max-w-[700px]">
            {project.description || 'No project description provided.'}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" icon="edit" onClick={handleEditProjectOpen}>
            Edit Project
          </Button>
          {isOwner && (
            <Button
              variant="secondary"
              icon="delete"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              Delete Project
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultTab="overview"
        onChange={setActiveTab}
        tabs={[
          { key: 'overview', label: 'Overview', icon: 'dashboard' },
          { key: 'tasks', label: `Tasks (${(project as any).tasks?.length || 0})`, icon: 'task_alt' },
          { key: 'milestones', label: `Milestones (${project.milestones?.length || 0})`, icon: 'flag' },
          { key: 'activity', label: 'Activity Logs', icon: 'history' },
        ]}
        className="mb-8"
      />

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
                Project Progress
              </p>
              <p className="text-[28px] font-bold font-heading text-on-surface mb-3">
                {project.progress ?? 0}%
              </p>
              <ProgressBar value={project.progress ?? 0} glow />
            </Card>

            <Card>
              <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
                Status
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded border ${getStatusColor(project.status ?? '')}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-3">
                Current execution status
              </p>
            </Card>

            <Card>
              <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
                Priority
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded border ${getPriorityColor(project.priority ?? '')}`}>
                  {project.priority}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-3">
                Workspace urgency ranking
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team Members */}
            <Card className="md:col-span-2">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading text-lg font-semibold text-on-surface">
                  Team Members
                </h3>
                {isOwner && (
                  <Button variant="secondary" size="sm" icon="add" onClick={() => setIsAddMemberOpen(true)}>
                    Add Member
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {!project.members || project.members.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic">No members assigned to this project.</p>
                ) : (
                  project.members.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-lg bg-surface-container-low border border-border-low flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-on-surface">
                          {(member as any).user?.fullName || member.userId}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {member.role || 'Member'} • Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-glass border border-border-low px-2.5 py-1 rounded-sm">
                          {(member as any).user?.email || member.userId}
                        </span>
                        {isOwner && member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-1"
                            title="Remove member"
                          >
                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Summary Activity */}
            <Card>
              <h3 className="font-heading text-lg font-semibold text-on-surface mb-5">
                Recent Activity
              </h3>
              <div className="flex flex-col gap-3">
                {!(project as any).activityLogs || (project as any).activityLogs.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic">No activities logged yet.</p>
                ) : (
                  (project as any).activityLogs.slice(0, 5).map((log: any) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-surface-container-low border border-border-low text-xs"
                    >
                      <p className="text-on-surface mb-1">{log.description}</p>
                      <span className="text-[10px] text-on-surface-variant">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <Card>
          <div className="mb-6">
            <h3 className="font-heading text-lg font-semibold text-on-surface">Project Tasks</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Tasks scope for active milestones.</p>
          </div>

          {!(project as any).tasks || (project as any).tasks.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-3">task_alt</span>
              <p className="text-sm text-on-surface-variant font-medium">No tasks found for this project</p>
              <p className="text-xs text-on-surface-variant/60 mt-1 mb-4">Tasks will appear here once created.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(project as any).tasks.map((task: any) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg bg-surface-container-low border border-border-low flex flex-col md:flex-row justify-between md:items-center gap-3 hover:border-outline/35 transition-colors"
                >
                  <div>
                    <h4 className="font-heading text-sm font-semibold text-on-surface mb-1">{task.title}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2">{task.description || 'No description.'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className="text-[10px] text-on-surface-variant bg-surface-glass border border-border-low px-2 py-0.5 rounded uppercase font-bold">
                      {task.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MILESTONES TAB */}
      {activeTab === 'milestones' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading text-lg font-semibold text-on-surface">Milestones</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Project phases and target markers.</p>
            </div>
            <Button icon="add" onClick={() => setIsAddMilestoneOpen(true)}>Create Milestone</Button>
          </div>

          {!project.milestones || project.milestones.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-3">flag</span>
              <p className="text-sm text-on-surface-variant font-medium">No milestones found</p>
              <p className="text-xs text-on-surface-variant/60 mt-1 mb-4">Structure your project timeline by mapping milestones.</p>
              <Button size="sm" icon="add" onClick={() => setIsAddMilestoneOpen(true)}>Add Milestone</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.milestones.map((milestone) => (
                <Card key={milestone.id} variant="solid" className="flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-heading text-sm font-semibold text-on-surface">{milestone.title}</h4>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {milestone.targetDate && (
                          <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                            {new Date(milestone.targetDate).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleEditMilestoneOpen(milestone as any)}
                          className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          title="Edit milestone"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => handleRemoveMilestone(milestone.id)}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            title="Delete milestone"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">{milestone.description || 'No description provided.'}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-on-surface-variant">Progress</span>
                      <span className="font-semibold text-on-surface">{milestone.progress ?? 0}%</span>
                    </div>
                    <ProgressBar value={milestone.progress ?? 0} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ACTIVITY LOG TAB */}
      {activeTab === 'activity' && (
        <Card>
          <h3 className="font-heading text-lg font-semibold text-on-surface mb-6">Activity Audit Logs</h3>
          <div className="flex flex-col gap-3">
            {!(project as any).activityLogs || (project as any).activityLogs.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">No activity logs recorded yet.</p>
            ) : (
              (project as any).activityLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 rounded-lg bg-surface-container-low border border-border-low flex justify-between items-center text-sm"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border text-purple-400 bg-purple-400/10 border-purple-400/20 mr-3">
                      {log.entityType}
                    </span>
                    <span className="text-on-surface">{log.description}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* ── Delete Confirm Dialog ───────────────────────────────────────────────── */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full" padding="lg">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-400/10 flex items-center justify-center text-red-400">
                <span className="material-symbols-outlined text-[32px]">delete_forever</span>
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold text-on-surface">Delete Project?</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  This will permanently delete <span className="font-semibold text-on-surface">{project.name}</span> and all its members and milestones. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-red-500 hover:bg-red-600 border-red-500"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false)
                    handleDeleteProject()
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Add Member Modal ────────────────────────────────────────────────────── */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Add Team Member</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsAddMemberOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <Input
                label="User ID"
                placeholder="Enter the user's ID (UUID)"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              />

              <Select
                label="Role"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as 'member' | 'owner')}
                options={[
                  { value: 'member', label: 'Member' },
                  { value: 'owner', label: 'Owner' },
                ]}
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsAddMemberOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addMemberMutation.isPending}>
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Add Milestone Modal ─────────────────────────────────────────────────── */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Create Project Milestone</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsAddMilestoneOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="flex flex-col gap-4">
              <Input
                label="Milestone Title"
                placeholder="e.g. Phase 1: MVP Release"
                value={milestoneData.title}
                onChange={(e) => setMilestoneData({ ...milestoneData, title: e.target.value })}
                required
              />

              <TextArea
                label="Description"
                placeholder="Enter details of milestones outcomes..."
                value={milestoneData.description}
                onChange={(e) => setMilestoneData({ ...milestoneData, description: e.target.value })}
              />

              <Input
                label="Target Date"
                type="date"
                value={milestoneData.targetDate}
                onChange={(e) => setMilestoneData({ ...milestoneData, targetDate: e.target.value })}
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsAddMilestoneOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMilestoneMutation.isPending}>
                  {createMilestoneMutation.isPending ? 'Creating...' : 'Create Milestone'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Edit Milestone Modal ────────────────────────────────────────────────── */}
      {isEditMilestoneOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Edit Milestone</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsEditMilestoneOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditMilestoneSubmit} className="flex flex-col gap-4">
              <Input
                label="Milestone Title"
                value={editMilestoneData.title}
                onChange={(e) => setEditMilestoneData({ ...editMilestoneData, title: e.target.value })}
                required
              />

              <TextArea
                label="Description"
                value={editMilestoneData.description}
                onChange={(e) => setEditMilestoneData({ ...editMilestoneData, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={editMilestoneData.status}
                  onChange={(e) => setEditMilestoneData({ ...editMilestoneData, status: e.target.value })}
                  options={[
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                />
                <Input
                  label="Target Date"
                  type="date"
                  value={editMilestoneData.targetDate}
                  onChange={(e) => setEditMilestoneData({ ...editMilestoneData, targetDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsEditMilestoneOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMilestoneMutation.isPending}>
                  {updateMilestoneMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Edit Project Modal ──────────────────────────────────────────────────── */}
      {isEditProjectOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Edit Project Details</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsEditProjectOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditProject} className="flex flex-col gap-4">
              <Input
                label="Project Name"
                value={projectEditData.name}
                onChange={(e) => setProjectEditData({ ...projectEditData, name: e.target.value })}
                required
              />

              <TextArea
                label="Description"
                value={projectEditData.description}
                onChange={(e) => setProjectEditData({ ...projectEditData, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={projectEditData.status}
                  onChange={(e) => setProjectEditData({ ...projectEditData, status: e.target.value })}
                  options={[
                    { value: 'planning', label: 'Planning' },
                    { value: 'active', label: 'Active' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />

                <Select
                  label="Priority"
                  value={projectEditData.priority}
                  onChange={(e) => setProjectEditData({ ...projectEditData, priority: e.target.value })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={projectEditData.startDate}
                  onChange={(e) => setProjectEditData({ ...projectEditData, startDate: e.target.value })}
                />

                <Input
                  label="End Date"
                  type="date"
                  value={projectEditData.endDate}
                  onChange={(e) => setProjectEditData({ ...projectEditData, endDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsEditProjectOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
