import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { ActivityLog } from '../analytics/entities/activity-log.entity';
import { Notification } from '../analytics/entities/notification.entity';

export interface DashboardStatsDto {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageProgress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  unreadNotifications: number;
  recentActivityCount: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly memberRepository: Repository<ProjectMember>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async getStats(userId: string): Promise<DashboardStatsDto> {
    // ── Projects the user is a member of ──────────────────────────────────────
    const memberRows = await this.memberRepository.find({ where: { userId } });
    const projectIds = memberRows.map((m) => m.projectId);

    if (projectIds.length === 0) {
      return this.emptyStats();
    }

    const projects = await this.projectRepository
      .createQueryBuilder('p')
      .where('p.id IN (:...ids)', { ids: projectIds })
      .getMany();

    const totalProjects = projects.length;

    const activeProjects = projects.filter(
      (p) => p.status === 'active' || p.status === 'on-track' || p.status === 'at-risk',
    ).length;

    const completedProjects = projects.filter(
      (p) => p.status === 'completed',
    ).length;

    const averageProgress =
      totalProjects > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / totalProjects,
          )
        : 0;

    // ── Tasks across those projects ───────────────────────────────────────────
    const tasks = await this.taskRepository
      .createQueryBuilder('t')
      .where('t.project_id IN (:...ids)', { ids: projectIds })
      .getMany();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === 'in-progress' || t.status === 'review',
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < today &&
        t.status !== 'done',
    ).length;

    // ── Notifications for this user ───────────────────────────────────────────
    const unreadNotifications = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    // ── Recent activity in the last 7 days ────────────────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivityCount = await this.activityLogRepository
      .createQueryBuilder('al')
      .where('al.user_id = :userId', { userId })
      .andWhere('al.created_at >= :since', { since: sevenDaysAgo })
      .getCount();

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      averageProgress,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      unreadNotifications,
      recentActivityCount,
    };
  }

  private emptyStats(): DashboardStatsDto {
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      averageProgress: 0,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
      unreadNotifications: 0,
      recentActivityCount: 0,
    };
  }
}
