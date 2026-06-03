import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, ProgressBar, Tabs, Button, Input, Select, TextArea } from '../../../components/ui'
import { mockDb } from '../../../utils/mockDb'

type User = {
  id: string
  fullName: string
  email: string
  avatarUrl?: string
}

type ProjectMember = {
  id: string
  userId: string
  role?: string
  joinedAt: string
  user?: User
}

type Milestone = {
  id: string
  title: string
  description?: string
  status?: string
  progress: number
  targetDate?: string
}

type Task = {
  id: string
  title: string
  description?: string
  type: string // feature | bug | improvement
  status: string // backlog | todo | in-progress | done
  priority: string // low | medium | high | urgent
  dueDate?: string
}

type ActivityLog = {
  id: string
  action: string
  entityType: string
  description: string
  createdAt: string
}

type Project = {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high'
  progress: number
  startDate?: string
  endDate?: string
  members?: ProjectMember[]
  milestones?: Milestone[]
  tasks?: Task[]
  activityLogs?: ActivityLog[]
}

export default function ProjectDetailsOverview() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Modals / forms state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [memberRole, setMemberRole] = useState('Developer')

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    type: 'feature',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  })

  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false)
  const [milestoneData, setMilestoneData] = useState({
    title: '',
    description: '',
    targetDate: '',
  })

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [projectEditData, setProjectEditData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
  })

  const fetchProjectDetails = () => {
    if (!projectId) return
    setLoading(true)
    setTimeout(() => {
      try {
        const data = mockDb.getProject(projectId)
        if (data) {
          setProject(data as any)
          setProjectEditData({
            name: data.name,
            description: data.description || '',
            status: data.status,
            priority: data.priority,
            startDate: data.startDate ? data.startDate.split('T')[0] : '',
            endDate: data.endDate ? data.endDate.split('T')[0] : '',
          })
        } else {
          setProject(null)
        }
      } catch (err: any) {
        toast.error('Failed to load project details: ' + err.message)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const fetchUsers = () => {
    try {
      const data = mockDb.getUsers()
      setAllUsers(data as any)
      if (data.length > 0) {
        setSelectedUserId(data[0].id)
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
    }
  }

  useEffect(() => {
    fetchProjectDetails()
    fetchUsers()
  }, [projectId])

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !projectId) {
      toast.warning('Please select a user')
      return
    }

    try {
      mockDb.addProjectMember(projectId, selectedUserId, memberRole)
      toast.success('Team member added successfully!')
      setIsAddMemberOpen(false)
      fetchProjectDetails()
    } catch (err: any) {
      toast.error('Failed to add member: ' + err.message)
    }
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskData.title.trim() || !projectId) {
      toast.warning('Please enter a task title')
      return
    }

    try {
      mockDb.createTask({
        ...taskData,
        projectId,
      })
      toast.success('Task created successfully!')
      setIsAddTaskOpen(false)
      setTaskData({
        title: '',
        description: '',
        type: 'feature',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
      })
      fetchProjectDetails()
    } catch (err: any) {
      toast.error('Failed to create task: ' + err.message)
    }
  }

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!milestoneData.title.trim() || !projectId) {
      toast.warning('Please enter a milestone title')
      return
    }

    try {
      mockDb.createMilestone({
        ...milestoneData,
        projectId,
        progress: 0,
      })
      toast.success('Milestone created successfully!')
      setIsAddMilestoneOpen(false)
      setMilestoneData({
        title: '',
        description: '',
        targetDate: '',
      })
      fetchProjectDetails()
    } catch (err: any) {
      toast.error('Failed to create milestone: ' + err.message)
    }
  }

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectEditData.name.trim() || !projectId) {
      toast.warning('Please enter a project name')
      return
    }

    try {
      mockDb.updateProject(projectId, projectEditData as any)
      toast.success('Project updated successfully!')
      setIsEditProjectOpen(false)
      fetchProjectDetails()
    } catch (err: any) {
      toast.error('Failed to update project: ' + err.message)
    }
  }

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

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-on-surface-variant">Loading project details...</p>
      </div>
    )
  }

  if (!project) {
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
          <Button variant="secondary" icon="edit" onClick={() => setIsEditProjectOpen(true)}>
            Edit Project
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultTab="overview"
        onChange={setActiveTab}
        tabs={[
          { key: 'overview', label: 'Overview', icon: 'dashboard' },
          { key: 'tasks', label: `Tasks (${project.tasks?.length || 0})`, icon: 'task_alt' },
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
                {project.progress}%
              </p>
              <ProgressBar value={project.progress} glow />
            </Card>

            <Card>
              <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
                Status
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded border ${getStatusColor(project.status)}`}>
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
                <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded border ${getPriorityColor(project.priority)}`}>
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
                <Button variant="secondary" size="sm" icon="add" onClick={() => setIsAddMemberOpen(true)}>
                  Add Member
                </Button>
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
                          {member.user?.fullName || 'Unknown User'}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {member.role || 'Member'} • Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-glass border border-border-low px-2.5 py-1 rounded-sm">
                        {member.user?.email || 'N/A'}
                      </span>
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
                {!project.activityLogs || project.activityLogs.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic">No activities logged yet.</p>
                ) : (
                  project.activityLogs.slice(0, 5).map((log) => (
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading text-lg font-semibold text-on-surface">Project Tasks</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Tasks scope for active milestones.</p>
            </div>
            <Button icon="add" onClick={() => setIsAddTaskOpen(true)}>Create Task</Button>
          </div>

          {!project.tasks || project.tasks.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-3">task_alt</span>
              <p className="text-sm text-on-surface-variant font-medium">No tasks found for this project</p>
              <p className="text-xs text-on-surface-variant/60 mt-1 mb-4">Get started by creating the first task.</p>
              <Button size="sm" icon="add" onClick={() => setIsAddTaskOpen(true)}>Add Task</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {project.tasks.map((task) => (
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
                      {milestone.targetDate && (
                        <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                          {new Date(milestone.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">{milestone.description || 'No description provided.'}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-on-surface-variant">Progress</span>
                      <span className="font-semibold text-on-surface">{milestone.progress}%</span>
                    </div>
                    <ProgressBar value={milestone.progress} />
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
            {!project.activityLogs || project.activityLogs.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">No activity logs recorded yet.</p>
            ) : (
              project.activityLogs.map((log) => (
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

      {/* Add Member Modal */}
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
              <Select
                label="Workspace User"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                options={allUsers.map((user) => ({
                  value: user.id,
                  label: `${user.fullName} (${user.email})`,
                }))}
              />

              <Input
                label="Role Title"
                placeholder="e.g. Frontend Engineer, Product Owner"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                required
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsAddMemberOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Member</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Create Project Task</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsAddTaskOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTask} className="flex flex-col gap-4">
              <Input
                label="Task Title"
                placeholder="e.g. Implement OAuth Flow"
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                required
              />

              <TextArea
                label="Description"
                placeholder="Enter details of what needs to be done..."
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type"
                  value={taskData.type}
                  onChange={(e) => setTaskData({ ...taskData, type: e.target.value })}
                  options={[
                    { value: 'feature', label: 'Feature' },
                    { value: 'bug', label: 'Bug' },
                    { value: 'improvement', label: 'Improvement' },
                  ]}
                />

                <Select
                  label="Priority"
                  value={taskData.priority}
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={taskData.status}
                  onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
                  options={[
                    { value: 'backlog', label: 'Backlog' },
                    { value: 'todo', label: 'Todo' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'done', label: 'Done' },
                  ]}
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsAddTaskOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Milestone Modal */}
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
                <Button type="submit">Create Milestone</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Project Modal */}
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
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}