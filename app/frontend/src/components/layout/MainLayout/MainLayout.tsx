import { useState } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import { useNotificationStream } from '../../../hooks/useNotificationStream'
import { AiAssistant } from '../../AI'

type MainLayoutProps = {
  children: React.ReactNode
}

/**
 * Mounts the SSE notification stream for the duration of the authenticated session.
 * Renders nothing — exists solely to call useNotificationStream() within the
 * ProtectedRoute subtree so the connection is never active on public routes.
 */
function SessionServices() {
  useNotificationStream()
  return null
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-bg-deep">
      <SessionServices />
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <Header collapsed={collapsed} />
      <main
        className="pt-16 p-6 min-h-[calc(100vh-64px)] transition-all duration-300 ltr:ml-[var(--spacing-sidebar-w)] rtl:mr-[var(--spacing-sidebar-w)]"
        style={{
          marginInlineStart: collapsed ? 'var(--spacing-sidebar-c)' : 'var(--spacing-sidebar-w)'
        }}
      >
        {children}
      </main>

      {/* AI Assistant — floating chat button, visible on all protected pages */}
      <AiAssistant />
    </div>
  )
}
