import { Button, Card, ProgressBar } from '../../components/ui'

type DashboardProps = {
  onNavigate: (key: string) => void
  onExploreAi: () => void
}

export default function Dashboard({ onNavigate, onExploreAi }: DashboardProps) {
  return (
    <div className="max-w-[900px] mx-auto py-8">
      <div className="text-center relative py-12 px-6 rounded-2xl bg-gradient-to-b from-surface-container/50 to-transparent border border-border-low overflow-hidden mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-electric-blue/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-electric-blue/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-peri-purple/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-xs font-semibold mb-6">
          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
          Next-Gen Workspace Planner
        </div>

        <h1 className="font-heading text-4xl md:text-5xl font-bold text-on-surface mb-6 leading-tight max-w-2xl mx-auto">
          Orchestrate Your Team, Tasks, and AI Planner
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant mb-8 max-w-xl mx-auto leading-relaxed">
          A premium, high-velocity project workspace that integrates task allocation, team availability, and real-time AI copilot insights in one seamless interface.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Button size="lg" icon="arrow_forward" onClick={() => onNavigate('team')}>
            Get Started
          </Button>
          <Button size="lg" variant="secondary" icon="auto_awesome" onClick={onExploreAi}>
            Explore AI
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card hoverable className="transition-all duration-200 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue mb-4">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <h3 className="font-heading text-base font-bold text-on-surface mb-2">AI Copilot</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Get automated sprint recommendations, work load allocation audits, and critical path warnings.
          </p>
        </Card>

        <Card hoverable className="transition-all duration-200 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-lg bg-peri-purple/10 flex items-center justify-center text-peri-purple mb-4">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <h3 className="font-heading text-base font-bold text-on-surface mb-2">Team Hub</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Coordinate roles, check availability, manage assigned task counts, and optimize collaboration.
          </p>
        </Card>

        <Card hoverable className="transition-all duration-200 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <h3 className="font-heading text-base font-bold text-on-surface mb-2">High Velocity</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Audit team performance, project milestones, and velocity percentage continuously.
          </p>
        </Card>
      </div>

      <Card className="mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[120px]">tactic</span>
        </div>
        <h3 className="font-heading text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-electric-blue">monitoring</span>
          Workspace Showcase
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface-variant">Active Milestones</span>
                <span className="text-on-surface font-semibold">72%</span>
              </div>
              <ProgressBar value={72} glow />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-on-surface-variant">Team Velocity</span>
                <span className="text-on-surface font-semibold">92%</span>
              </div>
              <ProgressBar value={92} color="purple" glow />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Orchest provides live system telemetry. You can track performance charts, design systems syncs, and AI task distributions in real time with our automated widgets.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
