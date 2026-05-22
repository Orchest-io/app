import { useState } from 'react'
import { MainLayout } from './components/layout'
import { Button, Input, Card, Checkbox, Toggle, ProgressBar, Tabs, Select, TextArea } from './components/ui'
import { Toaster, toast } from 'sonner'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const handleNavigate = (key: string) => {
    setActivePage(key)
    toast(`Navigating to ${key.charAt(0).toUpperCase() + key.slice(1)}`)
  }

  const handleAiCopilot = () => {
    const promise = () => new Promise((resolve) => setTimeout(resolve, 1500))
    toast.promise(promise, {
      loading: 'AI Copilot is analyzing your team workspace...',
      success: 'AI Insights generated successfully! Check your planner.',
      error: 'Failed to connect to AI engine',
    })
  }

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      onAiCopilotClick={handleAiCopilot}
    >
      <Toaster position="top-right" theme="dark" closeButton richColors />
      
      <div className="max-w-[900px]">
        <h2 className="font-heading text-[32px] mb-8 font-semibold text-on-surface">
          Dashboard
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <p className="text-[12px] text-on-surface-variant mb-2">Active Projects</p>
            <p className="text-[28px] font-bold font-heading text-on-surface">12</p>
            <ProgressBar value={72} glow className="mt-3" />
          </Card>
          <Card>
            <p className="text-[12px] text-on-surface-variant mb-2">Tasks Done</p>
            <p className="text-[28px] font-bold font-heading text-on-surface">84%</p>
            <ProgressBar value={84} color="purple" className="mt-3" />
          </Card>
          <Card>
            <p className="text-[12px] text-on-surface-variant mb-2">Team Velocity</p>
            <p className="text-[28px] font-bold font-heading text-on-surface">92%</p>
            <ProgressBar value={92} glow className="mt-3" />
          </Card>
        </div>

        {/* Buttons */}
        <Card className="mb-6">
          <p className="text-sm text-on-surface-variant mb-3">Buttons</p>
          <div className="flex gap-3 flex-wrap">
            <Button
              icon="add"
              onClick={() => toast.success('Creating a new project...')}
            >
              New Project
            </Button>
            <Button
              variant="secondary"
              icon="visibility"
              onClick={() => toast.info('Opening code/project review panel')}
            >
              Review
            </Button>
            <Button
              variant="ghost"
              icon="more_horiz"
              onClick={() => toast('Displaying more options')}
            >
              More
            </Button>
            <Button size="sm" onClick={() => toast.success('Small button clicked')}>
              Small
            </Button>
            <Button size="lg" onClick={() => toast.success('Large button clicked')}>
              Large
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="mb-6">
          <p className="text-sm text-on-surface-variant mb-3">Tabs</p>
          <Tabs
            tabs={[
              { key: 'overview', label: 'Overview', icon: 'dashboard' },
              { key: 'tasks', label: 'Tasks', icon: 'task_alt' },
              { key: 'files', label: 'Files', icon: 'folder' },
              { key: 'analytics', label: 'Analytics', icon: 'insights' },
            ]}
            onChange={(key) => toast.info(`Switched active tab to ${key}`)}
          />
        </Card>

        {/* Form */}
        <Card className="mb-6">
          <p className="text-sm text-on-surface-variant mb-4">Form</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Project Name"
              icon="edit"
              placeholder="Enter project name"
              onChange={(e) => {
                if (e.target.value.length > 0 && e.target.value.length % 5 === 0) {
                  toast(`Typing project name: ${e.target.value}`)
                }
              }}
            />
            <Select
              label="Priority"
              options={[
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              onChange={(e) => toast.success(`Priority set to: ${e.target.value}`)}
            />
          </div>
          <TextArea label="Description" placeholder="Describe the project..." className="mb-4" />
          <div className="flex gap-5">
            <Checkbox
              label="Auto-assign tasks"
              defaultChecked
              onChange={(e) =>
                toast.info(`Auto-assign tasks is now ${e.target.checked ? 'enabled' : 'disabled'}`)
              }
            />
            <Toggle
              label="AI Suggestions"
              defaultChecked
              onChange={(e) =>
                toast.info(`AI Suggestions are now ${e.target.checked ? 'enabled' : 'disabled'}`)
              }
            />
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
