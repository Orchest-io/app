type HeaderProps = {
  collapsed?: boolean
}

export default function Header({ collapsed = false }: HeaderProps) {
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
        <div
          className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-surface-container-high border border-peri-purple/20 text-peri-purple text-[12px] font-medium tracking-wider"
        >
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

        {/* Profile */}
        <div className="w-8 h-8 rounded-full bg-surface-container border border-border-low overflow-hidden cursor-pointer" />
      </div>
    </header>
  )
}
