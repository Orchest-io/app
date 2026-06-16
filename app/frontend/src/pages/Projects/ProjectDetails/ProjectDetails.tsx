import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, ProgressBar, Tabs, Button, Input, Select, TextArea } from '../../../components/ui'
import { useProject } from '../../../hooks/useProject'
import {
  useUpdateProject,
  useDeleteProject,
  useCreateMilestone,
  useUpdateMilestone,
  useRemoveMilestone,
} from '../../../hooks/useProjectMutations'
import TeamManagementTab from './TeamManagementTab'
import ProjectAttachmentsTab from './ProjectAttachmentsTab'
import AnalyticsTab from './AnalyticsTab'
import type { UpdateMilestoneDto } from '@orchest/shared'
import client from '../../../api/client'
import { getMilestones } from '../../../api/projects.api'
import MilestoneTasksModal from '../components/MilestoneTasksModal'

export default function ProjectDetailsOverview() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: project, isLoading, isError } = useProject(projectId)

  // Determine ownership
  const currentUserId = localStorage.getItem('orchest_user_id')
  const isOwner =
    project?.members?.some(
      (m) => m.userId === currentUserId && m.role === 'owner'
    ) ?? false

  const [activeTab, setActiveTab] = useState('overview')

  // Enriched milestones with task counts
  const [enrichedMilestones, setEnrichedMilestones] = useState<any[]>([])
  const [loadingMilestones, setLoadingMilestones] = useState(false)

  // Assign-tasks modal
  const [assignModalMilestone, setAssignModalMilestone] = useState<any | null>(null)
  const [allProjectTasks, setAllProjectTasks] = useState<any[]>([])

  // Task statistics
  const [taskStats, setTaskStats] = useState({
    total: 0,
    backlog: 0,
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
  })
  const [loadingTasks, setLoadingTasks] = useState(false)

  // Fetch tasks immediately when component loads
  useEffect(() => {
    if (projectId) {
      fetchTaskStats()
    }
  }, [projectId])

  // Fetch enriched milestones when milestone tab is active
  useEffect(() => {
    if (projectId && activeTab === 'milestones') {
      fetchEnrichedMilestones()
      fetchAllProjectTasks()
    }
  }, [projectId, activeTab])

  const fetchTaskStats = async () => {
    if (!projectId) return
    setLoadingTasks(true)
    try {
      const response = await client.get(`/tasks/board/${projectId}`)
      const tasks = response.data || []
      
      const stats = {
        total: tasks.length,
        backlog: tasks.filter((t: any) => t.status === 'backlog').length,
        todo: tasks.filter((t: any) => t.status === 'todo').length,
        inProgress: tasks.filter((t: any) => t.status === 'in-progress').length,
        review: tasks.filter((t: any) => t.status === 'review').length,
        done: tasks.filter((t: any) => t.status === 'done').length,
      }
      setTaskStats(stats)
    } catch (err) {
      console.error('Failed to fetch task stats:', err)
    } finally {
      setLoadingTasks(false)
    }
  }

  const fetchEnrichedMilestones = async () => {
    if (!projectId) return
    setLoadingMilestones(true)
    try {
      const data = await getMilestones(projectId)
      setEnrichedMilestones(data)
    } catch (err) {
      console.error('Failed to fetch enriched milestones:', err)
    } finally {
      setLoadingMilestones(false)
    }
  }

  const fetchAllProjectTasks = async () => {
    if (!projectId) return
    try {
      const response = await client.get(`/tasks/board/${projectId}`)
      setAllProjectTasks(response.data || [])
    } catch (err) {
      console.error('Failed to fetch project tasks:', err)
    }
  }

  // Mutations
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const createMilestoneMutation = useCreateMilestone()
  const updateMilestoneMutation = useUpdateMilestone()
  const removeMilestoneMutation = useRemoveMilestone()

  // Delete project confirm dialog
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // Add Milestone modal
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)
  const [milestoneData, setMilestoneData] = useState({
    title: '',
    description: '',
    targetDate: '',
    color: '#6366f1',
  })

  // Edit Milestone modal
  const [isEditMilestoneOpen, setIsEditMilestoneOpen] = useState(false)
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null)
  const [editMilestoneData, setEditMilestoneData] = useState<{
    title: string
    description: string
    targetDate: string
    status: string
    color: string
  }>({ title: '', description: '', targetDate: '', status: 'upcoming', color: '#6366f1' })

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

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!milestoneData.title.trim() || !projectId) {
      toast.warning(t('projectDetails.enterMilestoneTitle'))
      return
    }
    createMilestoneMutation.mutate(
      { projectId, dto: milestoneData },
      {
        onSuccess: () => {
          toast.success(t('projectDetails.milestoneCreated'))
          setIsAddMilestoneOpen(false)
          setMilestoneData({ title: '', description: '', targetDate: '', color: '#6366f1' })
          fetchEnrichedMilestones()
        },
        onError: (err: any) => {
          toast.error(t('projectDetails.milestoneCreateFailed') + ': ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleEditMilestoneOpen = (milestone: {
    id: string; title: string; description?: string; targetDate?: Date | string; status?: string; color?: string
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
      color: milestone.color ?? '#6366f1',
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
      color: editMilestoneData.color || undefined,
    }
    updateMilestoneMutation.mutate(
      { milestoneId: editingMilestoneId, projectId, dto },
      {
        onSuccess: () => {
          toast.success(t('projectDetails.milestoneUpdated'))
          setIsEditMilestoneOpen(false)
          setEditingMilestoneId(null)
          fetchEnrichedMilestones()
        },
        onError: (err: any) => {
          toast.error(t('projectDetails.milestoneUpdateFailed') + ': ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleRemoveMilestone = (milestoneId: string) => {
    if (!projectId) return
    removeMilestoneMutation.mutate(
      { milestoneId, projectId },
      {
        onSuccess: () => {
          toast.success(t('projectDetails.milestoneDeleteSuccess'))
          fetchEnrichedMilestones()
        },
        onError: (err: any) => {
          toast.error(t('projectDetails.milestoneDeleteFailed') + ': ' + (err?.response?.data?.message ?? err.message))
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
      toast.warning(t('projectDetails.enterProjectName'))
      return
    }
    updateProjectMutation.mutate(
      { id: projectId, dto: projectEditData as any },
      {
        onSuccess: () => {
          toast.success(t('projectDetails.projectUpdated'))
          setIsEditProjectOpen(false)
        },
        onError: (err: any) => {
          toast.error(t('projectDetails.projectUpdateFailed') + ': ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleDeleteProject = () => {
    if (!projectId) return
    deleteProjectMutation.mutate(projectId, {
      onSuccess: () => {
        toast.success(t('projectDetails.projectDeleted'))
        navigate('/projects')
      },
      onError: (err: any) => {
        toast.error(t('projectDetails.projectDeleteFailed') + ': ' + (err?.response?.data?.message ?? err.message))
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
        <p className="text-sm text-on-surface-variant">{t('projectDetails.loadingProject')}</p>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <Card className="max-w-[600px] mx-auto py-16 text-center mt-12">
        <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">{t('projectDetails.projectNotFound')}</h2>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6 leading-relaxed">
          {t('projectDetails.projectNotFoundDesc')}
        </p>
        <Button variant="secondary" onClick={() => navigate('/projects')}>
          {t('projectDetails.backToProjects')}
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
            {t('projectDetails.backToProjects')}
          </button>

          <h2 className="font-heading text-[32px] font-semibold text-on-surface">
            {project.name}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 max-w-[700px]">
            {project.description || t('projectDetails.noDescription')}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" icon="edit" onClick={handleEditProjectOpen}>
            {t('projectDetails.editProject')}
          </Button>
          {isOwner && (
            <Button
              variant="secondary"
              icon="delete"
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
            >
              {t('projectDetails.deleteProject')}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultTab="overview"
        onChange={setActiveTab}
        tabs={[
          { key: 'overview', label: t('projectDetails.overview'), icon: 'dashboard' },
          { key: 'team', label: `${t('projectDetails.team')} (${project.members?.length || 0})`, icon: 'group' },
          { key: 'tasks', label: `${t('projectDetails.tasks')} (${taskStats.total})`, icon: 'task_alt' },
          { key: 'milestones', label: `${t('projectDetails.milestones')} (${project.milestones?.length || 0})`, icon: 'flag' },
          { key: 'analytics', label: 'Analytics', icon: 'bar_chart' },
          { key: 'activity', label: t('projectDetails.activityLogs'), icon: 'history' },
          { key: 'attachments', label: t('projectDetails.attachments'), icon: 'attach_file' },
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
                {t('projectDetails.projectProgress')}
              </p>
              <p className="text-[28px] font-bold font-heading text-on-surface mb-3">
                {project.progress ?? 0}%
              </p>
              <ProgressBar value={project.progress ?? 0} glow />
            </Card>

            <Card>
              <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
                {t('projectDetails.status')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded border ${getStatusColor(project.status ?? '')}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-3">
                {t('projectDetails.currentExecutionStatus')}
              </p>
            </Card>

            <Card>
              <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
                {t('projectDetails.priority')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded border ${getPriorityColor(project.priority ?? '')}`}>
                  {project.priority}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-3">
                {t('projectDetails.workspaceUrgencyRanking')}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Summary Activity */}
            <Card>
              <h3 className="font-heading text-lg font-semibold text-on-surface mb-5">
                {t('projectDetails.recentActivity')}
              </h3>
              <div className="flex flex-col gap-3">
                {!(project as any).activityLogs || (project as any).activityLogs.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic">{t('projectDetails.noActivitiesYet')}</p>
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

            {/* Project Timeline */}
            <Card>
              <h3 className="font-heading text-lg font-semibold text-on-surface mb-5">
                {t('projectDetails.projectTimeline')}
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-electric-blue">event</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">{t('projectDetails.startDate')}</p>
                    <p className="text-sm font-semibold text-on-surface">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : t('projectDetails.notSet')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-400/10 border border-purple-400/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-purple-400">flag</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">{t('projectDetails.targetEndDate')}</p>
                    <p className="text-sm font-semibold text-on-surface">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : t('projectDetails.notSet')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400">group</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">{t('projectDetails.teamSize')}</p>
                    <p className="text-sm font-semibold text-on-surface">
                      {project.members?.length || 0} {t('projectDetails.members')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {activeTab === 'team' && (
        <TeamManagementTab
          projectId={projectId!}
          members={project.members || []}
          isOwner={isOwner}
        />
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading text-lg font-semibold text-on-surface">{t('projectDetails.projectTasks')}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{t('projectDetails.manageTasks')}</p>
            </div>
            <Button
              icon="view_week"
              onClick={() => navigate(`/projects/${projectId}/board`)}
            >
              {t('projectDetails.openKanbanBoard')}
            </Button>
          </div>

          {loadingTasks ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-on-surface-variant">{t('projectDetails.loadingTasks')}</p>
            </div>
          ) : taskStats.total === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-3">task_alt</span>
              <p className="text-sm text-on-surface-variant font-medium">{t('projectDetails.noTasksFound')}</p>
              <p className="text-xs text-on-surface-variant/60 mt-1 mb-4">{t('projectDetails.createTasksOnBoard')}</p>
              <Button
                size="sm"
                icon="view_week"
                onClick={() => navigate(`/projects/${projectId}/board`)}
              >
                {t('projectDetails.openKanbanBoard')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Progress Card */}
              <Card variant="solid">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-electric-blue">trending_up</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">{t('projectDetails.taskProgress')}</p>
                    <p className="text-sm font-semibold text-on-surface">
                      {taskStats.done} / {taskStats.total} {t('projectDetails.completed')}
                    </p>
                  </div>
                </div>
                <ProgressBar value={(taskStats.done / taskStats.total) * 100} glow />
              </Card>

              {/* Active Tasks Card */}
              <Card variant="solid">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-amber-400">work</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">{t('projectDetails.activeTasks')}</p>
                    <p className="text-sm font-semibold text-on-surface">
                      {taskStats.inProgress + taskStats.review} {t('projectDetails.inProgress')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                    {taskStats.inProgress} {t('projectDetails.inProgressLabel')}
                  </span>
                  <span className="px-2 py-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {taskStats.review} {t('projectDetails.reviewLabel')}
                  </span>
                </div>
              </Card>
            </div>
          )}
        </Card>
      )}

      {/* MILESTONES TAB */}
      {activeTab === 'milestones' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading text-lg font-semibold text-on-surface">{t('projectDetails.milestonesTitle')}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{t('projectDetails.milestonesDesc')}</p>
            </div>
            <Button icon="add" onClick={() => setIsAddMilestoneOpen(true)}>{t('projectDetails.createMilestone')}</Button>
          </div>

          {loadingMilestones ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-on-surface-variant">{t('projectDetails.loadingMilestones')}</p>
            </div>
          ) : enrichedMilestones.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-3">flag</span>
              <p className="text-sm text-on-surface-variant font-medium">{t('projectDetails.noMilestonesFound')}</p>
              <p className="text-xs text-on-surface-variant/60 mt-1 mb-4">{t('projectDetails.structureTimeline')}</p>
              <Button size="sm" icon="add" onClick={() => setIsAddMilestoneOpen(true)}>{t('projectDetails.addMilestone')}</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {enrichedMilestones.map((milestone) => {
                const color = milestone.color || '#6366f1'
                const statusColors: Record<string, string> = {
                  'completed': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                  'in-progress': 'text-electric-blue bg-electric-blue/10 border-electric-blue/20',
                  'delayed': 'text-red-400 bg-red-400/10 border-red-400/20',
                  'upcoming': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
                }
                const statusClass = statusColors[milestone.status] || statusColors['upcoming']
                return (
                  <Card key={milestone.id} variant="solid" className="relative overflow-hidden">
                    {/* Color accent bar */}
                    <div
                      className="absolute top-0 left-0 w-1 h-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="pl-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <h4 className="font-heading text-sm font-semibold text-on-surface truncate">{milestone.title}</h4>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border shrink-0 ${statusClass}`}>
                            {milestone.status ?? 'upcoming'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {milestone.targetDate && (
                            <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                              {new Date(milestone.targetDate).toLocaleDateString()}
                            </span>
                          )}
                          <button
                            onClick={() => setAssignModalMilestone(milestone)}
                            className="text-on-surface-variant hover:text-electric-blue transition-colors cursor-pointer p-0.5 rounded"
                            title="Assign tasks to milestone"
                          >
                            <span className="material-symbols-outlined text-[16px]">playlist_add</span>
                          </button>
                          <button
                            onClick={() => handleEditMilestoneOpen(milestone as any)}
                            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-0.5 rounded"
                            title="Edit milestone"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => handleRemoveMilestone(milestone.id)}
                              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer p-0.5 rounded"
                              title="Delete milestone"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {milestone.description && (
                        <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{milestone.description}</p>
                      )}

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-on-surface-variant">{t('projectDetails.progressLabel')}</span>
                            <span className="font-semibold text-on-surface">{milestone.progress ?? 0}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${milestone.progress ?? 0}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                        <div
                          className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {milestone.doneCount ?? 0}/{milestone.taskCount ?? 0} {t('projectDetails.tasksSuffix')}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && projectId && (
        <AnalyticsTab projectId={projectId} />
      )}

      {/* ACTIVITY LOG TAB */}
      {activeTab === 'activity' && (
        <Card>
          <h3 className="font-heading text-lg font-semibold text-on-surface mb-6">{t('projectDetails.activityAuditLogs')}</h3>
          <div className="flex flex-col gap-3">
            {!(project as any).activityLogs || (project as any).activityLogs.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">{t('projectDetails.noActivityLogs')}</p>
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

      {/* ATTACHMENTS TAB */}
      {activeTab === 'attachments' && (
        <ProjectAttachmentsTab
          projectId={projectId!}
          currentUserId={currentUserId || ''}
          isOwner={isOwner}
        />
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
                <h3 className="font-heading text-lg font-semibold text-on-surface">{t('projectDetails.deleteProjectTitle')}</h3>
                <p className="text-sm text-on-surface-variant mt-1" dangerouslySetInnerHTML={{ __html: t('projectDetails.deleteProjectMsg', { name: project.name }) }} />
              </div>
              <div className="flex gap-3 w-full mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  {t('projectDetails.cancel')}
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-red-500 hover:bg-red-600 border-red-500"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false)
                    handleDeleteProject()
                  }}
                >
                  {t('projectDetails.delete')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Add Milestone Modal ─────────────────────────────────────────────────── */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">{t('projectDetails.createMilestoneModal')}</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsAddMilestoneOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="flex flex-col gap-4">
              <Input
                label={t('projectDetails.milestoneTitle')}
                placeholder={t('projectDetails.milestonePlaceholder')}
                value={milestoneData.title}
                onChange={(e) => setMilestoneData({ ...milestoneData, title: e.target.value })}
                required
              />

              <TextArea
                label={t('projectDetails.milestoneDesc')}
                placeholder={t('projectDetails.milestoneDescPlaceholder')}
                value={milestoneData.description}
                onChange={(e) => setMilestoneData({ ...milestoneData, description: e.target.value })}
              />

              <Input
                label={t('projectDetails.milestoneTargetDate')}
                type="date"
                value={milestoneData.targetDate}
                onChange={(e) => setMilestoneData({ ...milestoneData, targetDate: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{t('projectDetails.colorLabel')}</label>
                <div className="flex gap-2 flex-wrap">
                  {['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMilestoneData({ ...milestoneData, color: c })}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c,
                        borderColor: milestoneData.color === c ? 'white' : 'transparent',
                        transform: milestoneData.color === c ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsAddMilestoneOpen(false)}>
                  {t('projectDetails.cancel')}
                </Button>
                <Button type="submit" disabled={createMilestoneMutation.isPending}>
                  {createMilestoneMutation.isPending ? t('projectDetails.creatingBtn') : t('projectDetails.createMilestone')}
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
              <h3 className="font-heading text-xl font-semibold text-on-surface">{t('projectDetails.editMilestoneTitle')}</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsEditMilestoneOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditMilestoneSubmit} className="flex flex-col gap-4">
              <Input
                label={t('projectDetails.milestoneTitle')}
                value={editMilestoneData.title}
                onChange={(e) => setEditMilestoneData({ ...editMilestoneData, title: e.target.value })}
                required
              />

              <TextArea
                label={t('projectDetails.milestoneDesc')}
                value={editMilestoneData.description}
                onChange={(e) => setEditMilestoneData({ ...editMilestoneData, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label={t('projectDetails.milestoneStatus')}
                  value={editMilestoneData.status}
                  onChange={(e) => setEditMilestoneData({ ...editMilestoneData, status: e.target.value })}
                  options={[
                    { value: 'upcoming', label: t('projectDetails.statusUpcoming') },
                    { value: 'in-progress', label: t('projectDetails.statusInProgress') },
                    { value: 'completed', label: t('projectDetails.statusCompleted') },
                    { value: 'delayed', label: t('projectDetails.statusDelayed') },
                  ]}
                />
                <Input
                  label={t('projectDetails.milestoneTargetDate')}
                  type="date"
                  value={editMilestoneData.targetDate}
                  onChange={(e) => setEditMilestoneData({ ...editMilestoneData, targetDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{t('projectDetails.colorLabel')}</label>
                <div className="flex gap-2 flex-wrap">
                  {['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditMilestoneData({ ...editMilestoneData, color: c })}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c,
                        borderColor: editMilestoneData.color === c ? 'white' : 'transparent',
                        transform: editMilestoneData.color === c ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsEditMilestoneOpen(false)}>
                  {t('projectDetails.cancel')}
                </Button>
                <Button type="submit" disabled={updateMilestoneMutation.isPending}>
                  {updateMilestoneMutation.isPending ? t('projectDetails.savingBtn') : t('projectDetails.saveChanges')}
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
              <h3 className="font-heading text-xl font-semibold text-on-surface">{t('projectDetails.editProjectDetailsTitle')}</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsEditProjectOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleEditProject} className="flex flex-col gap-4">
              <Input
                label={t('projectDetails.projectName')}
                value={projectEditData.name}
                onChange={(e) => setProjectEditData({ ...projectEditData, name: e.target.value })}
                required
              />

              <TextArea
                label={t('projectDetails.description')}
                value={projectEditData.description}
                onChange={(e) => setProjectEditData({ ...projectEditData, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label={t('projectDetails.statusLabel')}
                  value={projectEditData.status}
                  onChange={(e) => setProjectEditData({ ...projectEditData, status: e.target.value })}
                  options={[
                    { value: 'planning', label: t('projects.statusPlanning') },
                    { value: 'active', label: t('projects.statusActive') },
                    { value: 'completed', label: t('projects.statusCompleted') },
                    { value: 'archived', label: t('projects.statusArchived') },
                  ]}
                />

                <Select
                  label={t('projectDetails.priorityLabel')}
                  value={projectEditData.priority}
                  onChange={(e) => setProjectEditData({ ...projectEditData, priority: e.target.value })}
                  options={[
                    { value: 'low', label: t('projects.priorityLow') },
                    { value: 'medium', label: t('projects.priorityMedium') },
                    { value: 'high', label: t('projects.priorityHigh') },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('projectDetails.startDateLabel')}
                  type="date"
                  value={projectEditData.startDate}
                  onChange={(e) => setProjectEditData({ ...projectEditData, startDate: e.target.value })}
                />

                <Input
                  label={t('projectDetails.endDateLabel')}
                  type="date"
                  value={projectEditData.endDate}
                  onChange={(e) => setProjectEditData({ ...projectEditData, endDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsEditProjectOpen(false)}>
                  {t('projectDetails.cancel')}
                </Button>
                <Button type="submit" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? t('projectDetails.savingBtn') : t('projectDetails.saveChanges')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Assign Tasks to Milestone Modal ─────────────────────────────────────── */}
      {assignModalMilestone && projectId && (
        <MilestoneTasksModal
          milestone={assignModalMilestone}
          projectId={projectId}
          allProjectTasks={allProjectTasks}
          onClose={() => setAssignModalMilestone(null)}
          onAssigned={() => {
            fetchEnrichedMilestones()
            fetchAllProjectTasks()
          }}
        />
      )}
    </div>
  )
}
