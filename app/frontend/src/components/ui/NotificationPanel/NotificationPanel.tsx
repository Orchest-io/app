import { useState, useRef, useEffect } from 'react'
import type { Notification } from '@orchest/shared'
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useDeleteNotification,
  useMarkAllRead,
} from '../../../hooks/useNotifications'
import NotificationItem from './NotificationItem'

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [allItems, setAllItems] = useState<Notification[]>([])

  const panelRef = useRef<HTMLDivElement>(null)

  const unreadCount = useUnreadCount()
  const { data, isLoading } = useNotifications(page, 20)
  const markRead = useMarkRead()
  const deleteNotif = useDeleteNotification()
  const markAllRead = useMarkAllRead()

  const total = data?.total ?? 0

  // Append newly fetched page data to allItems
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        // On first page or reset, replace
        setAllItems(data.data)
      } else {
        // On subsequent pages, append (avoid duplicates by id)
        setAllItems((prev) => {
          const existingIds = new Set(prev.map((n) => n.id))
          const newItems = data.data.filter((n) => !existingIds.has(n.id))
          return [...prev, ...newItems]
        })
      }
    }
  }, [data, page])

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkRead = (id: string) => {
    markRead.mutate(id)
  }

  const handleDelete = (id: string) => {
    deleteNotif.mutate(id)
  }

  const handleLoadMore = () => {
    setPage((p) => p + 1)
  }

  const handleToggle = () => {
    setOpen((v) => !v)
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        className="relative text-on-surface-variant p-1.5 rounded-sm hover:text-primary transition-colors duration-150 cursor-pointer"
      >
        <span className="material-symbols-outlined">notifications</span>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="region"
          aria-label="Notification list"
          className="absolute right-0 top-11 w-80 max-h-[480px] overflow-y-auto z-50 bg-surface-container-low border border-border-low rounded-xl shadow-2xl"
        >
          {/* Panel header — sticky so it stays visible while list scrolls */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-border-low">
            <h2 className="text-sm font-semibold text-on-surface">Notifications</h2>
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              aria-label="Mark all notifications as read"
              className="text-xs text-electric-blue hover:text-electric-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
            >
              Mark all read
            </button>
          </div>

          {/* Panel body */}
          <div>
            {isLoading && allItems.length === 0 ? (
              /* Loading skeleton */
              <div className="px-4 py-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-surface-container rounded w-3/4" />
                      <div className="h-2 bg-surface-container rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allItems.length === 0 ? (
              /* Empty state */
              <div className="px-4 py-8 text-center">
                <span
                  className="material-symbols-outlined text-[32px] text-on-surface-variant/40 mb-2 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  notifications_none
                </span>
                <p className="text-sm text-on-surface-variant">You're all caught up</p>
              </div>
            ) : (
              <>
                {/* Notification list */}
                <div className="divide-y divide-border-low">
                  {allItems.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Load more button */}
                {allItems.length < total && (
                  <div className="px-4 py-3 border-t border-border-low">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="w-full text-xs text-on-surface-variant hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer py-1"
                    >
                      {isLoading ? 'Loading…' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
