import { useState } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'

type MainLayoutProps = {
  children: React.ReactNode
  activePage?: string
  onNavigate?: (key: string) => void
  onAiCopilotClick?: () => void
}

export default function MainLayout({ children, activePage, onNavigate, onAiCopilotClick }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-bg-deep">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <Header collapsed={collapsed} onAiCopilotClick={onAiCopilotClick} />
      <main
        className="pt-16 p-6 min-h-[calc(100vh-64px)] transition-[margin-left] duration-300"
        style={{ marginLeft: collapsed ? 'var(--spacing-sidebar-c)' : 'var(--spacing-sidebar-w)' }}
      >
        {children}
      </main>
    </div>
  )
}
