import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsHub } from '../../api/projects.api';
import type { AnalyticsHubProjectDto } from '@orchest/shared';
import { toast } from 'sonner';

export default function AnalyticsHub() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AnalyticsHubProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHub = async () => {
      try {
        const data = await getAnalyticsHub();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch analytics hub', err);
        toast.error('Failed to load analytics hub');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHub();
  }, []);

  return (
    <div className="max-w-[1100px] mx-auto py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="font-heading text-[32px] font-semibold text-on-surface">
          Analytics Hub
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Select a project to explore role-aware metrics, workload insights, and risk analysis.
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 bg-surface-container border border-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="bg-surface-container border border-white/5 rounded-2xl p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-surface-glass border border-border-low flex items-center justify-center text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-[32px]">bar_chart</span>
          </div>
          <h3 className="font-heading text-xl font-bold mb-2">No Projects Found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
            You don't have any project memberships yet. Join or create a project to access analytics.
          </p>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}/analytics`)}
              className="group bg-surface-container border border-white/5 rounded-2xl p-6 text-left
                         hover:border-electric-blue/30 hover:bg-surface-container-high
                         transition-all duration-300 ease-out cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-electric-blue/40 focus:ring-offset-2 focus:ring-offset-surface"
            >
              {/* Icon + Badge Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue/20 to-purple-500/20
                                flex items-center justify-center border border-white/5
                                group-hover:from-electric-blue/30 group-hover:to-purple-500/30
                                transition-all duration-300">
                  <span className="material-symbols-outlined text-electric-blue text-[24px]">
                    monitoring
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${
                    project.userRole === 'PM'
                      ? 'bg-blue-900 text-blue-200 border-blue-700/50'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-600/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {project.userRole === 'PM' ? 'shield_person' : 'person'}
                  </span>
                  {project.userRole === 'PM' ? 'Project Manager' : 'Team Member'}
                </span>
              </div>

              {/* Project Name */}
              <h3 className="font-heading text-lg font-semibold text-on-surface group-hover:text-electric-blue transition-colors mb-2 line-clamp-2">
                {project.title}
              </h3>

              {/* CTA */}
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant group-hover:text-electric-blue/80 transition-colors mt-auto pt-2">
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                View Dashboard
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
