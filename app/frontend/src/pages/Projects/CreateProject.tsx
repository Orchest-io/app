import { useState } from 'react'
import {
  Card,
  Button,
  Input,
  Select,
  TextArea,
  ProgressBar,
} from '../../components/ui'

export default function CreateProject() {
  const [description, setDescription] = useState('')

  const [priority, setPriority] = useState('critical')

  const [privacy, setPrivacy] = useState('private')

  const [deadline, setDeadline] = useState('')

  const [buffer, setBuffer] = useState(15)

  const milestones = [
    {
      tag: 'Research',
      title: 'Crypto Compliance Audit',
      description:
        'Review EU regulatory frameworks for fiat-to-crypto gateways.',
    },
    {
      tag: 'Engineering',
      title: 'Wallet Integration Layer',
      description:
        'Develop secure SDK wrappers for Web3 authentication.',
    },
    {
      tag: 'Architecture',
      title: 'Platform Blueprint',
      description:
        'Define services, dependencies, and deployment boundaries.',
    },
    {
      tag: 'QA',
      title: 'Validation Pipeline',
      description:
        'Establish testing and release verification processes.',
    },
  ]

  return (
    <div className="max-w-[1450px] mx-auto py-8 px-4">
      <div className="flex flex-col xl:flex-row gap-6">

        {/* MAIN AREA */}

        <div className="flex-1 space-y-6">

          <div>
            <h1 className="font-heading text-[38px] font-semibold text-on-surface mb-2">
              Initiate New Project
            </h1>

            <p className="text-on-surface-variant">
              Describe your vision. Our AI orchestrator will map milestones,
              resources, and timelines.
            </p>
          </div>

          <Card className="relative overflow-hidden">
            <div className="absolute top-5 left-5 w-12 h-12 rounded-full bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-electric-blue">
                psychology
              </span>
            </div>

            <div className="pl-16">
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project in detail (e.g. Build a mobile fintech app with crypto wallets and bank integrations for the EU market)..."
                className="mb-5"
              />

              <div className="flex flex-wrap justify-between gap-3">

                <div className="flex gap-3">
                  <Button variant="secondary">
                    Add Context
                  </Button>

                  <Button variant="secondary">
                    Voice Input
                  </Button>
                </div>

                <Button icon="bolt">
                  Generate Blueprint
                </Button>

              </div>
            </div>
          </Card>

          {/* WORKFLOW */}

          <Card>
            <div className="flex items-center gap-5">

              <div className="w-14 h-14 rounded-full border border-electric-blue flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-electric-blue">
                  auto_awesome
                </span>
              </div>

              <div>
                <h3 className="font-heading text-electric-blue text-lg font-semibold uppercase tracking-wider">
                  Orchestrating Workflow
                </h3>

                <p className="text-on-surface-variant">
                  Mapping dependencies and identifying technical requirements...
                </p>
              </div>

            </div>
          </Card>

          {/* BLUEPRINT */}

          <Card padding="lg">

            <div className="flex justify-between items-center mb-8">

              <h2 className="font-heading text-3xl font-semibold text-on-surface">
                Dynamic Project Blueprint
              </h2>

              <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                AI Confirmed: 94%
              </div>

            </div>

            <div className="mb-6">
              <h3 className="text-sm uppercase tracking-[3px] text-on-surface-variant">
                Suggested Milestones
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {milestones.map((item) => (
                <Card
                  key={item.title}
                  hoverable
                  className="h-full"
                >
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
                      {item.tag}
                    </span>
                  </div>

                  <h4 className="font-heading text-lg font-semibold text-on-surface mb-2">
                    {item.title}
                  </h4>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {item.description}
                  </p>
                </Card>
              ))}

            </div>

            <div className="mt-10">

              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface-variant">
                  Estimated Timeline
                </span>

                <span className="text-on-surface font-semibold">
                  16 Weeks
                </span>
              </div>

              <ProgressBar
                value={68}
                glow
                size="md"
              />

            </div>

          </Card>

        </div>

        {/* CONFIG PANEL */}

        <div className="w-full xl:w-[340px]">

          <Card className="sticky top-6">

            <h2 className="font-heading text-2xl text-on-surface mb-8">
              Configuration
            </h2>

            <div className="space-y-6">

              <div>
                <p className="text-[12px] uppercase tracking-[3px] text-on-surface-variant mb-3">
                  Project Priority
                </p>

                <div className="grid grid-cols-3 gap-2">

                  <Button
                    size="sm"
                    variant={priority === 'critical' ? 'primary' : 'secondary'}
                    onClick={() => setPriority('critical')}
                  >
                    Critical
                  </Button>

                  <Button
                    size="sm"
                    variant={priority === 'high' ? 'primary' : 'secondary'}
                    onClick={() => setPriority('high')}
                  >
                    High
                  </Button>

                  <Button
                    size="sm"
                    variant={priority === 'normal' ? 'primary' : 'secondary'}
                    onClick={() => setPriority('normal')}
                  >
                    Normal
                  </Button>

                </div>
              </div>

              <Select
                label="Privacy Scope"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                options={[
                  {
                    value: 'private',
                    label: 'Private Workspace',
                  },
                  {
                    value: 'team',
                    label: 'Team Workspace',
                  },
                ]}
              />

              <Input
                label="Target Deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />

              <div>
                <label className="text-[12px] uppercase tracking-[3px] text-on-surface-variant block mb-4">
                  Resource Buffering
                </label>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={buffer}
                  onChange={(e) => setBuffer(Number(e.target.value))}
                  className="w-full"
                />

                <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
                  <span>Lean (0%)</span>
                  <span>Safe ({buffer}%)</span>
                </div>
              </div>

              <Card variant="outlined">

                <h3 className="font-heading text-electric-blue text-lg mb-3">
                  AI Insight
                </h3>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                  This project matches 85% of the workspace taxonomy.
                  Suggesting migration to the Financial Systems cluster.
                </p>

              </Card>

              <Button
                className="w-full"
                size="lg"
              >
                Finalize & Launch
              </Button>

            </div>

          </Card>

        </div>

      </div>
    </div>
  )
}