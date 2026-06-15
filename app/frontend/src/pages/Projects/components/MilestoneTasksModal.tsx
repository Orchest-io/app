import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { assignTasksToMilestone, removeTaskFromMilestone } from '../../../api/projects.api'

interface MilestoneTasksModalProps {
  milestone: {
    id: string
    title: string
    color: string | null
    taskCount?: number
    doneCount?: number
  }
  projectId: string
  allProjectTasks: any[]
  onClose: () => void
  onAssigned: () => void
}

const STATUS_LABEL: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
}

const STATUS_COLOR: Record<string, string> = {
  backlog: 'text-on-surface-variant bg-white/5 border-white/10',
  todo: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'in-progress': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  review: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  done: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

export default function MilestoneTasksModal({
  milestone,
  allProjectTasks,
  onClose,
  onAssigned,
}: MilestoneTasksModalProps) {
  const color = milestone.color || '#6366f1'

  // Build selection state: pre-check tasks already in this milestone
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(allProjectTasks.filter((t) => t.milestoneId === milestone.id).map((t) => t.id))
  )
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  // Reset when milestone changes
  useEffect(() => {
    setSelected(new Set(allProjectTasks.filter((t) => t.milestoneId === milestone.id).map((t) => t.id)))
  }, [milestone.id, allProjectTasks])

  const filteredTasks = allProjectTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (taskId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const previouslyAssigned = new Set(
        allProjectTasks.filter((t) => t.milestoneId === milestone.id).map((t) => t.id)
      )

      // Tasks to assign (newly selected that weren't previously assigned)
      const toAssign = [...selected].filter((id) => !previouslyAssigned.has(id))
      // Tasks to unassign (previously assigned but now deselected)
      const toUnassign = [...previouslyAssigned].filter((id) => !selected.has(id))

      if (toAssign.length > 0) {
        await assignTasksToMilestone(milestone.id, { taskIds: toAssign })
      }

      for (const taskId of toUnassign) {
        await removeTaskFromMilestone(milestone.id, taskId)
      }

      const assignedCount = toAssign.length
      const unassignedCount = toUnassign.length

      if (assignedCount > 0 || unassignedCount > 0) {
        const parts = []
        if (assignedCount > 0) parts.push(`${assignedCount} task${assignedCount > 1 ? 's' : ''} assigned`)
        if (unassignedCount > 0) parts.push(`${unassignedCount} task${unassignedCount > 1 ? 's' : ''} unassigned`)
        toast.success(parts.join(', '))
        onAssigned()
      } else {
        toast.info('No changes made')
      }

      onClose()
    } catch (err: any) {
      toast.error('Failed to update tasks: ' + (err?.response?.data?.message ?? err.message))
    } finally {
      setSaving(false)
    }
  }

  const assignedInSelection = filteredTasks.filter((t) => selected.has(t.id)).length

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ color }}>flag</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base font-semibold text-on-surface truncate">
              Assign Tasks to Milestone
            </h3>
            <p className="text-xs text-on-surface-variant truncate">{milestone.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search + Count */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-electric-blue/50"
            />
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {assignedInSelection} selected
          </span>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 flex flex-col gap-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant/30 mb-2">task_alt</span>
              <p className="text-sm text-on-surface-variant">
                {search ? 'No tasks match your search' : 'No tasks in this project yet'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isChecked = selected.has(task.id)
              const isOtherMilestone = task.milestoneId && task.milestoneId !== milestone.id
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggle(task.id)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    isChecked
                      ? 'border-opacity-50 bg-opacity-10'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                  }`}
                  style={isChecked ? {
                    borderColor: `${color}50`,
                    backgroundColor: `${color}10`,
                  } : {}}
                >
                  {/* Checkbox */}
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                    style={isChecked
                      ? { backgroundColor: color, borderColor: color }
                      : { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  >
                    {isChecked && (
                      <span className="material-symbols-outlined text-[13px] text-white">check</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-on-surface line-clamp-1">{task.title}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${STATUS_COLOR[task.status] || STATUS_COLOR.backlog}`}>
                        {STATUS_LABEL[task.status] || task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                    {isOtherMilestone && !isChecked && (
                      <p className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        Already in another milestone
                      </p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-white/10">
          <p className="text-xs text-on-surface-variant">
            {allProjectTasks.length} task{allProjectTasks.length !== 1 ? 's' : ''} total
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-on-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
