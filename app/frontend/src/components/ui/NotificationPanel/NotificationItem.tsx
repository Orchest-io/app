import type { Notification } from '@orchest/shared'
import { formatRelativeTime } from '../../../utils/formatRelativeTime'

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const { id, title, message, createdAt, isRead } = notification

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors duration-150 ${
        !isRead
          ? 'bg-electric-blue/5 border-l-2 border-electric-blue'
          : 'border-l-2 border-transparent'
      }`}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface leading-snug">{title}</p>
        {message && (
          <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{message}</p>
        )}
        <p className="text-xs text-on-surface-variant/60 mt-1">
          {formatRelativeTime(createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!isRead && (
          <button
            onClick={() => onMarkRead(id)}
            aria-label="Mark notification as read"
            className="p-1 rounded text-on-surface-variant hover:text-electric-blue hover:bg-electric-blue/10 transition-colors duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">done</span>
          </button>
        )}
        <button
          onClick={() => onDelete(id)}
          aria-label="Delete notification"
          className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors duration-150 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  )
}
