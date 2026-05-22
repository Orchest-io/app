
type NavItem = {
  key: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'projects', label: 'Projects', icon: 'tactic' },
  { key: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { key: 'team', label: 'Team', icon: 'group' },
  { key: 'analytics', label: 'Analytics', icon: 'insights' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

type SidebarProps = {
  activePage?: string
  onNavigate?: (key: string) => void
  collapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({
  activePage = 'dashboard',
  onNavigate,
  collapsed = false,
  onToggle,
}: SidebarProps) {

  const handleNav = (key: string) => {
    onNavigate?.(key)
  }

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-surface-container-low border-r border-border-low flex flex-col p-4 z-50 transition-[width] duration-300 overflow-hidden ${
      collapsed ? 'w-sidebar-c items-center' : 'w-sidebar-w'
    }`}>

      <div className="flex items-center gap-3 px-2 mb-8 w-full">
        <div className="w-10 h-10 rounded-md bg-electric-blue flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,123,255,0.4)] shrink-0">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            tactic
          </span>
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-heading text-lg font-bold leading-none text-on-surface">Orchist</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">AI Smart Planner</p>
          </div>
        )}
      </div>

      <button
        className={`w-full bg-gradient-to-br from-electric-blue to-primary-container text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 mb-6 shadow-[0_4px_15px_rgba(0,123,255,0.2)] active:scale-95 cursor-pointer ${
          collapsed ? 'p-3' : 'py-3 px-4'
        }`}
        onClick={() => onNavigate?.('new-project')}
      >
        <span className="material-symbols-outlined">add</span>
        {!collapsed && 'New Project'}
      </button>

      <nav className="flex-1 flex flex-col gap-1 w-full">
        {navItems.map((item) => (
          <a
            key={item.key}
            className={`flex items-center rounded-sm text-sm cursor-pointer transition-all duration-150 whitespace-nowrap hover:text-on-surface hover:bg-surface-glass ${
              collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4'
            } ${
              activePage === item.key
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant'
            }`}
            onClick={() => handleNav(item.key)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {!collapsed && item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto border-t border-border-low pt-3 flex flex-col gap-1 w-full">
        <a
          className={`flex items-center rounded-sm text-sm text-on-surface-variant cursor-pointer transition-all duration-150 whitespace-nowrap hover:text-on-surface hover:bg-surface-glass ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4'
          }`}
          onClick={onToggle}
        >
          <span className="material-symbols-outlined">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!collapsed && 'Collapse'}
        </a>
        <a
          className={`flex items-center rounded-sm text-sm text-on-surface-variant cursor-pointer transition-all duration-150 whitespace-nowrap hover:text-on-surface hover:bg-surface-glass ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4'
          }`}
        >
          <span className="material-symbols-outlined">help</span>
          {!collapsed && 'Help'}
        </a>
        <a
          className={`flex items-center rounded-sm text-sm text-on-surface-variant cursor-pointer transition-all duration-150 whitespace-nowrap hover:text-on-surface hover:bg-surface-glass ${
            collapsed ? 'justify-center p-2.5' : 'gap-3 py-2.5 px-4 justify-between'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">notifications</span>
            {!collapsed && 'Notifications'}
          </div>
          {!collapsed && <span className="w-2 h-2 bg-electric-blue rounded-full shrink-0" />}
        </a>
      </div>
    </aside>
  )
}
