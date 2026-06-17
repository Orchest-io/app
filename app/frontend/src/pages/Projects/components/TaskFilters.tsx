import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskPriority, FilterState } from '../types/kanban.types'

interface Member {
  userId: string
  user?: {
    fullName?: string
    avatarUrl?: string
  }
}

interface TaskFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  projectMembers?: Member[]
}

export default function TaskFilters({ filters, onFiltersChange, projectMembers = [] }: TaskFiltersProps) {
  const { t } = useTranslation()
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMemberDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchQuery: e.target.value })
  }

  const handlePriorityChange = (priority: TaskPriority | 'all') => {
    onFiltersChange({ ...filters, priority })
  }

  const handleAssigneeChange = (assigneeId: string | null) => {
    onFiltersChange({ ...filters, assigneeId })
    setMemberDropdownOpen(false)
  }

  const handleReset = () => {
    onFiltersChange({ searchQuery: '', priority: 'all', assigneeId: null })
  }

  const priorities: (TaskPriority | 'all')[] = ['all', 'low', 'medium', 'high']

  const getPriorityLabel = (p: TaskPriority | 'all') => {
    switch (p) {
      case 'all': return t('kanban.allPriorities')
      case 'low': return t('projects.priorityLow')
      case 'medium': return t('projects.priorityMedium')
      case 'high': return t('projects.priorityHigh')
      default: return p
    }
  }

  const selectedMember = filters.assigneeId
    ? projectMembers.find((m) => m.userId === filters.assigneeId)
    : null

  const selectedMemberName = selectedMember?.user?.fullName || t('kanban.allMembers') || 'All Members'
  const selectedMemberAvatar = selectedMember?.user?.avatarUrl

  const hasActiveFilters = filters.searchQuery || filters.priority !== 'all' || filters.assigneeId !== null

  return (
    <div className="flex items-center gap-3 bg-surface-container px-4 py-3 rounded-xl border border-white/5 mb-6 flex-wrap">

      {/* Search Input */}
      <div className="relative shrink-0 w-48">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[18px]">
          search
        </span>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder={t('kanban.searchPlaceholder') || 'Search tasks...'}
          className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/40 rounded-lg pl-9 pr-3 py-2 text-xs border border-white/10 focus:outline-none focus:border-electric-blue/50 transition-colors"
        />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10 shrink-0" />

      {/* Priority label */}
      <span className="text-xs text-on-surface-variant font-medium shrink-0">
        {t('kanban.priorityLabel')}
      </span>

      {/* Priority Pills */}
      <div className="flex bg-surface-container-lowest p-1 rounded-lg border border-white/10 shrink-0">
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => handlePriorityChange(p)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              filters.priority === p
                ? 'bg-electric-blue text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`}
          >
            {getPriorityLabel(p)}
          </button>
        ))}
      </div>

      {/* Member Filter — only when members exist */}
      {projectMembers.length > 0 && (
        <>
          {/* Divider */}
          <div className="h-6 w-px bg-white/10 shrink-0" />

          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setMemberDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                filters.assigneeId
                  ? 'bg-electric-blue/10 border-electric-blue/30 text-electric-blue'
                  : 'bg-surface-container-lowest border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              {selectedMemberAvatar ? (
                <img src={selectedMemberAvatar} alt={selectedMemberName} className="w-4 h-4 rounded-full object-cover shrink-0" />
              ) : filters.assigneeId ? (
                <div className="w-4 h-4 rounded-full bg-electric-blue/20 text-electric-blue flex items-center justify-center text-[9px] font-bold shrink-0">
                  {selectedMemberName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <span className="material-symbols-outlined text-[15px] shrink-0">person</span>
              )}
              <span className="max-w-[110px] truncate">{selectedMemberName}</span>
              <span className="material-symbols-outlined text-[14px] opacity-60 shrink-0">
                {memberDropdownOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {memberDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-surface-container-high border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                {/* All members */}
                <button
                  onClick={() => handleAssigneeChange(null)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                    filters.assigneeId === null
                      ? 'bg-electric-blue/10 text-electric-blue'
                      : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  {t('kanban.allMembers') || 'All Members'}
                  {filters.assigneeId === null && (
                    <span className="material-symbols-outlined text-[14px] ml-auto">check</span>
                  )}
                </button>

                <div className="h-px bg-white/5 mx-2 my-1" />

                {projectMembers.map((member) => {
                  const name = member.user?.fullName || 'Unknown'
                  const avatar = member.user?.avatarUrl
                  const isSelected = filters.assigneeId === member.userId
                  return (
                    <button
                      key={member.userId}
                      onClick={() => handleAssigneeChange(member.userId)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-electric-blue/10 text-electric-blue'
                          : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                      }`}
                    >
                      {avatar ? (
                        <img src={avatar} alt={name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-electric-blue/10 text-electric-blue flex items-center justify-center text-[9px] font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate">{name}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[14px] ml-auto shrink-0">check</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <div className="h-6 w-px bg-white/10 shrink-0" />
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-error hover:bg-error/10 rounded-lg transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            {t('kanban.clearFilters')}
          </button>
        </>
      )}
    </div>
  )
}
