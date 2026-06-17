import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAIService } from './openai.service';
import { AiUsageService } from './ai-usage.service';
import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';
import { ProjectMember } from '../../projects/entities/project-member.entity';
import { ActivityLog } from '../../analytics/entities/activity-log.entity';

export interface HealthScore {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  factors: {
    progress: number;
    velocity: number;
    risks: number;
    deadline: number;
  };
}

export interface Risk {
  type: 'deadline' | 'resource' | 'dependency' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedItems: string[];
  suggestion: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
}

export interface AIInsightsResponse {
  healthScore: HealthScore;
  risks: Risk[];
  recommendations: Recommendation[];
  summary: string;
  generatedAt: string;
  tokensUsed: number;
}

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(ProjectMember)
    private memberRepo: Repository<ProjectMember>,
    @InjectRepository(ActivityLog)
    private activityRepo: Repository<ActivityLog>,
    private openaiService: OpenAIService,
    private aiUsageService: AiUsageService,
  ) {}

  /**
   * Generate AI insights for dashboard
   */
  async generateDashboardInsights(userId: string): Promise<AIInsightsResponse> {
    this.logger.log(`Generating dashboard insights for user ${userId}`);

    // Check usage limit
    const limitCheck = await this.aiUsageService.checkMonthlyLimit(userId, 'insights_generation');
    if (!limitCheck.canUse) {
      throw new Error('AI usage limit reached');
    }

    // Fetch user's projects
    const projects = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'member')
      .leftJoinAndSelect('project.milestones', 'milestone')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('member.userId = :userId', { userId })
      .getMany();

    if (projects.length === 0) {
      throw new Error('No projects found. Create a project to get AI insights.');
    }

    // Calculate health scores
    const healthScore = this.calculateHealthScore(projects);

    // Detect risks
    const risks = this.detectRisks(projects);

    // Generate AI recommendations (will throw error if OpenAI not configured)
    const { recommendations, summary, tokensUsed } = await this.generateAIRecommendations(
      projects,
      healthScore,
      risks,
    );

    // Log usage
    await this.aiUsageService.logUsage(userId, 'insights_generation', tokensUsed, 'gpt-4o-mini');

    return {
      healthScore,
      risks,
      recommendations,
      summary,
      generatedAt: new Date().toISOString(),
      tokensUsed,
    };
  }

  /**
   * Generate AI insights for specific project
   */
  async generateProjectInsights(userId: string, projectId: string): Promise<AIInsightsResponse> {
    this.logger.log(`Generating project insights for project ${projectId}`);

    // Fetch project with relations
    const project = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'member')
      .leftJoinAndSelect('project.milestones', 'milestone')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId })
      .andWhere('member.userId = :userId', { userId })
      .getOne();

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const projects = [project];
    const healthScore = this.calculateHealthScore(projects);
    const risks = this.detectRisks(projects);

    const { recommendations, summary, tokensUsed } = await this.generateAIRecommendations(
      projects,
      healthScore,
      risks,
    );

    await this.aiUsageService.logUsage(userId, 'insights_generation', tokensUsed, 'gpt-4o-mini');

    return {
      healthScore,
      risks,
      recommendations,
      summary,
      generatedAt: new Date().toISOString(),
      tokensUsed,
    };
  }

  /**
   * Calculate health score based on multiple factors
   */
  private calculateHealthScore(projects: Project[]): HealthScore {
    const activeProjects = projects.filter(
      (p) => p.status === 'active' || p.status === 'on-track' || p.status === 'planning',
    );

    if (activeProjects.length === 0) {
      return {
        score: 50,
        status: 'warning',
        factors: { progress: 0, velocity: 0, risks: 0, deadline: 0 },
      };
    }

    // Factor 1: Average Progress (40%)
    const avgProgress =
      activeProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / activeProjects.length;
    const progressScore = avgProgress;

    // Factor 2: Velocity (30%) - based on recent activity
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentlyUpdated = activeProjects.filter(
      (p) => new Date(p.updatedAt).getTime() > oneWeekAgo,
    ).length;
    const velocityScore = (recentlyUpdated / activeProjects.length) * 100;

    // Factor 3: Risk Assessment (20%)
    const overdue = activeProjects.filter((p) => {
      if (!p.endDate) return false;
      return new Date(p.endDate).getTime() < now && p.status !== 'completed';
    }).length;
    const riskScore = Math.max(0, 100 - (overdue / activeProjects.length) * 200);

    // Factor 4: Deadline Health (10%)
    const projectsWithDeadlines = activeProjects.filter((p) => p.endDate);
    const upcomingDeadlines = projectsWithDeadlines.filter((p) => {
      const daysLeft = (new Date(p.endDate!).getTime() - now) / (1000 * 60 * 60 * 24);
      return daysLeft > 0 && daysLeft <= 30;
    }).length;
    const deadlineScore = Math.max(0, 100 - (upcomingDeadlines / activeProjects.length) * 100);

    // Calculate weighted score
    const totalScore =
      progressScore * 0.4 + velocityScore * 0.3 + riskScore * 0.2 + deadlineScore * 0.1;

    let status: 'healthy' | 'warning' | 'critical';
    if (totalScore >= 70) status = 'healthy';
    else if (totalScore >= 40) status = 'warning';
    else status = 'critical';

    return {
      score: Math.round(totalScore),
      status,
      factors: {
        progress: Math.round(progressScore),
        velocity: Math.round(velocityScore),
        risks: Math.round(riskScore),
        deadline: Math.round(deadlineScore),
      },
    };
  }

  /**
   * Detect risks across projects
   */
  private detectRisks(projects: Project[]): Risk[] {
    const risks: Risk[] = [];
    const now = Date.now();

    for (const project of projects) {
      // Risk 1: Overdue project
      if (project.endDate && new Date(project.endDate).getTime() < now && project.status !== 'completed') {
        const daysOverdue = Math.ceil((now - new Date(project.endDate).getTime()) / (1000 * 60 * 60 * 24));
        risks.push({
          type: 'deadline',
          severity: daysOverdue > 14 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium',
          description: `Project "${project.name}" is ${daysOverdue} day(s) overdue`,
          affectedItems: [project.name],
          suggestion: 'Review project timeline and reassign resources to critical tasks',
        });
      }

      // Risk 2: Low progress with approaching deadline
      if (project.endDate) {
        const daysLeft = (new Date(project.endDate).getTime() - now) / (1000 * 60 * 60 * 24);
        if (daysLeft > 0 && daysLeft <= 14 && (project.progress || 0) < 50) {
          risks.push({
            type: 'deadline',
            severity: daysLeft <= 7 ? 'high' : 'medium',
            description: `Project "${project.name}" is only ${project.progress}% complete with ${Math.ceil(daysLeft)} days remaining`,
            affectedItems: [project.name],
            suggestion: 'Consider increasing team capacity or adjusting scope',
          });
        }
      }

      // Risk 3: Too many team members marked as busy/on-leave
      const members = project.members || [];
      const unavailable = members.filter((m: any) => m.status === 'busy' || m.status === 'on-leave').length;
      if (members.length > 0 && unavailable / members.length > 0.5) {
        risks.push({
          type: 'resource',
          severity: 'high',
          description: `${unavailable} of ${members.length} team members are unavailable in "${project.name}"`,
          affectedItems: [project.name],
          suggestion: 'Reassign tasks or bring in additional resources',
        });
      }

      // Risk 4: Stagnant project (no updates in 7 days)
      const daysSinceUpdate = (now - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (project.status === 'active' && daysSinceUpdate > 7) {
        risks.push({
          type: 'technical',
          severity: daysSinceUpdate > 14 ? 'high' : 'medium',
          description: `No activity in "${project.name}" for ${Math.ceil(daysSinceUpdate)} days`,
          affectedItems: [project.name],
          suggestion: 'Schedule a team sync to identify blockers',
        });
      }
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateAIRecommendations(
    projects: Project[],
    healthScore: HealthScore,
    risks: Risk[],
  ): Promise<{ recommendations: Recommendation[]; summary: string; tokensUsed: number }> {
    // Prepare context for AI
    const projectsSummary = projects.map((p) => ({
      name: p.name,
      status: p.status,
      progress: p.progress,
      priority: p.priority,
      endDate: p.endDate,
      memberCount: p.members?.length || 0,
    }));

    const prompt = `Analyze the following project management data and provide 3 smart recommendations:

Health Score: ${healthScore.score}/100 (${healthScore.status})
Factors: Progress ${healthScore.factors.progress}%, Velocity ${healthScore.factors.velocity}%, Risk ${healthScore.factors.risks}%, Deadline ${healthScore.factors.deadline}%

Detected Risks (${risks.length}):
${risks.slice(0, 3).map((r) => `- [${r.severity.toUpperCase()}] ${r.description}`).join('\n')}

Projects:
${projectsSummary.map((p) => `- "${p.name}": ${p.status}, ${p.progress}% progress, ${p.memberCount} members`).join('\n')}

Generate 3 actionable recommendations as JSON array:
[
  {
    "priority": "high|medium|low",
    "title": "Brief action title",
    "description": "What needs to be done",
    "action": "Specific action step",
    "impact": "Expected outcome"
  }
]

Also provide a one-sentence summary of the overall workspace health.

Response format:
{
  "recommendations": [...],
  "summary": "..."
}`;

    try {
      const { content, tokensUsed } = await this.openaiService.callChat(
        [
          {
            role: 'system',
            content: 'You are an expert project management AI assistant. Provide actionable, specific recommendations.',
          },
          { role: 'user', content: prompt },
        ],
        'gpt-4o-mini',
        0.7,
        1000,
      );

      const parsed = this.openaiService.parseJsonResponse<{
        recommendations: Recommendation[];
        summary: string;
      }>(content);

      return {
        recommendations: parsed.recommendations || [],
        summary: parsed.summary || 'No summary available',
        tokensUsed,
      };
    } catch (error) {
      this.logger.error('Failed to generate AI recommendations', error);
      // Don't use fallback - throw error to indicate AI is unavailable
      throw new Error('Failed to generate AI recommendations. OpenAI service may be unavailable.');
    }
  }

  /**
   * Fallback recommendations if AI fails
   */
  private getFallbackRecommendations(risks: Risk[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (risks.length > 0) {
      const topRisk = risks[0];
      recommendations.push({
        priority: topRisk.severity === 'critical' || topRisk.severity === 'high' ? 'high' : 'medium',
        title: `Address ${topRisk.type} risk`,
        description: topRisk.description,
        action: topRisk.suggestion,
        impact: 'Prevent project delays and improve delivery confidence',
      });
    }

    recommendations.push({
      priority: 'medium',
      title: 'Review team workload',
      description: 'Ensure tasks are evenly distributed across team members',
      action: 'Check task assignments and reallocate if needed',
      impact: 'Improve team efficiency and prevent burnout',
    });

    recommendations.push({
      priority: 'low',
      title: 'Update project documentation',
      description: 'Keep project descriptions and requirements up to date',
      action: 'Review and update project details',
      impact: 'Better team alignment and reduced confusion',
    });

    return recommendations;
  }

  /**
   * Empty insights for users with no projects
   */
  private getEmptyInsights(): AIInsightsResponse {
    return {
      healthScore: {
        score: 0,
        status: 'warning',
        factors: { progress: 0, velocity: 0, risks: 0, deadline: 0 },
      },
      risks: [],
      recommendations: [
        {
          priority: 'high',
          title: 'Create your first project',
          description: 'Start by creating a project to unlock AI insights',
          action: 'Click "New Project" to get started',
          impact: 'Begin tracking progress and getting intelligent recommendations',
        },
      ],
      summary: 'No active projects. Create a project to get started.',
      generatedAt: new Date().toISOString(),
      tokensUsed: 0,
    };
  }
}
