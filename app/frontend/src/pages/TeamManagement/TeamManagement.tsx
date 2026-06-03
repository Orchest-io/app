import { useState } from 'react'
import { Button, Input, Card, Select } from '../../components/ui'
import { toast } from 'sonner'

export default function TeamManagement() {
  const [members, setMembers] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberSkills, setNewMemberSkills] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('Full Stack Engineer')
  const [newMemberStatus, setNewMemberStatus] = useState('Available')

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      toast.error('Please enter a member name')
      return
    }
    if (!newMemberEmail.trim()) {
      toast.error('Please enter a member email')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newMemberEmail)) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!newMemberSkills.trim()) {
      toast.error('Please enter at least one skill')
      return
    }

    const parsedSkills = newMemberSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const colors = [
      'from-blue-500 to-indigo-500',
      'from-purple-500 to-pink-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-red-500'
    ]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    const newMember = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      status: newMemberStatus,
      tasks: 0,
      avatarColor: randomColor,
      skills: parsedSkills
    }
    
    setMembers([...members, newMember])
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberSkills('')
    setShowAddForm(false)
    toast.success(`${newMemberName} added to the team successfully!`)
  }

  const handleRemoveMember = (id: string) => {
    const member = members.find((m) => m.id === id)
    setMembers(members.filter((m) => m.id !== id))
    if (member) {
      toast.info(`${member.name} removed from the team`)
    }
  }

  return (
    <div className="max-w-[900px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-heading text-[32px] font-semibold text-on-surface">
          Team Management
        </h2>
        <Button icon={showAddForm ? 'close' : 'person_add'} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Close Form' : 'Add Member'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Full Name"
              icon="person"
              placeholder="Enter full name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
            />
            <Input
              label="Email Address"
              icon="mail"
              placeholder="Enter email address"
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              label="Skills"
              icon="architecture"
              placeholder="e.g. React, Node.js, CSS"
              value={newMemberSkills}
              onChange={(e) => setNewMemberSkills(e.target.value)}
            />
            <Select
              label="Role"
              options={[
                { value: 'Full Stack Engineer', label: 'Full Stack Engineer' },
                { value: 'AI Specialist', label: 'AI Specialist' },
                { value: 'Product Designer', label: 'Product Designer' },
                { value: 'QA Engineer', label: 'QA Engineer' },
              ]}
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
            />
            <Select
              label="Status"
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Busy', label: 'Busy' },
                { value: 'On Leave', label: 'On Leave' },
              ]}
              value={newMemberStatus}
              onChange={(e) => setNewMemberStatus(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Save Member
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">Total Members</p>
          <p className="text-[28px] font-bold font-heading text-on-surface">{members.length}</p>
        </Card>
        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">Available Now</p>
          <p className="text-[28px] font-bold font-heading text-on-surface">
            {members.filter((m) => m.status === 'Available').length}
          </p>
        </Card>
        <Card>
          <p className="text-[12px] text-on-surface-variant mb-2 font-medium uppercase tracking-wider">Busy / On Leave</p>
          <p className="text-[28px] font-bold font-heading text-on-surface">
            {members.filter((m) => m.status !== 'Available').length}
          </p>
        </Card>
      </div>

      <Card>
        {members.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
            <p className="text-sm font-medium text-on-surface">No team members added yet</p>
            <p className="text-xs text-on-surface-variant mt-1">Click "Add Member" above to start building your team.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-surface-container-low border border-border-low gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-heading font-semibold text-lg shrink-0`}>
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-semibold text-on-surface">{member.name}</h4>
                    <p className="text-xs text-on-surface-variant font-mono">{member.email}</p>
                    <p className="text-[11px] font-medium text-primary mt-1">{member.role}</p>
                    
                    {member.skills && member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container-high text-on-surface border border-border-low"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-border-low">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    member.status === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : member.status === 'Busy'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {member.status}
                  </span>
                  <div className="w-[100px] text-right hidden sm:block">
                    <span className="text-xs text-on-surface-variant">{member.tasks} tasks assigned</span>
                  </div>
                  <Button size="sm" variant="ghost" icon="delete" onClick={() => handleRemoveMember(member.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
