import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, Button, Input, Select, TextArea } from '../../components/ui'
import { useCreateProject } from '../../hooks/useProjectMutations'
import apiClient from '../../api/client'

type ProjectMode = 'ai' | 'manual' | null
type ProjectType = 'team' | 'individual' | null

export default function CreateProjectWizard() {
  const navigate = useNavigate()
  const createProjectMutation = useCreateProject()

  // Wizard state
  const [step, setStep] = useState(1)
  const [projectMode, setProjectMode] = useState<ProjectMode>(null)
  const [projectType, setProjectType] = useState<ProjectType>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
  })

  // Planning data (Step 4)
  const [milestones, setMilestones] = useState<Array<{ 
    title: string
    description: string
    targetDate: string
  }>>([])
  const [tasks, setTasks] = useState<Array<{ 
    title: string
    description: string
    priority: string
    dueDate: string
    assignedTo: string
    status: string
  }>>([])
  const [teamMembers, setTeamMembers] = useState<Array<{ 
    email: string
    role: string
    skills: string
    status: string
  }>>([])

  // Modals state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)

  // Modal forms state
  const [milestoneForm, setMilestoneForm] = useState({ 
    title: '', 
    description: '', 
    targetDate: ''
  })
  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    status: 'todo'
  })
  const [memberForm, setMemberForm] = useState({ 
    email: '', 
    role: '',
    skills: '',
    status: 'available'
  })

  const submitting = createProjectMutation.isPending

  // Milestone handlers
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!milestoneForm.title.trim()) {
      toast.warning('Please enter milestone title')
      return
    }
    if (!milestoneForm.description.trim()) {
      toast.warning('Please enter milestone description')
      return
    }
    if (!milestoneForm.targetDate) {
      toast.warning('Please select target date')
      return
    }
    setMilestones([...milestones, { ...milestoneForm }])
    setMilestoneForm({ title: '', description: '', targetDate: '' })
    setIsMilestoneModalOpen(false)
    toast.success('Milestone added!')
  }

  // Task handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.title.trim()) {
      toast.warning('Please enter task title')
      return
    }
    if (!taskForm.description.trim()) {
      toast.warning('Please enter task description')
      return
    }
    setTasks([...tasks, { ...taskForm }])
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '', status: 'todo' })
    setIsTaskModalOpen(false)
    toast.success('Task added!')
  }

  // Member handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberForm.email.trim()) {
      toast.warning('Please enter email address')
      return
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(memberForm.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!memberForm.role || memberForm.role === '') {
      toast.warning('Please select a role')
      return
    }
    // Check duplicate
    if (teamMembers.some(m => m.email === memberForm.email)) {
      toast.error('This member is already added')
      return
    }

    // TODO: Validate user exists in backend
    // For now, just add to list
    setTeamMembers([...teamMembers, { ...memberForm }])
    setMemberForm({ email: '', role: '', skills: '', status: 'available' })
    setIsMemberModalOpen(false)
    toast.success('Team member added!')
  }

  // Step 1: Choose Mode (AI vs Manual)
  const renderModeSelection = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
          Create New Project
        </h2>
        <p className="text-sm text-on-surface-variant">
          How would you like to create your project?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI-Powered Option */}
        <Card
          variant="glass"
          padding="lg"
          hoverable
          onClick={() => toast.info('AI-Powered project creation is coming soon!')}
          className="relative overflow-hidden"
        >
          <div className="absolute top-3 right-3">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-purple-400/20 text-purple-400 border border-purple-400/30">
              Coming Soon
            </span>
          </div>
          
          <div className="flex flex-col items-center text-center pt-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-electric-blue/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-purple-400">
                auto_awesome
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">
              AI-Powered Planning
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Let AI help you structure your project with intelligent suggestions and automated planning.
            </p>
          </div>
        </Card>

        {/* Manual Option */}
        <Card
          variant="glass"
          padding="lg"
          hoverable
          onClick={() => {
            setProjectMode('manual')
            setStep(2)
          }}
          className="border-2 border-electric-blue/30 hover:border-electric-blue/50"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue/20 to-emerald-400/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-electric-blue">
                edit_note
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">
              Manual Planning
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Build your project from scratch with full control over every detail and timeline.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          Cancel
        </Button>
      </div>
    </div>
  )

  // Step 2: Choose Type (Team vs Individual)
  const renderTypeSelection = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
          Choose Project Type
        </h2>
        <p className="text-sm text-on-surface-variant">
          Will you be working alone or with a team?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Project */}
        <Card
          variant="glass"
          padding="lg"
          hoverable
          onClick={() => {
            setProjectType('team')
            setStep(3)
          }}
          className="border-2 border-electric-blue/30 hover:border-electric-blue/50"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue/20 to-emerald-400/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-electric-blue">
                groups
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">
              Team Project
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Collaborate with team members, assign roles, and track collective progress.
            </p>
          </div>
        </Card>

        {/* Individual Project */}
        <Card
          variant="glass"
          padding="lg"
          hoverable
          onClick={() => {
            setProjectType('individual')
            setStep(3)
          }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-amber-400">
                person
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">
              Individual Project
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Work independently on your project with personal task management and tracking.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button variant="ghost" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          Cancel
        </Button>
      </div>
    </div>
  )

  // Step 3: Basic Information Form
  const renderBasicInfoForm = () => {
    const handleContinue = (e: React.FormEvent) => {
      e.preventDefault()

      // Validation
      if (!formData.name.trim()) {
        toast.warning('Please enter a project name')
        return
      }
      if (!formData.description.trim()) {
        toast.warning('Please enter a project description')
        return
      }
      if (!formData.startDate) {
        toast.warning('Please select a start date')
        return
      }
      if (!formData.endDate) {
        toast.warning('Please select an end date')
        return
      }

      // Go to Step 4 (Planning)
      setStep(4)
    }

    const handleCreateNow = (e: React.FormEvent) => {
      e.preventDefault()

      // Validation
      if (!formData.name.trim()) {
        toast.warning('Please enter a project name')
        return
      }
      if (!formData.description.trim()) {
        toast.warning('Please enter a project description')
        return
      }
      if (!formData.startDate) {
        toast.warning('Please select a start date')
        return
      }
      if (!formData.endDate) {
        toast.warning('Please select an end date')
        return
      }

      // Create project immediately with correct field mappings
      const projectData = {
        ...formData,
        projectType: projectMode, // 'ai' or 'manual'
        projectMode: projectType, // 'team' or 'individual'
      }

      createProjectMutation.mutate(projectData as any, {
        onSuccess: () => {
          toast.success('Project created successfully!')
          navigate('/projects')
        },
        onError: (error: any) => {
          const errorMsg = error?.response?.data?.message || 'Failed to create project'
          toast.error(errorMsg)
          console.error('Project creation error:', error)
        },
      })
    }

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
            Create New Project
          </h2>
          <p className="text-sm text-on-surface-variant">
            Fill in the project details to get started
          </p>
        </div>

        {/* Project Mode & Type Badge */}
        <div className="flex gap-2 mb-6">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
            Manual
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-surface-glass text-on-surface-variant border border-border-low">
            {projectType === 'team' ? 'Team' : 'Individual'}
          </span>
        </div>

        <form onSubmit={handleContinue}>
          <Card variant="glass" padding="lg">
            {/* Basic Information Section */}
            <div className="mb-8">
              <h3 className="font-heading text-sm font-semibold text-on-surface mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Basic Information
              </h3>

              <div className="flex flex-col gap-4">
                <Input
                  label="Project Name"
                  placeholder="e.g. Website Redesign Project"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <TextArea
                  label="Description"
                  placeholder="Describe the project goals, scope, and expected outcomes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />

                  <Input
                    label="Target End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    required
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
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-border-low">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(2)}
                disabled={submitting}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCreateNow}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Now'}
              </Button>
              <Button type="submit" disabled={submitting}>
                Continue to Planning
              </Button>
            </div>
          </Card>
        </form>
      </div>
    )
  }

  // Step 4: Planning Details (Optional)
  const renderPlanningDetails = () => {
    const handleFinalCreate = async () => {
      try {
        // 1. Create project first with correct field mappings
        const projectData = {
          ...formData,
          projectType: projectMode, // 'ai' or 'manual'
          projectMode: projectType, // 'team' or 'individual'
        }

        toast.info('Creating project...')
        const newProject = await createProjectMutation.mutateAsync(projectData as any)
        
        if (!newProject || !newProject.id) {
          toast.error('Failed to create project')
          return
        }

        const projectId = newProject.id
        toast.success('Project created!')

        // 2. Add milestones (if any)
        if (milestones.length > 0) {
          toast.info(`Adding ${milestones.length} milestone(s)...`)
          for (const milestone of milestones) {
            try {
              // Convert date to ISO format if provided
              const targetDate = milestone.targetDate 
                ? new Date(milestone.targetDate).toISOString() 
                : undefined

              await apiClient.post(`/projects/${projectId}/milestones`, {
                title: milestone.title,
                description: milestone.description,
                targetDate,
              })
            } catch (err: any) {
              console.error('Failed to add milestone:', err)
              const errorMsg = err?.response?.data?.message || 'Unknown error'
              toast.error(`Failed to add milestone "${milestone.title}": ${errorMsg}`)
            }
          }
          toast.success('Milestones added!')
        }

        // 3. Add tasks (if any)
        if (tasks.length > 0) {
          toast.info(`Adding ${tasks.length} task(s)...`)
          for (const task of tasks) {
            try {
              await apiClient.post(`/tasks`, { 
                projectId,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate || undefined,
                assignedTo: task.assignedTo || undefined,
              })
            } catch (err: any) {
              console.error('Failed to add task:', err)
              const errorMsg = err?.response?.data?.message || 'Unknown error'
              toast.error(`Failed to add task "${task.title}": ${errorMsg}`)
            }
          }
          toast.success('Tasks added!')
        }

        // 4. Add team members (if any)
        if (teamMembers.length > 0) {
          toast.info(`Adding ${teamMembers.length} team member(s)...`)
          for (const member of teamMembers) {
            try {
              await apiClient.post(`/projects/${projectId}/members/by-email`, {
                email: member.email,
                role: 'member',
                jobTitle: member.role,
                skills: member.skills || undefined,
                status: member.status,
              })
              toast.success(`Added ${member.email}`)
            } catch (err: any) {
              const errorMsg = err?.response?.data?.message || err.message || 'Unknown error'
              if (err?.response?.status === 404) {
                toast.error(`User not found: ${member.email}`)
              } else if (err?.response?.status === 409) {
                toast.error(`${member.email} is already a member`)
              } else {
                toast.error(`Failed to add ${member.email}: ${errorMsg}`)
              }
              console.error('Failed to add member:', err)
            }
          }
          toast.success('Team members added!')
        }

        // Navigate to projects list
        toast.success('Project setup complete!')
        navigate('/projects')
      } catch (error: any) {
        console.error('Project creation failed:', error)
        const errorMsg = error?.response?.data?.message || error.message || 'Failed to create project'
        toast.error(errorMsg)
      }
    }

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
            Project Planning
          </h2>
          <p className="text-sm text-on-surface-variant">
            Add milestones, tasks, and team members (optional)
          </p>
        </div>

        {/* Project Summary Card */}
        <Card variant="glass" padding="lg" className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-heading text-lg font-semibold text-on-surface mb-1">
                {formData.name}
              </h3>
              <p className="text-sm text-on-surface-variant mb-3">
                {formData.description}
              </p>
              <div className="flex gap-4 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {formData.startDate} - {formData.endDate}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">flag</span>
                  Priority: {formData.priority}
                </span>
                {projectType && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      {projectType === 'team' ? 'groups' : 'person'}
                    </span>
                    {projectType === 'team' ? 'Team' : 'Individual'}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="edit"
              onClick={() => setStep(3)}
            >
              Edit
            </Button>
          </div>
        </Card>

        {/* Planning Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Milestones */}
          <Card variant="glass" padding="lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-base font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">flag</span>
                Project Milestones
              </h3>
              <span className="text-xs text-on-surface-variant">
                {milestones.length} added
              </span>
            </div>

            {milestones.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">
                  flag
                </span>
                <p className="text-xs text-on-surface-variant">
                  No milestones added yet
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {milestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-container-low border border-border-low"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-on-surface mb-1">
                          {milestone.title}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                          {milestone.description}
                        </p>
                        {milestone.targetDate && (
                          <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                            {milestone.targetDate}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setMilestones(milestones.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon="add"
              onClick={() => setIsMilestoneModalOpen(true)}
              className="w-full"
            >
              Add Milestone
            </Button>
          </Card>

          {/* Tasks */}
          <Card variant="glass" padding="lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-base font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
                Task Timeline
              </h3>
              <span className="text-xs text-on-surface-variant">
                {tasks.length} added
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">
                  task_alt
                </span>
                <p className="text-xs text-on-surface-variant">
                  No tasks added yet
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-container-low border border-border-low"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-on-surface">
                            {task.title}
                          </p>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                            task.priority === 'high' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                            task.priority === 'medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                            'text-blue-400 bg-blue-400/10 border-blue-400/20'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border text-electric-blue bg-electric-blue/10 border-electric-blue/20">
                            {task.status}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">schedule</span>
                              {task.dueDate}
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">person</span>
                              {task.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setTasks(tasks.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon="add"
              onClick={() => setIsTaskModalOpen(true)}
              className="w-full"
            >
              Add Task
            </Button>
          </Card>

          {/* Team Members */}
          <Card variant="glass" padding="lg" className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-base font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">group</span>
                Team Allocation
              </h3>
              <span className="text-xs text-on-surface-variant">
                {teamMembers.length} added
              </span>
            </div>

            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">
                  group
                </span>
                <p className="text-xs text-on-surface-variant">
                  No team members added yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {teamMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-container-low border border-border-low"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {member.email}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {member.role}
                        </p>
                        {member.skills && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.skills.split(',').slice(0, 2).map((skill, sidx) => (
                              <span key={sidx} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-glass border border-border-low text-on-surface-variant">
                                {skill.trim()}
                              </span>
                            ))}
                            {member.skills.split(',').length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-glass border border-border-low text-on-surface-variant">
                                +{member.skills.split(',').length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border inline-block mt-1 ${
                          member.status === 'available' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                          member.status === 'busy' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                          'text-red-400 bg-red-400/10 border-red-400/20'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                      <button
                        onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon="add"
              onClick={() => setIsMemberModalOpen(true)}
              className="w-full"
            >
              Add Member
            </Button>
          </Card>
        </div>

        {/* Final Actions */}
        <Card variant="glass" padding="lg">
          <div className="text-center mb-4">
            <h3 className="font-heading text-base font-semibold text-on-surface mb-1">
              Ready to Create?
            </h3>
            <p className="text-xs text-on-surface-variant">
              Review your project plan and save to create the project
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(3)}
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/projects')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalCreate}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Save & Create Project'}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Render current step
  return (
    <div className="min-h-screen py-12 px-4">
      {step === 1 && renderModeSelection()}
      {step === 2 && renderTypeSelection()}
      {step === 3 && renderBasicInfoForm()}
      {step === 4 && renderPlanningDetails()}

      {/* Add Milestone Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Add Milestone</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsMilestoneModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="flex flex-col gap-4">
              <Input
                label="Milestone Title"
                placeholder="e.g. MVP Launch"
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                required
              />

              <TextArea
                label="Description"
                placeholder="Detailed description of this milestone and its objectives..."
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                rows={4}
                required
              />

              <Input
                label="Target Date"
                type="date"
                value={milestoneForm.targetDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                required
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsMilestoneModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Milestone</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Add Task</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsTaskModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTask} className="flex flex-col gap-4">
              <Input
                label="Task Title"
                placeholder="e.g. Design homepage mockup"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
              />

              <TextArea
                label="Description"
                placeholder="Detailed description of the task requirements and acceptance criteria..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={4}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  required
                />

                <Select
                  label="Status"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  options={[
                    { value: 'todo', label: 'To Do' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'review', label: 'Review' },
                    { value: 'done', label: 'Done' },
                  ]}
                  required
                />
              </div>

              <Input
                label="Due Date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                required
              />

              <Input
                label="Assigned To (Email - Optional)"
                type="email"
                placeholder="teammate@example.com"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                helperText="Leave empty to assign later"
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsTaskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Task</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Team Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Add Team Member</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsMemberModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="teammate@example.com"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                required
                helperText="Must be a registered user"
              />

              <Select
                label="Role"
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                options={[
                  { value: '', label: 'Select Position' },
                  { value: 'Full Stack Engineer', label: 'Full Stack Engineer' },
                  { value: 'Backend Developer', label: 'Backend Developer' },
                  { value: 'Frontend Developer', label: 'Frontend Developer' },
                  { value: 'AI Specialist', label: 'AI Specialist' },
                  { value: 'Product Designer', label: 'Product Designer' },
                  { value: 'QA Engineer', label: 'QA Engineer' },
                  { value: 'DevOps Engineer', label: 'DevOps Engineer' },
                  { value: 'Project Manager', label: 'Project Manager' },
                ]}
                required
              />

              <TextArea
                label="Skills"
                placeholder="e.g. React, Node.js, TypeScript, UI/UX Design"
                value={memberForm.skills}
                onChange={(e) => setMemberForm({ ...memberForm, skills: e.target.value })}
                rows={3}
              />

              <Select
                label="Status"
                value={memberForm.status}
                onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                options={[
                  { value: 'available', label: 'Available' },
                  { value: 'busy', label: 'Busy' },
                  { value: 'on-leave', label: 'On Leave' },
                ]}
                required
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsMemberModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Member</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
