import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { ProjectAnalyticsDto } from '@orchest/shared';
import { toast } from 'sonner';

export default function ProjectAnalytics() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectAnalyticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get(`/projects/${projectId}/analytics`);
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch project analytics', error);
        toast.error('Failed to load project analytics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [projectId]);

  if (isLoading || !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-white/5 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white/5 animate-pulse rounded-2xl"></div>
          <div className="h-64 bg-white/5 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { summary, statusBreakdown, teamWorkload, timeBleedTasks } = data;
  const isBudgetOverrun = summary.totalActualHours > summary.totalEstimatedHours && summary.totalEstimatedHours > 0;

  return (
    <div className="min-h-screen bg-surface p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Region */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(`/projects/${projectId}/board`)}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-white transition-colors w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Board
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white tracking-tight">Project Analytics & Velocity Insights</h1>
          </div>
        </div>

        {/* Top Grid: Summary Performance Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Scope Completion */}
          <div className="bg-surface-container border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined">track_changes</span>
              <span className="font-semibold text-sm tracking-wide">Scope Completion</span>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-1">
                {summary.completedStoryPoints} <span className="text-xl text-on-surface-variant font-medium">/ {summary.totalStoryPoints} SP</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2.5 mt-3 overflow-hidden">
                <div 
                  className="bg-electric-blue h-2.5 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, summary.completionPercentage)}%` }}
                />
              </div>
              <div className="text-right text-xs text-on-surface-variant mt-1.5 font-bold">
                {summary.completionPercentage}% Complete
              </div>
            </div>
          </div>

          {/* Card 2: Logged Labor */}
          <div className="bg-surface-container border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined">schedule</span>
              <span className="font-semibold text-sm tracking-wide">Logged Labor</span>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-black text-white">
                {summary.totalActualHours} <span className="text-xl text-on-surface-variant font-medium">hrs</span>
              </div>
              <div className="text-sm text-on-surface-variant mt-1">Total time spent on tasks</div>
            </div>
          </div>

          {/* Card 3: Budget Tracking */}
          <div className="bg-surface-container border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                <span className="font-semibold text-sm tracking-wide">Budget Variance</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isBudgetOverrun 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {isBudgetOverrun ? 'OVER BUDGET' : 'ON TRACK'}
              </span>
            </div>
            <div className="flex items-end gap-3 mt-auto">
              <div>
                <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">Actual</div>
                <div className={`text-2xl font-black ${isBudgetOverrun ? 'text-red-400' : 'text-emerald-400'}`}>
                  {summary.totalActualHours}h
                </div>
              </div>
              <div className="text-xl text-white/20 mb-1">/</div>
              <div>
                <div className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider font-semibold">Estimate</div>
                <div className="text-2xl font-black text-white">
                  {summary.totalEstimatedHours}h
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Remaining Backlog Load */}
          <div className="bg-surface-container border border-white/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined">hourglass_empty</span>
              <span className="font-semibold text-sm tracking-wide">Remaining Effort</span>
            </div>
            <div className="mt-auto">
              <div className="text-4xl font-black text-white">
                {summary.remainingHoursEstimate} <span className="text-xl text-on-surface-variant font-medium">hrs</span>
              </div>
              <div className="text-sm text-on-surface-variant mt-1">Estimated hours on active tasks</div>
            </div>
          </div>
        </div>

        {/* Middle Grid: Operational Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Box: Task Velocity Meter */}
          <div className="bg-surface-container border border-white/5 p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-electric-blue">speed</span>
              Task Velocity Pipeline
            </h3>
            
            <div className="space-y-6">
              {/* Todo */}
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-white/20" /> To Do
                  </span>
                  <span className="text-white font-bold">{statusBreakdown.todoCount} Tasks</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-3">
                  <div 
                    className="bg-white/40 h-3 rounded-full" 
                    style={{ width: `${Math.max(2, (statusBreakdown.todoCount / Math.max(1, statusBreakdown.todoCount + statusBreakdown.inProgressCount + statusBreakdown.doneCount)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-amber-500/80" /> In Progress
                  </span>
                  <span className="text-white font-bold">{statusBreakdown.inProgressCount} Tasks</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-3">
                  <div 
                    className="bg-amber-500 h-3 rounded-full" 
                    style={{ width: `${Math.max(2, (statusBreakdown.inProgressCount / Math.max(1, statusBreakdown.todoCount + statusBreakdown.inProgressCount + statusBreakdown.doneCount)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Done */}
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/80" /> Done
                  </span>
                  <span className="text-white font-bold">{statusBreakdown.doneCount} Tasks</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-3">
                  <div 
                    className="bg-emerald-500 h-3 rounded-full" 
                    style={{ width: `${Math.max(2, (statusBreakdown.doneCount / Math.max(1, statusBreakdown.todoCount + statusBreakdown.inProgressCount + statusBreakdown.doneCount)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Box: Resource Allocation */}
          <div className="bg-surface-container border border-white/5 p-6 rounded-2xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-electric-blue">groups</span>
              Team Workload & Allocation
            </h3>
            
            {teamWorkload.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-on-surface-variant italic">
                No active task assignments found.
              </div>
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {teamWorkload.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full border-2 border-surface" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue/40 to-purple-500/40 flex items-center justify-center font-bold text-white border-2 border-surface">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-white">{member.name}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">Active Assignment</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Hours</div>
                        <div className="text-base font-black text-white">{member.hoursLogged}h</div>
                      </div>
                      <div>
                        <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Points</div>
                        <div className="text-base font-black text-electric-blue">{member.pointsAssigned} SP</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Region: Risk Analysis Table */}
        <div className="bg-surface-container border border-white/5 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">warning</span>
            Budget Overruns & High-Risk Tasks
          </h3>
          
          {timeBleedTasks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
              <span className="material-symbols-outlined text-4xl text-emerald-500 mb-3 block">verified</span>
              <p className="text-white font-medium">All clear!</p>
              <p className="text-sm text-on-surface-variant mt-1">No tasks have exceeded their estimated hours.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Task Title</th>
                    <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Estimated</th>
                    <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actual</th>
                    <th className="py-4 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Overrun Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {timeBleedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-sm font-medium text-white">
                        {task.title}
                      </td>
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

      </div>
    </div>
  );
}
