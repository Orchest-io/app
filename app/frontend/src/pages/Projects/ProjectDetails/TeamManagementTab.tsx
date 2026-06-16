import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, Button, Input, Select, TextArea } from '../../../components/ui'
import { useAddMember, useRemoveMember } from '../../../hooks/useProjectMutations'

interface TeamMember {
  id: string
  userId: string
  role?: string
  jobTitle?: string
  skills?: string
  status: string
  joinedAt: Date | string
  user?: {
    fullName?: string
    email?: string
  }
}

interface TeamManagementTabProps {
  projectId: string
  members: TeamMember[]
  isOwner: boolean
}

export default function TeamManagementTab({ projectId, members, isOwner }: TeamManagementTabProps) {
  const { t } = useTranslation()
  const addMemberMutation = useAddMember()
  const removeMemberMutation = useRemoveMember()

  // Add Member Modal
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    jobTitle: '',
    skills: '',
    role: 'Full Stack Engineer',
    status: 'available',
  })

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      toast.warning(t('projectDetails.pleaseEnterEmail'))
      return
    }
    if (!formData.jobTitle.trim()) {
      toast.warning(t('projectDetails.pleaseEnterJobTitle'))
      return
    }

    addMemberMutation.mutate(
      {
        projectId,
        dto: {
          email: formData.email,
          role: 'member',
          jobTitle: formData.jobTitle,
          skills: formData.skills,
          status: formData.status,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('projectDetails.memberAddedSuccess'))
          setIsAddMemberOpen(false)
          setFormData({
            email: '',
            jobTitle: '',
            skills: '',
            role: 'Full Stack Engineer',
            status: 'available',
          })
        },
        onError: (err: any) => {
          toast.error(t('projectDetails.failedAddMember') + ': ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate(
      { projectId, userId },
      {
        onSuccess: () => toast.success(t('projectDetails.memberRemovedSuccess')),
        onError: (err: any) => {
          toast.error(t('projectDetails.failedRemoveMember') + ': ' + (err?.response?.data?.message ?? err.message))
        },
      }
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'busy':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      case 'on-leave':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-on-surface-variant bg-surface-glass border-border-low'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return 'check_circle'
      case 'busy':
        return 'schedule'
      case 'on-leave':
        return 'do_not_disturb'
      default:
        return 'help'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return t('projectDetails.statusAvailable')
      case 'busy':
        return t('projectDetails.statusBusy')
      case 'on-leave':
        return t('projectDetails.statusOnLeave')
      default:
        return status
    }
  }

  const availableCount = members.filter((m) => m.status === 'available').length
  const busyCount = members.filter((m) => m.status === 'busy' || m.status === 'on-leave').length

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
            {t('projectDetails.totalMembers')}
          </p>
          <p className="text-[28px] font-bold font-heading text-on-surface">
            {members.length}
          </p>
        </Card>

        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
            {t('projectDetails.availableNow')}
          </p>
          <p className="text-[28px] font-bold font-heading text-emerald-400">
            {availableCount}
          </p>
        </Card>

        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">
            {t('projectDetails.busyOnLeave')}
          </p>
          <p className="text-[28px] font-bold font-heading text-amber-400">
            {busyCount}
          </p>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-heading text-lg font-semibold text-on-surface">{t('projectDetails.teamMembersTitle')}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {t('projectDetails.manageTeamDesc')}
            </p>
          </div>
          {isOwner && (
            <Button icon="person_add" onClick={() => setIsAddMemberOpen(true)}>
              {t('projectDetails.addMemberBtn')}
            </Button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-surface-glass border border-border-low flex items-center justify-center text-on-surface-variant mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">group</span>
            </div>
            <h3 className="font-heading text-xl font-bold mb-2">{t('projectDetails.noTeamMembersYet')}</h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6 leading-relaxed">
              {t('projectDetails.addMemberHint')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => {
              // Generate initials from name
              const fullName = member.user?.fullName || t('projectDetails.unknownUser')
              const initials = fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              // Mock data for demo (will come from backend later)
              const tasksCompleted = Math.floor(Math.random() * 25)
              const totalTasks = Math.floor(Math.random() * 15) + tasksCompleted
              const workload = Math.floor(Math.random() * 100)

              return (
                <Card
                  key={member.id}
                  variant="glass"
                  padding="lg"
                  className="hover:border-outline/30 transition-all"
                >
                  {/* Header: Avatar + Name + Status */}
                  <div className="flex items-start gap-3 mb-4">
                    {/* Avatar with Initials */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-electric-blue/30 to-purple-400/30 border-2 border-electric-blue/20 flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-on-surface">
                        {initials}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-lg font-semibold text-on-surface truncate">
                        {fullName}
                      </h4>
                      <p className="text-sm text-on-surface-variant mb-2">
                        {member.jobTitle || t('projectDetails.noTitleLabel')}
                      </p>

                      {/* Status Badge */}
                      <span
                        className={`text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${getStatusColor(member.status)}`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {getStatusIcon(member.status)}
                        </span>
                        {getStatusLabel(member.status)}
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    <span className="truncate">{member.user?.email || member.userId}</span>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-2">
                      {t('projectDetails.skillsLabel')}
                    </p>
                    {member.skills ? (
                      <div className="flex flex-wrap gap-2">
                        {member.skills.split(',').slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-surface-container-low border border-border-low text-on-surface-variant"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                        {member.skills.split(',').length > 3 && (
                          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-surface-container-low border border-border-low text-on-surface-variant">
                            +{member.skills.split(',').length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant/60 italic">{t('projectDetails.noSkillsListed')}</p>
                    )}
                  </div>

                  {/* Task Completion */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-xs text-on-surface-variant mb-1.5">
                      <span className="font-semibold">{t('projectDetails.taskCompletion')}</span>
                      <span className="font-bold text-on-surface">
                        {tasksCompleted}/{totalTasks}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-electric-blue to-blue-400 rounded-full transition-all"
                        style={{ width: `${totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Workload */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs text-on-surface-variant mb-1.5">
                      <span className="font-semibold">{t('projectDetails.workloadLabel')}</span>
                      <span className="font-bold text-on-surface">{workload}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          workload >= 90
                            ? 'bg-gradient-to-r from-red-400 to-orange-400'
                            : workload >= 70
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                            : 'bg-gradient-to-r from-emerald-400 to-green-400'
                        }`}
                        style={{ width: `${workload}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-border-low">
                    <button
                      className="flex-1 py-2.5 px-4 rounded-lg bg-electric-blue/10 border border-electric-blue/30 hover:bg-electric-blue/20 transition-all text-electric-blue font-medium text-sm flex items-center justify-center gap-2"
                      title={t('projectDetails.messageBtn')}
                    >
                      <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                      {t('projectDetails.messageBtn')}
                    </button>
                    <button
                      className="flex-1 py-2.5 px-4 rounded-lg bg-surface-container-low border border-border-low hover:bg-surface-container transition-all text-on-surface font-medium text-sm flex items-center justify-center gap-2"
                      title={t('projectDetails.viewProfileBtn')}
                    >
                      {t('projectDetails.viewProfileBtn')}
                    </button>
                  </div>

                  {/* Remove Button (Owner Only) */}
                  {isOwner && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-300 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-red-400/10"
                      title={t('projectDetails.failedRemoveMember')}
                    >
                      <span className="material-symbols-outlined text-[18px]">person_remove</span>
                    </button>
                  )}

                  {/* Owner Badge */}
                  {member.role === 'owner' && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-purple-400/20 text-purple-400 border border-purple-400/30">
                        {t('projectDetails.ownerBadge')}
                      </span>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </Card>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">{t('projectDetails.addTeamMemberModal')}</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsAddMemberOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <Input
                label={t('projectDetails.emailAddressLabel')}
                type="email"
                placeholder={t('projectDetails.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <div>
                <TextArea
                  label={t('projectDetails.skillsFieldLabel')}
                  placeholder={t('projectDetails.skillsPlaceholder')}
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-on-surface-variant mt-1">{t('projectDetails.commaSeparated')}</p>
              </div>

              <Select
                label={t('projectDetails.roleSelectLabel')}
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                options={[
                  { value: '', label: t('projectDetails.selectPosition') },
                  { value: 'Full Stack Engineer', label: t('projectDetails.roleFullStack') },
                  { value: 'AI Specialist', label: t('projectDetails.roleAI') },
                  { value: 'Product Designer', label: t('projectDetails.roleDesigner') },
                  { value: 'QA Engineer', label: t('projectDetails.roleQA') },
                  { value: 'Backend Developer', label: t('projectDetails.roleBackend') },
                  { value: 'Frontend Developer', label: t('projectDetails.roleFrontend') },
                  { value: 'DevOps Engineer', label: t('projectDetails.roleDevOps') },
                  { value: 'Project Manager', label: t('projectDetails.rolePM') },
                ]}
                required
              />

              <Select
                label={t('projectDetails.statusSelectLabel')}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'available', label: t('projectDetails.statusAvailable') },
                  { value: 'busy', label: t('projectDetails.statusBusy') },
                  { value: 'on-leave', label: t('projectDetails.statusOnLeave') },
                ]}
                required
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAddMemberOpen(false)}
                  disabled={addMemberMutation.isPending}
                >
                  {t('projectDetails.cancel')}
                </Button>
                <Button type="submit" disabled={addMemberMutation.isPending}>
                  {addMemberMutation.isPending ? t('projectDetails.addingMember') : t('projectDetails.saveMemberBtn')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
