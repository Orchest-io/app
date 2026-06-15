import React from 'react'
import { useTranslation } from 'react-i18next'
import type { TaskPriority, FilterState } from '../types/kanban.types'

interface TaskFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export default function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const { t } = useTranslation()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: e.target.value,
    })
  }

  const handlePriorityChange = (priority: TaskPriority | 'all') => {
    onFiltersChange({
      ...filters,
      priority,
    })
  }

  const handleReset = () => {
    onFiltersChange({
      searchQuery: '',
      priority: 'all',
    })
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

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container p-4 rounded-xl border border-white/5 mb-6">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[20px]">
          search
        </span>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder={t('kanban.searchPlaceholder') || 'Search tasks by title...'}
          className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/40 rounded-lg pl-10 pr-4 py-2 text-sm border border-white/10 focus:outline-none focus:border-electric-blue/50 transition-colors"
        />
      </div>

      {/* Priority Selector & Reset */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <span className="text-xs text-on-surface-variant font-medium mr-2">{t('kanban.priorityLabel')}</span>
        <div className="flex bg-surface-container-lowest p-1 rounded-lg border border-white/10">
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

        {(filters.searchQuery || filters.priority !== 'all') && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-error hover:bg-error/10 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            {t('kanban.clearFilters')}
          </button>
        )}
      </div>
    </div>
  )
}
