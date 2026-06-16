import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, Button, Input, Select, TextArea, ProgressBar } from '../../components/ui'
import { useTranslation } from 'react-i18next'
import { useCreateProject } from '../../hooks/useProjectMutations'
import { useStartGeneration, useJobProgress, useJobStatus, useAcceptPlan } from '../../hooks/useAiPlanning'
import { useUsers } from '../../hooks/useUsers'
import type { GenerateProjectPlanDto } from '@orchest/shared'
import { AiDescriptionGenerator, AiUpgradeModal } from '../../components/AI'

type ProjectMode = 'ai' | 'manual' | null
type ProjectType = 'team' | 'individual' | null

export default function CreateProjectWizard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const createProjectMutation = useCreateProject()
  const startGenerationMutation = useStartGeneration()
  const acceptPlanMutation = useAcceptPlan()
  const { data: allUsers = [], isLoading: isLoadingUsers } = useUsers()

  // Wizard state
  const [step, setStep] = useState(1)
  const [projectMode, setProjectMode] = useState<ProjectMode>(null)
  const [projectType, setProjectType] = useState<ProjectType>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // AI state
  const [aiJobId, setAiJobId] = useState<string | null>(null)
  const [editablePlan, setEditablePlan] = useState<any>(null) // For editing AI plan before accepting

  // AI Edit Modals state
  const [isAiMilestoneModalOpen, setIsAiMilestoneModalOpen] = useState(false)
  const [isAiTaskModalOpen, setIsAiTaskModalOpen] = useState(false)
  const [editingAiMilestoneIndex, setEditingAiMilestoneIndex] = useState<number | null>(null)
  const [editingAiTaskIndices, setEditingAiTaskIndices] = useState<{milestoneIdx: number, taskIdx: number} | null>(null)
  const [aiMilestoneForm, setAiMilestoneForm] = useState({ title: '', description: '', estimatedWeeks: 1 })
  const [aiTaskForm, setAiTaskForm] = useState({ 
    title: '', 
    description: '', 
    type: 'feature',
    priority: 'medium',
    estimatedHours: 1,
  })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
  })

  // Story Point Configs state
  const [storyPointConfigs, setStoryPointConfigs] = useState([
    { storyPointValue: 1, hoursEquivalent: 4 },
    { storyPointValue: 2, hoursEquivalent: 8 },
    { storyPointValue: 3, hoursEquivalent: 16 },
    { storyPointValue: 5, hoursEquivalent: 40 },
    { storyPointValue: 8, hoursEquivalent: 80 },
    { storyPointValue: 13, hoursEquivalent: 120 },
  ])

  // AI Input Form state
  const [aiFormData, setAiFormData] = useState({
    description: '',
    goals: '',
    timelinePreference: 'normal' as 'urgent' | 'normal' | 'flexible',
    teamMembers: [] as Array<{
      email: string
      name: string
      jobTitle: string
      skills: string
      availability: 'full-time' | 'part-time'
    }>,
  })

  // Expanded milestones in AI preview
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set())

  const toggleMilestone = (idx: number) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  // AI Progress tracking
  const { progress: sseProgress, stage: sseStage, isConnected } = useJobProgress(aiJobId)
  const { data: jobData } = useJobStatus(aiJobId, !isConnected && !!aiJobId)
  const aiProgress = isConnected ? sseProgress : (jobData?.progress ?? 0)
  const aiStage = isConnected ? sseStage : (jobData?.currentStage ?? '')

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
    status: string
    milestoneId?: string
  }>>([])
  const [teamMembers, setTeamMembers] = useState<Array<{ 
    email: string
    role: 'owner' | 'member'
    jobTitle?: string
    skills?: string
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
    status: 'todo',
    milestoneId: ''
  })
  const [memberForm, setMemberForm] = useState({ 
    email: '', 
    role: 'member' as 'owner' | 'member',
    jobTitle: '',
    skills: ''
  })

  const submitting = createProjectMutation.isPending

  // AI Preview CRUD Handlers
  const handleEditProjectName = (newName: string) => {
    if (!editablePlan) return
    setEditablePlan({ ...editablePlan, projectName: newName })
  }

  const handleEditMilestone = (milestoneIdx: number) => {
    if (!editablePlan) return
    const milestone = editablePlan.milestones[milestoneIdx]
    setAiMilestoneForm({
      title: milestone.title,
      description: milestone.description,
      estimatedWeeks: milestone.estimatedWeeks || 1,
    })
    setEditingAiMilestoneIndex(milestoneIdx)
    setIsAiMilestoneModalOpen(true)
  }

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editablePlan) return
    if (!aiMilestoneForm.title.trim()) {
      toast.warning(t('wizard.enterMilestoneTitle'))
      return
    }

    const updatedMilestones = [...editablePlan.milestones]
    if (editingAiMilestoneIndex !== null) {
      // Edit existing
      updatedMilestones[editingAiMilestoneIndex] = {
        ...updatedMilestones[editingAiMilestoneIndex],
        ...aiMilestoneForm,
      }
      toast.success(t('wizard.milestoneUpdated'))
    } else {
      // Add new
      updatedMilestones.push({
        ...aiMilestoneForm,
        order: updatedMilestones.length + 1,
        tasks: [],
      })
      toast.success(t('wizard.milestoneAdded'))
    }

    setEditablePlan({ ...editablePlan, milestones: updatedMilestones })
    setIsAiMilestoneModalOpen(false)
    setEditingAiMilestoneIndex(null)
    setAiMilestoneForm({ title: '', description: '', estimatedWeeks: 1 })
  }

  const handleDeleteMilestone = (milestoneIdx: number) => {
    if (!editablePlan) return
    if (!confirm(t('wizard.deleteMilestoneConfirm'))) return
    const updatedMilestones = editablePlan.milestones.filter((_: any, i: number) => i !== milestoneIdx)
    setEditablePlan({ ...editablePlan, milestones: updatedMilestones })
    toast.success(t('wizard.milestoneDeleted'))
  }

  const handleEditTask = (milestoneIdx: number, taskIdx: number) => {
    if (!editablePlan) return
    const task = editablePlan.milestones[milestoneIdx].tasks[taskIdx]
    setAiTaskForm({
      title: task.title,
      description: task.description,
      type: task.type || 'feature',
      priority: task.priority || 'medium',
      estimatedHours: task.estimatedHours || 1,
    })
    setEditingAiTaskIndices({ milestoneIdx, taskIdx })
    setIsAiTaskModalOpen(true)
  }

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editablePlan) return
    if (!aiTaskForm.title.trim()) {
      toast.warning(t('wizard.enterTaskTitle'))
      return
    }
    if (!editingAiTaskIndices) {
      toast.error(t('wizard.invalidState', { defaultValue: 'Invalid state' }))
      return
    }

    const updatedMilestones = [...editablePlan.milestones]
    const { milestoneIdx, taskIdx } = editingAiTaskIndices
    
    if (taskIdx >= 0) {
      // Edit existing task
      updatedMilestones[milestoneIdx].tasks[taskIdx] = {
        ...updatedMilestones[milestoneIdx].tasks[taskIdx],
        ...aiTaskForm,
      }
      toast.success(t('wizard.taskUpdated'))
    } else {
      // Add new task
      updatedMilestones[milestoneIdx].tasks.push({
        ...aiTaskForm,
        suggestedAssignee: null,
        requiredSkills: [],
        dependencies: [],
        riskLevel: 'medium',
        complexity: 'medium',
      })
      toast.success(t('wizard.taskAdded'))
    }

    setEditablePlan({ ...editablePlan, milestones: updatedMilestones })
    setIsAiTaskModalOpen(false)
    setEditingAiTaskIndices(null)
    setAiTaskForm({ title: '', description: '', type: 'feature', priority: 'medium', estimatedHours: 1 })
  }

  const handleAddTaskToMilestone = (milestoneIdx: number) => {
    setAiTaskForm({ title: '', description: '', type: 'feature', priority: 'medium', estimatedHours: 1 })
    setEditingAiTaskIndices({ milestoneIdx, taskIdx: -1 }) // -1 means add new
    setIsAiTaskModalOpen(true)
  }

  const handleDeleteTask = (milestoneIdx: number, taskIdx: number) => {
    if (!editablePlan) return
    if (!confirm(t('wizard.deleteTaskConfirm'))) return
    const updatedMilestones = [...editablePlan.milestones]
    updatedMilestones[milestoneIdx].tasks = updatedMilestones[milestoneIdx].tasks.filter((_: any, i: number) => i !== taskIdx)
    setEditablePlan({ ...editablePlan, milestones: updatedMilestones })
    toast.success(t('wizard.taskDeleted'))
  }

  // Handle AI job completion/failure via useEffect (not in render)
  const hasNavigatedRef = useRef(false)
  useEffect(() => {
    if (hasNavigatedRef.current) return
    if (jobData?.status === 'completed' && jobData.resultData) {
      hasNavigatedRef.current = true
      const plan = JSON.parse(JSON.stringify(jobData.resultData)) // Deep clone for editing
      setEditablePlan(plan)
      setStep(4)
    }
    if (jobData?.status === 'failed') {
      hasNavigatedRef.current = true
      toast.error(jobData.errorMessage || t('wizard.generationFailed'))
      setStep(2)
    }
  }, [jobData?.status, jobData?.resultData])

  // Milestone handlers
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!milestoneForm.title.trim()) {
      toast.warning(t('wizard.enterMilestoneTitle'))
      return
    }
    if (!milestoneForm.description.trim()) {
      toast.warning(t('wizard.enterMilestoneDesc'))
      return
    }
    if (!milestoneForm.targetDate) {
      toast.warning(t('wizard.selectTargetDate'))
      return
    }
    setMilestones([...milestones, { ...milestoneForm }])
    setMilestoneForm({ title: '', description: '', targetDate: '' })
    setIsMilestoneModalOpen(false)
    toast.success(t('wizard.milestoneAdded'))
  }

  // Task handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.title.trim()) {
      toast.warning(t('wizard.enterTaskTitle'))
      return
    }
    if (!taskForm.description.trim()) {
      toast.warning(t('wizard.enterTaskDesc'))
      return
    }
    setTasks([...tasks, { ...taskForm, milestoneId: taskForm.milestoneId || undefined }])
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo', milestoneId: '' })
    setIsTaskModalOpen(false)
    toast.success(t('wizard.taskAdded'))
  }

  // Member handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberForm.email.trim()) {
      toast.warning(t('wizard.enterMemberEmail'))
      return
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(memberForm.email)) {
      toast.error(t('wizard.invalidEmail'))
      return
    }
    // Check duplicate
    if (teamMembers.some(m => m.email === memberForm.email)) {
      toast.error(t('wizard.memberAlreadyAdded'))
      return
    }

    // Add to list
    setTeamMembers([...teamMembers, { 
      email: memberForm.email,
      role: memberForm.role,
      jobTitle: memberForm.jobTitle || undefined,
      skills: memberForm.skills || undefined
    }])
    setMemberForm({ email: '', role: 'member', jobTitle: '', skills: '' })
    setIsMemberModalOpen(false)
    toast.success(t('wizard.membersAdded'))
  }

  // Step 1: Choose Mode (AI vs Manual)
  const renderModeSelection = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
          {t('wizard.title')}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {t('wizard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI-Powered Option */}
        <Card
          variant="glass"
          padding="lg"
          hoverable
          onClick={() => {
            setProjectMode('ai')
            setStep(2)
          }}
          className="relative overflow-hidden border-2 border-purple-400/30 hover:border-purple-400/50"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-electric-blue/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-purple-400">
                auto_awesome
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">
              {t('wizard.aiTitle')}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('wizard.aiDesc')}
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
              {t('wizard.manualTitle')}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('wizard.manualDesc')}
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          {t('wizard.cancel')}
        </Button>
      </div>
    </div>
  )

  // Step 2: Choose Type (Team vs Individual)
  const renderTypeSelection = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
          {t('wizard.typeTitle')}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {t('wizard.typeSubtitle')}
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
              {t('wizard.teamTitle')}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('wizard.teamDesc')}
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
              {t('wizard.individualTitle')}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('wizard.individualDesc')}
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button variant="ghost" onClick={() => setStep(1)}>
          {t('wizard.back')}
        </Button>
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          {t('wizard.cancel')}
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
        toast.warning(t('wizard.enterProjectName'))
        return
      }
      if (!formData.description.trim()) {
        toast.warning(t('wizard.enterDescription'))
        return
      }
      if (!formData.startDate) {
        toast.warning(t('wizard.selectStartDate'))
        return
      }
      if (!formData.endDate) {
        toast.warning(t('wizard.selectEndDate'))
        return
      }

      // Go to Step 4 (Planning)
      setStep(4)
    }

    const handleCreateNow = (e: React.FormEvent) => {
      e.preventDefault()

      // Validation
      if (!formData.name.trim()) {
        toast.warning(t('wizard.enterProjectName'))
        return
      }
      if (!formData.description.trim()) {
        toast.warning(t('wizard.enterDescription'))
        return
      }
      if (!formData.startDate) {
        toast.warning(t('wizard.selectStartDate'))
        return
      }
      if (!formData.endDate) {
        toast.warning(t('wizard.selectEndDate'))
        return
      }

      // Create project immediately with correct field mappings
      const projectData = {
        ...formData,
        projectType: projectMode, // 'ai' or 'manual'
        projectMode: projectType, // 'team' or 'individual'
        storyPointConfigs,
        teamMembers, // Include team members
      }

      createProjectMutation.mutate(projectData as any, {
        onSuccess: () => {
          toast.success(t('wizard.projectCreatedSuccess'))
          navigate('/projects')
        },
        onError: (error: any) => {
          const errorMsg = error?.response?.data?.message || t('wizard.failedCreateProject')
          toast.error(errorMsg)
          console.error('Project creation error:', error)
        },
      })
    }

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
            {t('wizard.createNewProject')}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {t('wizard.fillDetails')}
          </p>
        </div>

        {/* Project Mode & Type Badge */}
        <div className="flex gap-2 mb-6">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
            {t('wizard.manual')}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-surface-glass text-on-surface-variant border border-border-low">
            {projectType === 'team' ? t('wizard.team') : t('wizard.individual')}
          </span>
        </div>

        <form onSubmit={handleContinue}>
          <Card variant="glass" padding="lg">
            {/* Basic Information Section */}
            <div className="mb-8">
              <h3 className="font-heading text-sm font-semibold text-on-surface mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                {t('wizard.basicInfo')}
              </h3>

              <div className="flex flex-col gap-4">
                <Input
                  label={t('wizard.projectName')}
                  placeholder={t('wizard.projectNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <AiDescriptionGenerator
                  value={formData.description}
                  onChange={(val) => setFormData({ ...formData, description: val })}
                  context={formData.name}
                  type="project"
                  label="Description"
                  rows={4}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('wizard.startDate')}
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />

                  <Input
                    label={t('wizard.targetEndDate')}
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t('wizard.status')}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      { value: 'planning', label: t('wizard.statusPlanning') },
                      { value: 'active', label: t('wizard.statusActive') },
                      { value: 'completed', label: t('wizard.statusCompleted') },
                      { value: 'archived', label: t('wizard.statusArchived') },
                    ]}
                    required
                  />

                  <Select
                    label={t('wizard.priority')}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    options={[
                      { value: 'low', label: t('wizard.priorityLow') },
                      { value: 'medium', label: t('wizard.priorityMedium') },
                      { value: 'high', label: t('wizard.priorityHigh') },
                    ]}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Agile Estimation Setup Section */}
            <div className="mb-8 border-t border-white/5 pt-8">
              <h3 className="font-heading text-sm font-semibold text-on-surface mb-2 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">straighten</span>
                {t('wizard.agileSetup')} <span className="text-on-surface-variant font-normal normal-case">{t('wizard.agileSetupOptional')}</span>
              </h3>
              <p className="text-xs text-on-surface-variant mb-6">
                {t('wizard.agileSetupDesc')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {storyPointConfigs.map((config, index) => (
                  <div key={config.storyPointValue} className="bg-white/5 p-3 rounded-lg border border-white/10 flex flex-col items-center">
                    <span className="text-xs font-bold text-electric-blue mb-2">{config.storyPointValue} SP</span>
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="number"
                        className="w-full bg-surface border border-white/10 rounded px-2 py-1 text-sm text-center text-white focus:outline-none focus:border-electric-blue transition-colors"
                        value={config.hoursEquivalent}
                        onChange={(e) => {
                          const newConfigs = [...storyPointConfigs]
                          newConfigs[index].hoursEquivalent = Number(e.target.value) || 0
                          setStoryPointConfigs(newConfigs)
                        }}
                        min="0"
                        step="0.5"
                      />
                      <span className="text-[10px] text-on-surface-variant font-medium">{t('wizard.hrs')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members Section - Only show for team projects */}
            {projectType === 'team' && (
              <div className="mb-8 border-t border-white/5 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-on-surface uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">groups</span>
                      {t('wizard.teamMembers')}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {t('wizard.teamMembersDesc', { defaultValue: 'Add team members to collaborate on this project' })}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsMemberModalOpen(true)}
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    {t('wizard.addMember')}
                  </Button>
                </div>

                {teamMembers.length === 0 ? (
                  <div className="bg-white/5 border border-dashed border-white/20 rounded-lg p-8 text-center">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50 mb-2">
                      group_add
                    </span>
                    <p className="text-sm text-on-surface-variant">
                      {t('wizard.noMembersYet', { defaultValue: 'No team members added yet' })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teamMembers.map((member, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue/30 to-purple-400/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px] text-electric-blue">
                              person
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-on-surface">{member.email}</p>
                            <p className="text-xs text-on-surface-variant">
                              {member.jobTitle || (member.role === 'owner' ? t('wizard.roleOwner', { defaultValue: 'Owner' }) : t('wizard.roleMember', { defaultValue: 'Member' }))} {member.skills && `• ${member.skills}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTeamMembers(teamMembers.filter((_, i) => i !== idx))
                            toast.success(t('wizard.memberRemoved'))
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-border-low">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(2)}
                disabled={submitting}
              >
                {t('wizard.back')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCreateNow}
                disabled={submitting}
              >
                {submitting ? t('wizard.creating') : t('wizard.createNow')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {t('wizard.continuePlanning')}
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
          storyPointConfigs,
          teamMembers, // Include team members
          milestones, // Include milestones
          tasks, // Include tasks
        }

        toast.info(t('wizard.creatingProject'))
        const newProject = await createProjectMutation.mutateAsync(projectData as any)
        
        if (!newProject || !newProject.id) {
          toast.error(t('wizard.failedCreateProject'))
          return
        }

        toast.success(t('wizard.projectCreated'))

        // Navigate to projects list
        toast.success(t('wizard.projectSetupComplete'))
        navigate('/projects')
      } catch (error: any) {
        console.error('Project creation failed:', error)
        const errorMsg = error?.response?.data?.message || error.message || t('wizard.failedCreateProject')
        toast.error(errorMsg)
      }
    }

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
            {t('wizard.projectPlanning')}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {t('wizard.planningSubtitle')}
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
                  {t('wizard.priority')}: {t(`wizard.priority${formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}`)}
                </span>
                {projectType && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      {projectType === 'team' ? 'groups' : 'person'}
                    </span>
                    {projectType === 'team' ? t('wizard.team') : t('wizard.individual')}
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
              {t('wizard.edit')}
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
                {t('wizard.projectMilestones')}
              </h3>
              <span className="text-xs text-on-surface-variant">
                {t('wizard.added', { count: milestones.length })}
              </span>
            </div>

            {milestones.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">
                  flag
                </span>
                <p className="text-xs text-on-surface-variant">
                  {t('wizard.noMilestonesYet')}
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
              {t('wizard.addMilestone')}
            </Button>
          </Card>

          {/* Tasks */}
          <Card variant="glass" padding="lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-base font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
                {t('wizard.taskTimeline')}
              </h3>
              <span className="text-xs text-on-surface-variant">
                {t('wizard.added', { count: tasks.length })}
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">
                  task_alt
                </span>
                <p className="text-xs text-on-surface-variant">
                  {t('wizard.noTasksYet')}
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
                            {t(`wizard.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border text-electric-blue bg-electric-blue/10 border-electric-blue/20">
                            {task.status === 'todo' ? t('wizard.statusTodo') :
                             task.status === 'in-progress' ? t('wizard.statusInProgress') :
                             task.status === 'review' ? t('wizard.statusReview') :
                             task.status === 'done' ? t('wizard.statusDone') :
                             task.status === 'backlog' ? t('wizard.statusBacklog') :
                             task.status}
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
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">flag</span>
                            {task.priority}
                          </span>
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
              {t('wizard.addTask')}
            </Button>
          </Card>

          {/* Team Members */}
          <Card variant="glass" padding="lg" className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-base font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">group</span>
                {t('wizard.teamMembers')}
              </h3>
              <span className="text-xs text-on-surface-variant">
                {t('wizard.added', { count: teamMembers.length })}
              </span>
            </div>

            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50 mb-2">
                  group
                </span>
                <p className="text-xs text-on-surface-variant">
                  {t('wizard.noMembersYet')}
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
              {t('wizard.addMember')}
            </Button>
          </Card>
        </div>

        {/* Final Actions */}
        <Card variant="glass" padding="lg">
          <div className="text-center mb-4">
            <h3 className="font-heading text-base font-semibold text-on-surface mb-1">
              {t('wizard.readyToCreate', { defaultValue: 'Ready to Create?' })}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {t('wizard.reviewPlanDesc', { defaultValue: 'Review your project plan and save to create the project' })}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(3)}
              disabled={submitting}
            >
              {t('wizard.back')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/projects')}
              disabled={submitting}
            >
              {t('wizard.cancel')}
            </Button>
            <Button
              onClick={handleFinalCreate}
              disabled={submitting}
            >
              {submitting ? t('wizard.creatingProject') : t('wizard.createProject')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Step 2 (AI Mode): AI Input Form
  const renderAiInputForm = () => {
    const handleStartGeneration = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!aiFormData.description.trim()) {
        toast.warning(t('wizard.enterDescription'))
        return
      }

      try {
        const input: GenerateProjectPlanDto = {
          description: aiFormData.description,
          goals: aiFormData.goals || undefined,
          timelinePreference: aiFormData.timelinePreference,
          teamMembers: aiFormData.teamMembers.length > 0 ? aiFormData.teamMembers : undefined,
        }

        toast.info(t('wizard.startingGeneration'))
        const result = await startGenerationMutation.mutateAsync(input)
        setAiJobId(result.jobId)
        setStep(3) // Go to progress step
        toast.success(t('wizard.aiAnalyzing'))
      } catch (error: any) {
        const status = error.response?.status
        const data = error.response?.data
        if (status === 403 && data?.code === 'AI_LIMIT_REACHED') {
          setShowUpgradeModal(true)
        } else {
          toast.error(error?.response?.data?.message || 'Failed to start generation')
        }
      }
    }

    const handleAddTeamMember = (userId: string) => {
      const user = allUsers.find((u: any) => u.id === userId)
      if (!user) return

      // Check if already added
      if (aiFormData.teamMembers.some(m => m.email === user.email)) {
        toast.error(t('wizard.memberAlreadyAdded'))
        return
      }

      setAiFormData({
        ...aiFormData,
        teamMembers: [
          ...aiFormData.teamMembers,
          {
            email: user.email,
            name: user.fullName || user.email,
            jobTitle: '',
            skills: '',
            availability: 'full-time',
          },
        ],
      })
      toast.success(t('wizard.memberAddedCount', { name: user.fullName || user.email, defaultValue: `Added ${user.fullName || user.email}` }))
    }

    const handleRemoveTeamMember = (email: string) => {
      setAiFormData({
        ...aiFormData,
        teamMembers: aiFormData.teamMembers.filter(m => m.email !== email),
      })
      toast.success(t('wizard.memberRemoved'))
    }

    const handleUpdateTeamMember = (index: number, field: string, value: any) => {
      const updated = [...aiFormData.teamMembers]
      updated[index] = { ...updated[index], [field]: value }
      setAiFormData({ ...aiFormData, teamMembers: updated })
    }

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
            {t('wizard.aiDescribeTitle')}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {t('wizard.aiDescribeSubtitle')}
          </p>
        </div>

        <form onSubmit={handleStartGeneration}>
          <Card variant="glass" padding="lg">
            <div className="flex flex-col gap-4">
              <TextArea
                label={t('wizard.aiProjectDesc')}
                placeholder={t('wizard.aiProjectDescPlaceholder')}
                value={aiFormData.description}
                onChange={(e) => setAiFormData({ ...aiFormData, description: e.target.value })}
                required
                rows={6}
              />

              <TextArea
                label={t('wizard.aiGoals')}
                placeholder={t('wizard.aiGoalsPlaceholder')}
                value={aiFormData.goals}
                onChange={(e) => setAiFormData({ ...aiFormData, goals: e.target.value })}
                rows={3}
              />

              <Select
                label={t('wizard.aiTimeline')}
                value={aiFormData.timelinePreference}
                onChange={(e) => setAiFormData({ ...aiFormData, timelinePreference: e.target.value as any })}
                options={[
                  { value: 'urgent', label: t('wizard.aiTimelineUrgent') },
                  { value: 'normal', label: t('wizard.aiTimelineNormal') },
                  { value: 'flexible', label: t('wizard.aiTimelineFlexible') },
                ]}
                required
              />

              {/* Team Members Section */}
              <div className="mt-4 pt-4 border-t border-border-low">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-sm font-semibold text-on-surface uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">groups</span>
                    {t('wizard.aiTeamMembers')}
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {t('wizard.selectedCount', { count: aiFormData.teamMembers.length })}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mb-3">
                  {t('wizard.aiTeamMembersDesc')}
                </p>

                {/* User Selection */}
                {!isLoadingUsers && allUsers.length > 0 && (
                  <div className="mb-4">
                    <Select
                      label={t('wizard.addTeamMember')}
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddTeamMember(e.target.value)
                          e.target.value = '' // Reset selection
                        }
                      }}
                      options={[
                        { value: '', label: t('wizard.selectUserPlaceholder') },
                        ...allUsers
                          .filter((u: any) => !aiFormData.teamMembers.some(m => m.email === u.email))
                          .map((u: any) => ({
                            value: u.id,
                            label: `${u.fullName || u.email} (${u.email})`,
                          })),
                      ]}
                    />
                  </div>
                )}

                {isLoadingUsers && (
                  <p className="text-xs text-on-surface-variant text-center py-4">{t('settings.loading')}</p>
                )}

                {/* Selected Team Members */}
                {aiFormData.teamMembers.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {aiFormData.teamMembers.map((member, idx) => (
                      <Card key={idx} variant="glass" padding="sm" className="bg-surface-container-low">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm font-medium text-on-surface mb-1">{member.name}</p>
                              <p className="text-xs text-on-surface-variant">{member.email}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Input
                                label={t('wizard.jobTitleLabel')}
                                placeholder="e.g. Frontend Developer"
                                value={member.jobTitle}
                                onChange={(e) => handleUpdateTeamMember(idx, 'jobTitle', e.target.value)}
                              />
                              <Input
                                label={t('wizard.memberSkills')}
                                placeholder="e.g. React, TypeScript"
                                value={member.skills}
                                onChange={(e) => handleUpdateTeamMember(idx, 'skills', e.target.value)}
                              />
                              <Select
                                label={t('wizard.availabilityLabel')}
                                value={member.availability}
                                onChange={(e) => handleUpdateTeamMember(idx, 'availability', e.target.value)}
                                options={[
                                  { value: 'full-time', label: t('wizard.fullTime') },
                                  { value: 'part-time', label: t('wizard.partTime') },
                                ]}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(member.email)}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-border-low">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={startGenerationMutation.isPending}
              >
                {t('wizard.back')}
              </Button>
              <Button
                type="submit"
                disabled={startGenerationMutation.isPending}
                icon="auto_awesome"
              >
                {startGenerationMutation.isPending ? t('wizard.generating') : t('wizard.generatePlan')}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    )
  }

  // Step 3 (AI Mode): Progress Tracking
  const renderAiProgress = () => {
    const stages = [
      { name: t('wizard.stageAnalyzing'), progress: 20, icon: 'psychology' },
      { name: t('wizard.stageMilestones'), progress: 40, icon: 'flag' },
      { name: t('wizard.stageTasks'), progress: 60, icon: 'task_alt' },
      { name: t('wizard.stageAssignments'), progress: 80, icon: 'person_add' },
      { name: t('wizard.stageValidation'), progress: 100, icon: 'verified' },
    ]

    const currentStageIndex = stages.findIndex(s => aiProgress < s.progress)
    const activeStage = currentStageIndex >= 0 ? currentStageIndex : stages.length - 1

    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-electric-blue/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[48px] text-purple-400 animate-pulse">
              auto_awesome
            </span>
          </div>
          <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
            {t('wizard.generatingTitle')}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {aiStage ? t(`wizard.stage${aiStage.charAt(0).toUpperCase() + aiStage.slice(1)}`, { defaultValue: aiStage }) : t('wizard.initializing')}
          </p>
        </div>

        <Card variant="glass" padding="lg">
          {/* Overall Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-on-surface">{t('wizard.overallProgress')}</span>
              <span className="text-sm font-bold text-electric-blue">{Math.round(aiProgress)}%</span>
            </div>
            <ProgressBar value={aiProgress} max={100} glow />
          </div>

          {/* Stages */}
          <div className="flex flex-col gap-3">
            {stages.map((stage, idx) => {
              const isCompleted = aiProgress >= stage.progress
              const isActive = idx === activeStage
              
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-electric-blue/10 border border-electric-blue/30'
                      : isCompleted
                      ? 'bg-emerald-400/10 border border-emerald-400/20'
                      : 'bg-surface-container-low border border-border-low opacity-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-400/20 text-emerald-400'
                        : isActive
                        ? 'bg-electric-blue/20 text-electric-blue'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isCompleted ? 'check_circle' : stage.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-on-surface">{stage.name}</p>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse delay-75" />
                      <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse delay-150" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    )
  }

  // Step 4 (AI Mode): Preview & Edit
  const renderAiPreview = () => {
    if (!editablePlan) return null

    const handleAcceptPlan = async () => {
      if (!aiJobId) return

      try {
        toast.info(t('wizard.creatingProject'))
        
        const acceptData: any = {
          projectName: editablePlan.projectName,
          milestones: editablePlan.milestones.map((m: any) => ({
            title: m.title,
            description: m.description,
            estimatedWeeks: m.estimatedWeeks,
            tasks: m.tasks.map((t: any) => ({
              title: t.title,
              description: t.description,
              type: t.type,
              priority: t.priority,
              estimatedHours: t.estimatedHours,
              assigneeEmail: t.suggestedAssignee?.email,
            })),
          })),
        }

        await acceptPlanMutation.mutateAsync({ jobId: aiJobId, data: acceptData })
        toast.success(t('wizard.projectCreatedSuccess'))
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('wizard.failedCreateProject'))
      }
    }

    const totalTasks = editablePlan.milestones.reduce(
      (sum: number, m: any) => sum + m.tasks.length,
      0,
    )

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="font-heading text-[28px] font-semibold text-on-surface mb-2">
            {t('wizard.reviewTitle')}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {t('wizard.reviewSubtitle')}
          </p>
        </div>

        {/* Summary Card */}
        <Card variant="glass" padding="lg" className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={editablePlan.projectName}
                  onChange={(e) => handleEditProjectName(e.target.value)}
                  className="font-heading text-2xl font-semibold text-on-surface bg-transparent border-b border-transparent hover:border-electric-blue/30 focus:border-electric-blue focus:outline-none transition-colors flex-1"
                />
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  edit
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  {t(`wizard.priority${editablePlan.complexity.charAt(0).toUpperCase() + editablePlan.complexity.slice(1)}`)} {t('wizard.complexity')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  {editablePlan.estimatedDuration}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">flag</span>
                  {editablePlan.milestones.length} {t('projectDetails.milestonesTitle')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  {totalTasks} {t('wizard.tasks')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-[16px] text-purple-400">auto_awesome</span>
              <span className="text-purple-400">{t('wizard.aiGenerated')}</span>
            </div>
          </div>

          {/* Warnings */}
          {editablePlan.warnings && editablePlan.warnings.length > 0 && (
            <div className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/20">
              <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {t('wizard.suggestions')}
              </h4>
              <ul className="text-xs text-on-surface-variant space-y-1">
                {editablePlan.warnings.map((warning: string, i: number) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Add Milestone Button */}
        <div className="mb-4 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            icon="add"
            onClick={() => {
              setAiMilestoneForm({ title: '', description: '', estimatedWeeks: 1 })
              setEditingAiMilestoneIndex(null)
              setIsAiMilestoneModalOpen(true)
            }}
          >
            {t('wizard.addMilestone')}
          </Button>
        </div>

        {/* Milestones Preview with expandable tasks */}
        <div className="flex flex-col gap-4 mb-8">
          {editablePlan.milestones.map((milestone: any, idx: number) => {
            const isExpanded = expandedMilestones.has(idx)
            return (
              <Card key={idx} variant="glass" padding="lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-electric-blue/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-electric-blue">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-heading text-base font-semibold text-on-surface">
                        {milestone.title}
                      </h4>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditMilestone(idx)
                          }}
                          className="text-electric-blue hover:text-electric-blue/80 transition-colors cursor-pointer p-1"
                          title={t('wizard.editMilestone')}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMilestone(idx)
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors cursor-pointer p-1"
                          title={t('wizard.deleteMilestone')}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMilestone(idx)}
                          className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1"
                        >
                          <span 
                            className="material-symbols-outlined text-[18px] transition-transform duration-200" 
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          >
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">
                      {milestone.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {t('wizard.weeksCount', { count: milestone.estimatedWeeks })}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">task_alt</span>
                        {milestone.tasks.length} {t('wizard.tasks')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable task list */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border-low">
                    {/* Add Task Button */}
                    <div className="mb-3 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="add"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddTaskToMilestone(idx)
                        }}
                      >
                        {t('wizard.addTask')}
                      </Button>
                    </div>
                    
                    {milestone.tasks.length === 0 ? (
                      <p className="text-xs text-on-surface-variant text-center py-4">
                        {t('wizard.noTasksClickAdd')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {milestone.tasks.map((task: any, tIdx: number) => (
                          <div key={tIdx} className="p-3 rounded-lg bg-surface-container-low border border-border-low">
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-electric-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold text-electric-blue">{tIdx + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="text-sm font-medium text-on-surface">{task.title}</p>
                                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                                    task.priority === 'urgent' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                                    task.priority === 'high' ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' :
                                    task.priority === 'medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                                    'text-blue-400 bg-blue-400/10 border-blue-400/20'
                                  }`}>
                                    {t(`wizard.priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`)}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-on-surface-variant">
                                  {task.estimatedHours && (
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                                      {task.estimatedHours} {t('wizard.hrs')}
                                    </span>
                                  )}
                                  {task.suggestedAssignee?.name && (
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">person</span>
                                      {task.suggestedAssignee.name}
                                    </span>
                                  )}
                                  {task.type && (
                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-glass border border-border-low">
                                      {task.type === 'feature' ? t('wizard.featureType') :
                                       task.type === 'bug' ? t('wizard.bugType') :
                                       task.type === 'chore' ? t('wizard.choreType') :
                                       task.type === 'research' ? t('wizard.researchType') :
                                       task.type === 'improvement' ? t('wizard.improvementType') :
                                       task.type}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditTask(idx, tIdx)
                                  }}
                                  className="text-electric-blue hover:text-electric-blue/80 transition-colors cursor-pointer"
                                  title={t('wizard.editTask')}
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteTask(idx, tIdx)
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                  title={t('wizard.deleteTask')}
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Actions */}
        <Card variant="glass" padding="lg">
          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => {
                setStep(2)
                setAiJobId(null)
                setEditablePlan(null)
              }}
              disabled={acceptPlanMutation.isPending}
            >
              {t('wizard.startOver')}
            </Button>
            <Button
              onClick={handleAcceptPlan}
              disabled={acceptPlanMutation.isPending}
              icon="check_circle"
            >
              {acceptPlanMutation.isPending ? t('wizard.creating') : t('wizard.acceptAndCreate')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Step indicator configuration
  const stepIndicator = () => {
    const isAi = projectMode === 'ai' || (projectMode === null && step === 1)
    const aiSteps = [
      { num: 1, label: t('wizard.stepMode') },
      { num: 2, label: t('wizard.stepDescribe') },
      { num: 3, label: t('wizard.stepGenerating') },
      { num: 4, label: t('wizard.stepReview') },
    ]
    const manualSteps = [
      { num: 1, label: t('wizard.stepMode') },
      { num: 2, label: t('wizard.stepType') },
      { num: 3, label: t('wizard.stepDetails') },
      { num: 4, label: t('wizard.stepPlan') },
    ]
    const steps = isAi ? aiSteps : manualSteps

    return (
      <div className="flex items-center justify-center gap-0 mb-8">
        {steps.map((s, idx) => {
          const isActive = step === s.num
          const isPast = step > s.num
          return (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-electric-blue text-white shadow-[0_0_8px_rgba(0,123,255,0.5)]'
                      : isPast
                      ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                      : 'bg-surface-container text-on-surface-variant border border-border-low'
                  }`}
                >
                  {isPast ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    isActive ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-10 h-px mx-2 ${
                    isPast ? 'bg-emerald-400/30' : 'bg-border-low'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Render current step
  return (
    <div className="p-6">
      {stepIndicator()}
      {step === 1 && renderModeSelection()}
      {step === 2 && projectMode === 'manual' && renderTypeSelection()}
      {step === 2 && projectMode === 'ai' && renderAiInputForm()}
      {step === 3 && projectMode === 'manual' && renderBasicInfoForm()}
      {step === 3 && projectMode === 'ai' && renderAiProgress()}
      {step === 4 && projectMode === 'manual' && renderPlanningDetails()}
      {step === 4 && projectMode === 'ai' && renderAiPreview()}

      <AiUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="project_planning"
      />

      {/* Add Milestone Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">{t('wizard.addMilestone')}</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsMilestoneModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="flex flex-col gap-4">
              <Input
                label={t('wizard.milestoneTitle')}
                placeholder="e.g. MVP Launch"
                value={milestoneForm.title}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                required
              />

              <TextArea
                label={t('wizard.description')}
                placeholder={t('wizard.milestoneDescPlaceholder', { defaultValue: 'Detailed description of this milestone...' })}
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                rows={4}
                required
              />

              <Input
                label={t('wizard.milestoneTargetDate')}
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
                  {t('wizard.cancel')}
                </Button>
                <Button type="submit">{t('wizard.addMilestone')}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* AI Milestone Modal (Edit/Add for AI plan) */}
      {isAiMilestoneModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">
                {editingAiMilestoneIndex !== null ? t('wizard.editMilestone') : t('wizard.addMilestone')}
              </h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => {
                  setIsAiMilestoneModalOpen(false)
                  setEditingAiMilestoneIndex(null)
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="flex flex-col gap-4">
              <Input
                label={t('wizard.milestoneTitle')}
                placeholder="e.g. MVP Launch"
                value={aiMilestoneForm.title}
                onChange={(e) => setAiMilestoneForm({ ...aiMilestoneForm, title: e.target.value })}
                required
              />

              <TextArea
                label={t('wizard.description')}
                placeholder={t('wizard.milestoneDescPlaceholder', { defaultValue: 'Detailed description of this milestone...' })}
                value={aiMilestoneForm.description}
                onChange={(e) => setAiMilestoneForm({ ...aiMilestoneForm, description: e.target.value })}
                rows={4}
                required
              />

              <Input
                label={t('wizard.estimatedWeeks')}
                type="number"
                min="1"
                value={aiMilestoneForm.estimatedWeeks}
                onChange={(e) => setAiMilestoneForm({ ...aiMilestoneForm, estimatedWeeks: parseInt(e.target.value) || 1 })}
                required
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAiMilestoneModalOpen(false)
                    setEditingAiMilestoneIndex(null)
                  }}
                >
                  {t('wizard.cancel')}
                </Button>
                <Button type="submit">
                  {editingAiMilestoneIndex !== null ? t('settings.saveChanges') : t('wizard.addMilestone')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* AI Task Modal (Edit/Add for AI plan) */}
      {isAiTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">
                {editingAiTaskIndices && editingAiTaskIndices.taskIdx >= 0 ? t('wizard.editTask') : t('wizard.addTask')}
              </h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => {
                  setIsAiTaskModalOpen(false)
                  setEditingAiTaskIndices(null)
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="flex flex-col gap-4">
              <Input
                label={t('wizard.taskTitle')}
                placeholder="e.g. Design homepage mockup"
                value={aiTaskForm.title}
                onChange={(e) => setAiTaskForm({ ...aiTaskForm, title: e.target.value })}
                required
              />

              <TextArea
                label={t('wizard.taskDesc')}
                placeholder={t('wizard.taskDescPlaceholder', { defaultValue: 'Detailed description of the task...' })}
                value={aiTaskForm.description}
                onChange={(e) => setAiTaskForm({ ...aiTaskForm, description: e.target.value })}
                rows={4}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label={t('wizard.taskType')}
                  value={aiTaskForm.type}
                  onChange={(e) => setAiTaskForm({ ...aiTaskForm, type: e.target.value })}
                  options={[
                    { value: 'feature', label: t('wizard.featureType') },
                    { value: 'bug', label: t('wizard.bugType') },
                    { value: 'improvement', label: t('wizard.improvementType') },
                  ]}
                  required
                />

                <Select
                  label={t('wizard.taskPriority')}
                  value={aiTaskForm.priority}
                  onChange={(e) => setAiTaskForm({ ...aiTaskForm, priority: e.target.value })}
                  options={[
                    { value: 'low', label: t('wizard.priorityLow') },
                    { value: 'medium', label: t('wizard.priorityMedium') },
                    { value: 'high', label: t('wizard.priorityHigh') },
                    { value: 'urgent', label: t('wizard.priorityUrgent') },
                  ]}
                  required
                />
              </div>

              <Input
                label={t('wizard.estimatedHours')}
                type="number"
                min="1"
                value={aiTaskForm.estimatedHours}
                onChange={(e) => setAiTaskForm({ ...aiTaskForm, estimatedHours: parseInt(e.target.value) || 1 })}
                required
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAiTaskModalOpen(false)
                    setEditingAiTaskIndices(null)
                  }}
                >
                  {t('wizard.cancel')}
                </Button>
                <Button type="submit">
                  {editingAiTaskIndices && editingAiTaskIndices.taskIdx >= 0 ? t('settings.saveChanges') : t('wizard.addTask')}
                </Button>
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
              <h3 className="font-heading text-xl font-semibold text-on-surface">{t('wizard.addTask')}</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsTaskModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTask} className="flex flex-col gap-4">
              <Input
                label={t('wizard.taskTitle')}
                placeholder="e.g. Design homepage mockup"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
              />

              <TextArea
                label={t('wizard.taskDesc')}
                placeholder={t('wizard.taskDescPlaceholder', { defaultValue: 'Detailed description of the task...' })}
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={4}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label={t('wizard.taskPriority')}
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  options={[
                    { value: 'low', label: t('wizard.priorityLow') },
                    { value: 'medium', label: t('wizard.priorityMedium') },
                    { value: 'high', label: t('wizard.priorityHigh') },
                  ]}
                  required
                />

                <Select
                  label={t('wizard.taskStatus')}
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  options={[
                    { value: 'todo', label: t('wizard.statusTodo') },
                    { value: 'in-progress', label: t('wizard.statusInProgress') },
                    { value: 'review', label: t('wizard.statusReview') },
                    { value: 'done', label: t('wizard.statusDone') },
                  ]}
                  required
                />
              </div>

              <Input
                label={t('wizard.taskDueDate')}
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsTaskModalOpen(false)}
                >
                  {t('wizard.cancel')}
                </Button>
                <Button type="submit">{t('wizard.addTask')}</Button>
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
              <h3 className="font-heading text-xl font-semibold text-on-surface">{t('wizard.addMember')}</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsMemberModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <Input
                label={t('wizard.memberEmail')}
                type="email"
                placeholder="teammate@example.com"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                required
                helperText={t('wizard.registeredUserHelper')}
              />

              <Select
                label={t('wizard.projectRole')}
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as 'owner' | 'member' })}
                options={[
                  { value: 'member', label: t('wizard.roleMember', { defaultValue: 'Member' }) },
                  { value: 'owner', label: t('wizard.roleOwner', { defaultValue: 'Owner' }) },
                ]}
                required
              />
              <p className="text-xs text-on-surface-variant -mt-2">{t('wizard.projectRoleHelper', { defaultValue: 'Project access level' })}</p>

              <Input
                label={t('wizard.jobTitle', { defaultValue: 'Job Title' })}
                placeholder="e.g. Full Stack Engineer, Backend Developer"
                value={memberForm.jobTitle}
                onChange={(e) => setMemberForm({ ...memberForm, jobTitle: e.target.value })}
                helperText={t('wizard.jobTitleHelper', { defaultValue: 'Optional: Their role/position in the team' })}
              />

              <TextArea
                label={t('wizard.memberSkills')}
                placeholder="e.g. React, Node.js, TypeScript, UI/UX Design"
                value={memberForm.skills}
                onChange={(e) => setMemberForm({ ...memberForm, skills: e.target.value })}
                rows={3}
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsMemberModalOpen(false)}
                >
                  {t('wizard.cancel')}
                </Button>
                <Button type="submit">{t('wizard.addMember')}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
