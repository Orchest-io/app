import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, Button, Input, Select } from '../../components/ui'
import { mockDb } from '../../utils/mockDb'
import type { ProjectMember, User } from '../../utils/mockDb'

type MemberWithUser = ProjectMember & { user?: User }

export default function ProjectMembers() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [projectName, setProjectName] = useState('')
  const [members, setMembers] = useState<MemberWithUser[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [inviteRole, setInviteRole] = useState('Developer')
  const [submitting, setSubmitting] = useState(false)

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')

  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  const fetchData = () => {
    if (!projectId) return
    setLoading(true)
    setTimeout(() => {
      try {
        const project = mockDb.getProject(projectId)
        if (project) {
          setProjectName(project.name)
          setMembers((project.members || []) as MemberWithUser[])
        }
        const users = mockDb.getUsers()
        setAllUsers(users)
        if (users.length > 0) setSelectedUserId(users[0].id)
      } catch (err: any) {
        toast.error('Failed to load members: ' + err.message)
      } finally {
        setLoading(false)
      }
    }, 200)
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !projectId) {
      toast.warning('Please select a user')
      return
    }

    const alreadyMember = members.some((m) => m.userId === selectedUserId)
    if (alreadyMember) {
      toast.error('This user is already a member of the project')
      return
    }

    try {
      setSubmitting(true)
      mockDb.addProjectMember(projectId, selectedUserId, inviteRole)
      toast.success('Member invited successfully!')
      setIsInviteOpen(false)
      setInviteRole('Developer')
      fetchData()
    } catch (err: any) {
      toast.error('Failed to invite member: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEditRole = (member: MemberWithUser) => {
    setEditingMemberId(member.id)
    setEditRole(member.role || '')
  }

  const handleSaveRole = (member: MemberWithUser) => {
    if (!projectId) return
    if (!editRole.trim()) {
      toast.warning('Please enter a role')
      return
    }

    try {
      mockDb.updateProjectMember(projectId, member.id, editRole.trim())
      toast.success('Role updated successfully!')
      setEditingMemberId(null)
      fetchData()
    } catch (err: any) {
      toast.error('Failed to update role: ' + err.message)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    if (!projectId) return

    try {
      mockDb.removeProjectMember(projectId, memberId)
      toast.info('Member removed from project')
      setConfirmRemoveId(null)
      fetchData()
    } catch (err: any) {
      toast.error('Failed to remove member: ' + err.message)
    }
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  const avatarColors = [
    'from-blue-500 to-indigo-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-500',
  ]

  const getAvatarColor = (id: string) =>
    avatarColors[id.charCodeAt(id.length - 1) % avatarColors.length]

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-on-surface-variant">Loading members...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[900px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface mb-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to {projectName || 'Project'}
          </button>
          <h2 className="font-heading text-[32px] font-semibold text-on-surface">
            Project Members
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage team access and roles for this project.
          </p>
        </div>

        <Button icon="person_add" onClick={() => setIsInviteOpen(true)}>
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">Total Members</p>
          <p className="text-[28px] font-bold font-heading text-on-surface">{members.length}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">Owners</p>
          <p className="text-[28px] font-bold font-heading text-on-surface">
            {members.filter((m) => m.role?.toLowerCase() === 'owner').length}
          </p>
        </Card>
        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">Contributors</p>
          <p className="text-[28px] font-bold font-heading text-on-surface">
            {members.filter((m) => m.role?.toLowerCase() !== 'owner').length}
          </p>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        {members.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
            <p className="text-sm font-medium text-on-surface">No members yet</p>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">
              Invite team members to collaborate on this project.
            </p>
            <Button size="sm" icon="person_add" onClick={() => setIsInviteOpen(true)}>
              Invite Member
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {members.map((member) => {
              const name = member.user?.fullName || 'Unknown User'
              const email = member.user?.email || ''
              const isEditing = editingMemberId === member.id
              const isConfirmingRemove = confirmRemoveId === member.id

              return (
                <div
                  key={member.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-surface-container-low border border-border-low gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(member.id)} flex items-center justify-center text-white font-heading font-semibold text-lg shrink-0`}
                    >
                      {getInitials(name)}
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-semibold text-on-surface">{name}</h4>
                      <p className="text-xs text-on-surface-variant font-mono">{email}</p>
                      {!isEditing && (
                        <p className="text-[11px] font-medium text-primary mt-0.5">
                          {member.role || 'Member'}
                        </p>
                      )}
                      {isEditing && (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            placeholder="Enter role..."
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="!gap-0"
                          />
                          <Button size="sm" onClick={() => handleSaveRole(member)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingMemberId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border-low">
                    <span className="text-[10px] text-on-surface-variant">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>

                    {isConfirmingRemove ? (
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-red-400">Remove?</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="!text-red-400"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Yes
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmRemoveId(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 ml-2">
                        {!isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon="edit"
                            onClick={() => handleStartEditRole(member)}
                          >
                            Role
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="person_remove"
                          onClick={() => setConfirmRemoveId(member.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl font-semibold text-on-surface">Invite Team Member</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setIsInviteOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="flex flex-col gap-4">
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
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                required
              />

              <div className="flex gap-3 justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" icon="person_add" disabled={submitting}>
                  {submitting ? 'Inviting...' : 'Invite Member'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
