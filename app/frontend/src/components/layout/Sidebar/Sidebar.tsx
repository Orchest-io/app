import { NavLink, useNavigate, useLocation, matchPath } from 'react-router-dom'
import { logoutUser } from '../../../api/users.api'
import { useTranslation } from 'react-i18next'

type NavItem = {
  key: string
  label: string
  icon: string
  path: string
}

const getNavItems = (projectId?: string): NavItem[] => [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { key: 'projects', label: 'Projects', icon: 'tactic', path: '/projects' },
  { key: 'analytics', label: 'Analytics', icon: 'insights', path: projectId ? `/projects/${projectId}/analytics` : '/projects' },
  { key: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
]

type SidebarProps = {
  collapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const location = useLocation()
  
  const match = matchPath({ path: '/projects/:projectId/*' }, location.pathname)
  const projectId = match?.params.projectId

  const navItems = getNavItems(projectId)

  const handleLogout = async () => {
    await logoutUser()
    navigate('/', { replace: true })
  }

  return (
    <aside
      className={`fixed top-0 h-screen bg-surface-container-low flex flex-col p-4 z-50 transition-[width] duration-300 overflow-hidden ${
        collapsed ? 'w-sidebar-c items-center' : 'w-sidebar-w'
      } ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l border-border-low`}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-2 mb-8 w-full cursor-pointer hover:opacity-90 select-none"
        onClick={() => navigate('/')}
      >
        {collapsed ? (
          <img 
            src="/orkest-icon.png" 
            alt="Orkest" 
            className="w-22 h-22 shrink-0"
          />
        ) : (
          <img 
            src="/orkest-logo.png" 
            alt="Orkest - Intelligent Team Orchestration Platform" 
            className="h-18 w-auto"
          /> 
        )}
      </div>
      {/* New Project button */}
      <button
        className={`w-full bg-gradient-to-br from-electric-blue to-primary-container text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 mb-6 shadow-[0_4px_15px_rgba(0,123,255,0.2)] active:scale-95 cursor-pointer ${
          collapsed ? 'p-3' : 'py-3 px-4'
        }`}
        onClick={() => navigate('/projects')}
      >
        <span className="material-symbols-outlined">add</span>
        {!collapsed && t('sidebar.newProject')}
      </button>

      {/* Nav links */}
      <nav className="flex-1 flex flex-col gap-1 w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center rounded-sm text-sm cursor-pointer transition-all duration-150 whitespace-nowrap hover:text-on-surface hover:bg-surface-glass ${
                collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4'
              } ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'}`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {!collapsed && t(`sidebar.${item.key}`)}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto border-t border-border-low pt-3 flex flex-col gap-1 w-full">
        {/* Collapse toggle */}
        <a
          className={`flex items-center rounded-sm text-sm text-on-surface-variant cursor-pointer transition-all duration-150 whitespace-nowrap hover:text-on-surface hover:bg-surface-glass ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4'
          }`}
          onClick={onToggle}
        >
          <span className="material-symbols-outlined">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!collapsed && (collapsed ? t('sidebar.expand') : t('sidebar.collapse'))}
        </a>

        {/* Help */}
        <a
          className={`flex items-center rounded-sm text-sm text-on-surface-variant cursor-pointer transition-all duration-150 whitespace-nowrap hover:text-on-surface hover:bg-surface-glass ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4'
          }`}
        >
          <span className="material-symbols-outlined">help</span>
          {!collapsed && t('sidebar.help')}
        </a>

        {/* Notifications */}
        <a
          className={`flex items-center rounded-sm text-sm text-on-surface-variant cursor-pointer transition-all duration-150 whitespace-nowrap hover:text-on-surface hover:bg-surface-glass ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4 justify-between'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">notifications</span>
            {!collapsed && t('sidebar.notifications')}
          </div>
          {!collapsed && <span className="w-2 h-2 bg-electric-blue rounded-full shrink-0" />}
        </a>

        {/* Logout */}
        <a
          className={`flex items-center rounded-sm text-sm text-error cursor-pointer transition-all duration-150 whitespace-nowrap hover:bg-error/10 ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4'
          }`}
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          {!collapsed && t('sidebar.signOut')}
        </a>
      </div>
    </aside>
  )
}

