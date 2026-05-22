import { useState } from 'react'
import { MainLayout } from './components/layout'
import { Button, TextArea } from './components/ui'
import { Toaster, toast } from 'sonner'
import Dashboard from './pages/Dashboard/Dashboard'
import TeamManagement from './pages/TeamManagement/TeamManagement'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)

  const handleNavigate = (key: string) => {
    setActivePage(key)
    toast(`Navigating to ${key.charAt(0).toUpperCase() + key.slice(1)}`)
  }

  const handleAiCopilot = () => {
    setIsAiModalOpen(true)
  }

  const handleGenerateAiResponse = () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a query for the AI Copilot')
      return
    }
    setIsAiLoading(true)
    setTimeout(() => {
      setIsAiLoading(false)
      setAiResponse(
        `Based on the current team workload, Sarah Hassan is heavily loaded with 5 tasks. Ahmed Rayan (3 tasks) and Omar Khaled (2 tasks) have extra capacity.

Recommendation:
1. Re-route 1 database task from Sarah to Ahmed to balance the sprint velocity.
2. Schedule a quick design sync with Omar for the upcoming new milestone.`
      )
      toast.success('AI suggestions generated successfully!')
    }, 1200)
  }

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      onAiCopilotClick={handleAiCopilot}
    >
      <Toaster position="top-right" theme="dark" closeButton richColors />

      {activePage === 'dashboard' && (
        <Dashboard onNavigate={handleNavigate} onExploreAi={handleAiCopilot} />
      )}

      {activePage === 'team' && (
        <TeamManagement />
      )}

      {activePage !== 'team' && activePage !== 'dashboard' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-[900px] mx-auto">
          <div className="w-16 h-16 rounded-full bg-error-container/10 flex items-center justify-center text-error mb-4">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h2 className="font-heading text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
            The page you are looking for does not exist or has been moved to another route.
          </p>
        </div>
      )}

      {isAiModalOpen && (
        <div className="fixed inset-0 bg-[#050505]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container border border-border-low p-6 rounded-xl relative shadow-2xl">
            <button className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-none outline-none" onClick={() => setIsAiModalOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-peri-purple/10 flex items-center justify-center text-peri-purple">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-on-surface">AI Copilot</h3>
                <p className="text-xs text-on-surface-variant">Intelligent workspace assistant</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <TextArea
                label="How can I help you today?"
                placeholder="Ask me to assign tasks, analyze velocity, or draft a milestone plan..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />

              <Button onClick={handleGenerateAiResponse} disabled={isAiLoading}>
                {isAiLoading ? 'Analyzing Workspace...' : 'Generate Insights'}
              </Button>

              {aiResponse && (
                <div className="mt-4 p-4 rounded-lg bg-surface-glass border border-border-low text-sm text-on-surface leading-relaxed whitespace-pre-line">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
