<<<<<<< HEAD
import { useTranslation } from 'react-i18next'
=======
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
import Card from '../ui/Card/Card'
import { formatRelativeTime } from '../../utils/formatRelativeTime'
import type { ActivityLog } from '../../pages/Dashboard/dashboard.types'

interface RecentActivityCardProps {
  logs: ActivityLog[]
  isLoading: boolean
  isError: boolean
}

const ACTION_ICON: Record<string, { icon: string; color: string }> = {
  created: { icon: 'add_circle', color: 'text-emerald-400' },
  updated: { icon: 'edit', color: 'text-electric-blue' },
  deleted: { icon: 'delete', color: 'text-error' },
  completed: { icon: 'task_alt', color: 'text-emerald-400' },
  assigned: { icon: 'person_add', color: 'text-peri-purple' },
  commented: { icon: 'comment', color: 'text-amber-400' },
  merged: { icon: 'merge', color: 'text-peri-purple' },
}

function ActivitySkeleton() {
  return (
    <div className="animate-pulse flex items-start gap-3 py-3">
      <div className="w-8 h-8 rounded-full bg-surface-container shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3 bg-surface-container rounded w-3/4" />
        <div className="h-2.5 bg-surface-container rounded w-1/3" />
      </div>
    </div>
  )
}

function ActivityEntry({ log }: { log: ActivityLog }) {
  const meta = ACTION_ICON[log.action ?? ''] ?? { icon: 'history', color: 'text-on-surface-variant' }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-low last:border-0">
      {/* Avatar / Icon */}
      <div className="w-8 h-8 rounded-full bg-surface-container-high border border-border-low flex items-center justify-center shrink-0">
        <span className={`material-symbols-outlined text-[16px] ${meta.color}`}>
          {meta.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface leading-snug line-clamp-2">
          {log.description ?? `${log.action} on ${log.entityType}`}
        </p>
        <p className="text-[11px] text-on-surface-variant/60 mt-1">
          {formatRelativeTime(log.createdAt)}
        </p>
      </div>
    </div>
  )
}

export default function RecentActivityCard({
  logs,
  isLoading,
  isError,
}: RecentActivityCardProps) {
<<<<<<< HEAD
  const { t } = useTranslation()

=======
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
  return (
    <Card padding="md">
      {/* Header */}
      <h3 className="font-heading text-base font-semibold text-on-surface flex items-center gap-2 mb-4">
        <span
          className="material-symbols-outlined text-amber-400 text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          history
        </span>
<<<<<<< HEAD
        {t('dashboard.recentActivity')}
=======
        Recent Activity
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
      </h3>

      {isLoading ? (
        <div className="divide-y divide-border-low">
          {[1, 2, 3].map((i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="py-6 text-center">
          <span className="material-symbols-outlined text-[32px] text-error/60 mb-2 block">error</span>
<<<<<<< HEAD
          <p className="text-sm text-on-surface-variant">{t('dashboard.failedLoadActivity')}</p>
=======
          <p className="text-sm text-on-surface-variant">Failed to load activity</p>
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
        </div>
      ) : logs.length === 0 ? (
        <div className="py-8 text-center">
          <span
            className="material-symbols-outlined text-[40px] text-on-surface-variant/30 mb-2 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            history_toggle_off
          </span>
<<<<<<< HEAD
          <p className="text-sm text-on-surface-variant font-medium">{t('dashboard.noRecentActivity')}</p>
          <p className="text-xs text-on-surface-variant/60 mt-1 leading-relaxed">
            {t('dashboard.activityWillAppear')}
=======
          <p className="text-sm text-on-surface-variant font-medium">No recent activity</p>
          <p className="text-xs text-on-surface-variant/60 mt-1 leading-relaxed">
            Activity will appear here as your team works.
>>>>>>> c4de3810ef7844afb12cec71b8f19dc97aa60bd7
          </p>
        </div>
      ) : (
        <div>
          {logs.slice(0, 5).map((log) => (
            <ActivityEntry key={log.id} log={log} />
          ))}
        </div>
      )}
    </Card>
  )
}
