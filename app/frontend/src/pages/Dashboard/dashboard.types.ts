import type { ProjectListItemDto } from '@orchest/shared';
import type { ActivityLog } from '../../api/activity-log.api';
import type { DashboardStatsDto } from '../../api/dashboard.api';

// Re-export consumed shared types for local convenience
export type { ProjectListItemDto, ActivityLog, DashboardStatsDto };

// ── AI Copilot ────────────────────────────────────────────────────────────────

export type ConversationRole = 'user' | 'assistant';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: Date;
}

// ── Legacy local stats shape (kept for DashboardHero fallback while API loads) ─

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  averageProgress: number;
  completedThisWeek: number;
}
