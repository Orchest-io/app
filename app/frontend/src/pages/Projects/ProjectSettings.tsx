import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Card,
  Button,
  Input,
  Select,
  TextArea,
  Toggle,
} from '../../components/ui'
import { mockDb } from '../../utils/mockDb'

export default function ProjectSettings() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('active')
  const [priority, setPriority] = useState('high')
  const [visibility, setVisibility] = useState('private')
  const [methodology, setMethodology] = useState('agile')
  const [aiLevel, setAiLevel] = useState('balanced')
  const [blueprintsEnabled, setBlueprintsEnabled] = useState(true)
  const [taskSuggestionsEnabled, setTaskSuggestionsEnabled] = useState(true)
  const [riskDetectionEnabled, setRiskDetectionEnabled] = useState(true)
  const [dependencyTrackingEnabled, setDependencyTrackingEnabled] = useState(true)
  const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState(false)

  useEffect(() => {
    if (!projectId) return
    try {
      const project = mockDb.getProject(projectId)
      if (project) {
        setProjectName(project.name)
        setDescription(project.description || '')
        setStatus(project.status)
        setPriority(project.priority)
      }
    } catch (err: any) {
      toast.error('Failed to load project: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const handleSave = () => {
    if (!projectId) return
    if (!projectName.trim()) {
      toast.warning('Project name cannot be empty')
      return
    }

    try {
      setSaving(true)
      mockDb.updateProject(projectId, {
        name: projectName.trim(),
        description,
        status: status as any,
        priority: priority as any,
      })
      toast.success('Project settings saved successfully!')
    } catch (err: any) {
      toast.error('Failed to save settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = () => {
    if (!projectId) return
    try {
      mockDb.updateProject(projectId, { status: 'archived' as any })
      toast.info('Project archived')
      navigate('/projects')
    } catch (err: any) {
      toast.error('Failed to archive project: ' + err.message)
    }
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    if (!projectId) return
    try {
      // Remove from localStorage via direct manipulation (mockDb doesn't expose delete yet)
      const projects = JSON.parse(localStorage.getItem('orchest_projects') || '[]')
      const updated = projects.filter((p: any) => p.id !== projectId)
      localStorage.setItem('orchest_projects', JSON.stringify(updated))

      mockDb.logActivity(projectId, 'delete_project', 'project', 'Project was permanently deleted.')
      toast.success('Project deleted')
      navigate('/projects')
    } catch (err: any) {
      toast.error('Failed to delete project: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-on-surface-variant">Loading project settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="font-heading text-3xl font-semibold text-on-surface">
            Project Settings
          </h1>

          <p className="text-on-surface-variant mt-1">
            Configure how this project operates.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Cancel
          </Button>

          <Button icon="save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

      </div>

      {/* MAIN GRID */}

      <div className="grid xl:grid-cols-[280px_1fr] gap-6">

        {/* LEFT PANEL */}

        <Card className="h-fit">

          <div className="space-y-2">

            <div className="px-3 py-2 rounded-md bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-sm font-medium">
              General
            </div>

            <div className="px-3 py-2 text-sm text-on-surface-variant">
              Team & Access
            </div>

            <div className="px-3 py-2 text-sm text-on-surface-variant">
              Workflow
            </div>

            <div className="px-3 py-2 text-sm text-on-surface-variant">
              AI Configuration
            </div>

            <div className="px-3 py-2 text-sm text-on-surface-variant">
              Danger Zone
            </div>

          </div>

        </Card>

        {/* CONTENT */}

        <div className="space-y-6">

          {/* GENERAL */}

          <Card>

            <h2 className="font-heading text-xl font-semibold mb-6">
              General
            </h2>

            <div className="space-y-5">

              <Input
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <TextArea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="grid md:grid-cols-2 gap-4">

                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'planning', label: 'Planning' },
                    { value: 'active', label: 'Active' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />

                <Select
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />

              </div>

            </div>

          </Card>

          {/* TEAM */}

          <Card>

            <h2 className="font-heading text-xl font-semibold mb-6">
              Team & Access
            </h2>

            <div className="space-y-5">

              <Select
                label="Visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                options={[
                  { value: 'private', label: 'Private Workspace' },
                  { value: 'team', label: 'Team Workspace' },
                  { value: 'organization', label: 'Organization' },
                ]}
              />

              <Input
                label="Project Owner"
                value="Omar Ibrahim"
                readOnly
              />

            </div>

          </Card>

          {/* WORKFLOW */}

          <Card>

            <h2 className="font-heading text-xl font-semibold mb-6">
              Workflow
            </h2>

            <div className="space-y-5">

              <Select
                label="Methodology"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                options={[
                  { value: 'agile', label: 'Agile' },
                  { value: 'scrum', label: 'Scrum' },
                  { value: 'kanban', label: 'Kanban' },
                ]}
              />

              <div className="flex flex-col gap-4">

                <Toggle
                  label="Auto Task Assignment"
                  checked={autoAssignmentEnabled}
                  onChange={(e) => setAutoAssignmentEnabled(e.target.checked)}
                />

                <Toggle
                  label="Dependency Tracking"
                  checked={dependencyTrackingEnabled}
                  onChange={(e) => setDependencyTrackingEnabled(e.target.checked)}
                />

              </div>

            </div>

          </Card>

          {/* AI */}

          <Card>

            <h2 className="font-heading text-xl font-semibold mb-6">
              AI Configuration
            </h2>

            <div className="space-y-5">

              <Select
                label="AI Assistance Level"
                value={aiLevel}
                onChange={(e) => setAiLevel(e.target.value)}
                options={[
                  { value: 'minimal', label: 'Minimal' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'aggressive', label: 'Aggressive' },
                ]}
              />

              <div className="flex flex-col gap-4">

                <Toggle
                  label="Blueprint Generation"
                  checked={blueprintsEnabled}
                  onChange={(e) => setBlueprintsEnabled(e.target.checked)}
                />

                <Toggle
                  label="AI Task Suggestions"
                  checked={taskSuggestionsEnabled}
                  onChange={(e) => setTaskSuggestionsEnabled(e.target.checked)}
                />

                <Toggle
                  label="Risk Detection"
                  checked={riskDetectionEnabled}
                  onChange={(e) => setRiskDetectionEnabled(e.target.checked)}
                />

              </div>

            </div>

          </Card>

          {/* DANGER ZONE */}

          <Card
            variant="outlined"
            className="border-red-500/20"
          >

            <h2 className="font-heading text-xl font-semibold text-red-400 mb-3">
              Danger Zone
            </h2>

            <p className="text-sm text-on-surface-variant mb-6">
              Archive or permanently remove this project.
            </p>

            <div className="flex flex-wrap gap-3">

              <Button variant="secondary" onClick={handleArchive}>
                Archive Project
              </Button>

              {confirmDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-400">Are you sure? This cannot be undone.</span>
                  <Button onClick={handleDelete}>
                    Yes, Delete
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={handleDelete}>
                  Delete Project
                </Button>
              )}

            </div>

          </Card>

        </div>

      </div>

    </div>
  )
}
