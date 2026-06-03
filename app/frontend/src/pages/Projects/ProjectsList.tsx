import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, ProgressBar, Button, Input, Select, TextArea } from '../../components/ui'
import { mockDb } from '../../utils/mockDb'

type Project = {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high'
  progress: number
  startDate?: string
  endDate?: string
}

export default function ProjectsList() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchProjects = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        const data = mockDb.getProjects()
        setProjects(data as any)
      } catch (err: any) {
        toast.error('Failed to load projects: ' + err.message)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.warning('Please enter a project name')
      return
    }

    try {
      setSubmitting(true)
      mockDb.createProject(formData as any)
      toast.success('Project created successfully!')
      setIsModalOpen(false)
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
      })
      fetchProjects()
    } catch (err: any) {
      toast.error('Failed to create project: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
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
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'active':
        return 'text-electric-blue bg-electric-blue/10 border-electric-blue/20'
      case 'archived':
        return 'text-on-surface-variant bg-surface-glass border-border-low'
      default:
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-heading text-[32px] font-semibold text-on-surface">
            Workspace Projects
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage your project lifecycles, track phase progress, and coordinate delivery.
          </p>
        </div>

        <Button icon="add" onClick={() => setIsModalOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-surface-container rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-surface-container rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-surface-container rounded w-1/2 mb-6"></div>
              <div className="h-2 bg-surface-container rounded w-full mb-3"></div>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-surface-glass border border-border-low flex items-center justify-center text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-[32px]">tactic</span>
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">No Projects Found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
            Create your first workspace project to start tracking tasks, managing teams, and mapping milestones.
          </p>
          <Button icon="add" onClick={() => setIsModalOpen(true)}>
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              hoverable
              onClick={() => navigate(`/projects/${project.id}`)}
              className="flex flex-col h-full justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-heading text-lg font-semibold text-on-surface hover:text-electric-blue transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant mb-6 line-clamp-3 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-on-surface-variant mb-2">
                  <span>Progress</span>
                  <span className="font-semibold text-on-surface">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} glow className="mb-4" />

                <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2 border-t border-border-low">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    View Details
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">
                Create New Project
              </h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Project Name"
                placeholder="e.g. Core System Migration"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <TextArea
                label="Description"
                placeholder="Brief summary of the goals, context, and dependencies..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'planning', label: 'Planning' },
                    { value: 'active', label: 'Active' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />

                <Select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />

                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
