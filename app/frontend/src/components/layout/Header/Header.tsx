import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../../api/users.api'
import NotificationPanel from '../../ui/NotificationPanel/NotificationPanel'
import { useMe } from '../../../hooks/useSettings'

type HeaderProps = {
  collapsed?: boolean
}

export default function Header({ collapsed = false }: HeaderProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const userId = localStorage.getItem('orchest_user_id')
  const { data: user } = useMe()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/', { replace: true })
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className="fixed top-0 right-0 h-header-h bg-[#131313]/80 backdrop-blur-md border-b border-border-low flex items-center justify-between px-6 z-40 transition-[width] duration-300"
      style={{ width: `calc(100% - ${collapsed ? 'var(--spacing-sidebar-c)' : 'var(--spacing-sidebar-w)'})` }}
    >
      {/* Search */}
      <div className="relative w-full max-w-[420px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant material-symbols-outlined">
          search
        </span>
        <input
          className="w-full py-2 pl-10 pr-[60px] bg-surface-container-low border border-border-low rounded-md text-sm text-on-surface transition-colors duration-150 placeholder:text-on-surface-variant/60 focus:border-electric-blue/50 focus:shadow-[0_0_0_2px_rgba(0,123,255,0.15)] outline-none"
          placeholder="Search tasks, teams, or AI insights..."
          type="text"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-on-surface-variant bg-surface-container py-0.5 px-1.5 rounded border border-border-low font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* AI Copilot Indicator */}
        <div className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-surface-container-high border border-peri-purple/20 text-peri-purple text-[12px] font-medium tracking-wider">
          <span
            className="material-symbols-outlined animate-pulse"
            style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          AI Active
        </div>

        {/* Theme Toggle */}
        <button className="text-on-surface-variant p-1.5 rounded-sm hover:text-primary transition-colors duration-150 cursor-pointer">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>

        {/* Notification Bell + Panel */}
        <NotificationPanel />

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            className="w-8 h-8 rounded-full bg-electric-blue/20 border border-electric-blue/40 flex items-center justify-center text-electric-blue font-heading font-bold text-xs hover:bg-electric-blue/30 transition-colors cursor-pointer overflow-hidden"
            onClick={() => setMenuOpen((v) => !v)}
            title="Account menu"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user?.fullName ? (
                <span>{user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">person</span>
              )
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-52 bg-surface-container-low border border-border-low rounded-xl shadow-2xl overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border-low">
                <p className="text-[11px] text-on-surface-variant">Signed in as</p>
                <p className="text-xs font-semibold text-on-surface truncate mt-0.5">
                  {user?.fullName || '—'}
                </p>
                <p className="text-[10px] text-on-surface-variant/80 truncate font-mono mt-0.5">
                  {user?.email || (userId ? `${userId.slice(0, 8)}...` : '—')}
                </p>
              </div>

              {/* Menu items */}
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-glass hover:text-on-surface transition-colors cursor-pointer"
                onClick={() => { setMenuOpen(false); navigate('/dashboard') }}
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Dashboard
              </button>

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-glass hover:text-on-surface transition-colors cursor-pointer"
                onClick={() => { setMenuOpen(false); navigate('/settings') }}
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Settings
              </button>

              <div className="border-t border-border-low mt-1" />

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
