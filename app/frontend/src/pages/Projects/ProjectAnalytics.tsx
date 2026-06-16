import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectContextualAnalytics } from '../../api/projects.api';
import type { ContextualAnalyticsDto } from '@orchest/shared';
import { toast } from 'sonner';

export default function ProjectAnalytics() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ContextualAnalyticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const fetchAnalytics = async () => {
      try {
        const res = await getProjectContextualAnalytics(projectId);
        setData(res);
      } catch (error) {
        console.error('Failed to fetch project analytics', error);
        toast.error('Failed to load project analytics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [projectId]);

  /* ─────────── Loading Skeleton ─────────── */
  if (isLoading || !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-white/5 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-white/5 animate-pulse rounded-2xl" />
        <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const isPM = data.userRole === 'PM';

  return (
    <div className="min-h-screen bg-surface p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ═══════════ AREA A: Header Region (All Users) ═══════════ */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-white transition-colors w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Board
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isPM ? 'Project Metrics Overview' : 'My Contribution Dashboard'}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs uppercase font-bold tracking-wider border ${
                isPM
                  ? 'bg-blue-900 text-blue-200 border-blue-700/50'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-600/50'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isPM ? 'shield_person' : 'person'}
              </span>
              {isPM ? 'PM View' : 'Member View'}
            </span>
          </div>
        </div>

        {/* ═══════════ AREA B: Conditional Workspace Views ═══════════ */}
        {isPM ? (
          <PMView data={data} />
        ) : (
          <MemberView data={data} />
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   CASE 1: PM VIEW — Full project oversight
   ═══════════════════════════════════════════════════════════════════ */

function PMView({ data }: { data: ContextualAnalyticsDto }) {
  const { projectSummary, teamWorkload, projectTimeBleed } = data;
  const isBudgetOverrun =
    projectSummary.totalActualHours > projectSummary.totalEstimatedHours &&
    projectSummary.totalEstimatedHours > 0;

  return (
    <>
      {/* ── Scorecard Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Project Scope Completion */}
        <div className="bg-surface-container border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined">track_changes</span>
            <span className="font-semibold text-sm tracking-wide">Project Scope Completion</span>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-1">
              {projectSummary.completedPoints}
              <span className="text-xl text-on-surface-variant font-medium">
                {' '}/ {projectSummary.totalPoints} SP
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-3 mt-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, projectSummary.completionPercentage)}%`,
                  background: 'linear-gradient(90deg, #007BFF, #6366f1)',
                }}
              />
            </div>
            <div className="text-right text-xs text-on-surface-variant mt-1.5 font-bold">
              {projectSummary.completionPercentage}% Complete
            </div>
          </div>
        </div>

        {/* Card: Hours Budget */}
        <div className="bg-surface-container border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined">schedule</span>
              <span className="font-semibold text-sm tracking-wide">Hours Budget</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isBudgetOverrun
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isBudgetOverrun ? 'OVER' : 'ON TRACK'}
            </span>
          </div>
          <div className="flex items-end gap-3 mt-auto">
            <div>
              <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">
                Actual
              </div>
              <div
                className={`text-2xl font-black ${
                  isBudgetOverrun ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {projectSummary.totalActualHours}h
              </div>
            </div>
            <div className="text-xl text-white/20 mb-1">/</div>
            <div>
              <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">
                Estimated
              </div>
              <div className="text-2xl font-black text-white">
                {projectSummary.totalEstimatedHours}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Grid: Team Workload Matrix ── */}
      <div className="bg-surface-container border border-white/5 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-electric-blue">groups</span>
          Team Workload Matrix
        </h3>

        {!teamWorkload || teamWorkload.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-on-surface-variant italic">
            No active task assignments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamWorkload.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-white/5
                           hover:border-electric-blue/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full border-2 border-surface"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue/40 to-purple-500/40 flex items-center justify-center font-bold text-white border-2 border-surface text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-white">{member.name}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Active</div>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-right">
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Hours
                    </div>
                    <div className="text-sm font-black text-white">{member.hoursLogged}h</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                      Points
                    </div>
                    <div className="text-sm font-black text-electric-blue">
                      {member.pointsAssigned} SP
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Section: Project-Wide Risk Analysis Table ── */}
      <div className="bg-surface-container border border-white/5 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">warning</span>
          Project Risk Analysis — Time Overruns
        </h3>

        {!projectTimeBleed || projectTimeBleed.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-3 block">
              verified
            </span>
            <p className="text-white font-medium">All clear!</p>
            <p className="text-sm text-on-surface-variant mt-1">
              No tasks have exceeded their estimated hours.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Task Title
                  </th>
                  <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Estimated
                  </th>
                  <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Actual
                  </th>
                  <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Overrun Variance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projectTimeBleed.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-white">{task.title}</td>
                    <td className="py-4 px-4 text-sm text-on-surface-variant text-right font-mono">
                      {task.estimatedHours}h
                    </td>
                    <td className="py-4 px-4 text-sm text-white text-right font-mono">
                      {task.actualHours}h
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        +{task.overrunHours}h
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   CASE 2: MEMBER VIEW — Personal contribution focus
   ═══════════════════════════════════════════════════════════════════ */

function MemberView({ data }: { data: ContextualAnalyticsDto }) {
  const { personalSummary, myPersonalTimeBleed } = data;
  const accuracyRatio =
    personalSummary.myEstimatedHours > 0
      ? Math.round((personalSummary.myActualHours / personalSummary.myEstimatedHours) * 100)
      : 0;
  const isAccurate = accuracyRatio >= 90 && accuracyRatio <= 110;
  const isOverEstimating = accuracyRatio < 90;

  return (
    <>
      {/* ── Scorecard Row: My Contribution Progress ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: My Story Points */}
        <div className="bg-surface-container border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined">emoji_events</span>
            <span className="font-semibold text-sm tracking-wide">My Contribution Progress</span>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-1">
              {personalSummary.myCompletedPoints}
              <span className="text-xl text-on-surface-variant font-medium">
                {' '}/ {personalSummary.myTotalPoints} SP
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-3 mt-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, personalSummary.myCompletionPercentage)}%`,
                  background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                }}
              />
            </div>
            <div className="text-right text-xs text-on-surface-variant mt-1.5 font-bold">
              {personalSummary.myCompletionPercentage}% Complete
            </div>
          </div>
        </div>

        {/* Card: My Hours Summary */}
        <div className="bg-surface-container border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined">timer</span>
            <span className="font-semibold text-sm tracking-wide">My Hours</span>
          </div>
          <div className="flex items-end gap-3 mt-auto">
            <div>
              <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">
                Logged
              </div>
              <div className="text-2xl font-black text-white">
                {personalSummary.myActualHours}h
              </div>
            </div>
            <div className="text-xl text-white/20 mb-1">/</div>
            <div>
              <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">
                Estimated
              </div>
              <div className="text-2xl font-black text-white">
                {personalSummary.myEstimatedHours}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Section: Estimation Accuracy Gauge ── */}
      <div className="bg-surface-container border border-white/5 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-electric-blue">speed</span>
          Estimation Accuracy
        </h3>

        <div className="flex flex-col items-center py-6">
          {/* Gauge Display */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
            {/* Outer ring */}
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              {/* Background track */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="12"
              />
              {/* Progress arc */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke={
                  isAccurate ? '#10b981' : isOverEstimating ? '#f59e0b' : '#ef4444'
                }
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(accuracyRatio, 200) * 2.67} 534`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-4xl font-black ${
                  isAccurate
                    ? 'text-emerald-400'
                    : isOverEstimating
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {accuracyRatio}%
              </span>
              <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mt-1">
                Accuracy
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
                Estimated
              </div>
              <div className="text-lg font-black text-white">
                {personalSummary.myEstimatedHours}h
              </div>
            </div>
            <div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
                Actual
              </div>
              <div className="text-lg font-black text-white">
                {personalSummary.myActualHours}h
              </div>
            </div>
            <div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
                Verdict
              </div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isAccurate
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : isOverEstimating
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {isAccurate ? 'ACCURATE' : isOverEstimating ? 'OVER-EST' : 'UNDER-EST'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: My Slipping Budgets Table ── */}
      <div className="bg-surface-container border border-white/5 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">trending_down</span>
          My Slipping Budgets
        </h3>

        {myPersonalTimeBleed.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
            <span className="material-symbols-outlined text-4xl text-emerald-500 mb-3 block">
              verified
            </span>
            <p className="text-white font-medium">You're on track!</p>
            <p className="text-sm text-on-surface-variant mt-1">
              None of your tasks have exceeded their estimated hours.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Task Title
                  </th>
                  <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Estimated
                  </th>
                  <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Actual
                  </th>
                  <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Overrun
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myPersonalTimeBleed.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-white">{task.title}</td>
                    <td className="py-4 px-4 text-sm text-on-surface-variant text-right font-mono">
                      {task.estimatedHours}h
                    </td>
                    <td className="py-4 px-4 text-sm text-white text-right font-mono">
                      {task.actualHours}h
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                        <span className="material-symbols-outlined text-[14px]">
                          trending_up
                        </span>
                        +{task.overrunHours}h
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
