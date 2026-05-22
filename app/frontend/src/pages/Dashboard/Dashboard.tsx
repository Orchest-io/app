import { Card, ProgressBar } from '../../components/ui'

export default function Dashboard() {
  return (
    <div className="max-w-[900px] mx-auto py-8">
      <div className="mb-8">
        <h2 className="font-heading text-[32px] font-semibold text-on-surface mb-2">
          Workspace Dashboard
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Monitor your ongoing project velocity, active milestones, and workspace telemetries.
        </p>
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
