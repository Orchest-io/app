import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiUsageLog } from '../entities/ai-usage-log.entity';
import { UsersService } from '../../users/users.service';
import { SubscriptionStatusResponse, SubscriptionTier } from '@orchest/shared';

@Injectable()
export class AiUsageService {
  constructor(
    @InjectRepository(AiUsageLog)
    private aiUsageLogRepository: Repository<AiUsageLog>,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  /**
   * Log AI usage
   */
  async logUsage(
    userId: string,
    feature: string,
    tokensUsed: number,
    modelUsed: string,
    aiJobId?: string,
  ): Promise<void> {
    const estimatedCost = this.calculateCost(tokensUsed, modelUsed);

    const log = this.aiUsageLogRepository.create({
      userId,
      feature,
      aiJobId,
      tokensUsed,
      estimatedCost,
      modelUsed,
    });

    await this.aiUsageLogRepository.save(log);
  }

  /**
   * Check monthly usage limit
   */
  async checkMonthlyLimit(
    userId: string,
    feature: string,
  ): Promise<{
    used: number;
    limit: number;
    canUse: boolean;
    resetsAt: Date;
    tier: SubscriptionTier;
  }> {
    // Check if user has bypass permission
    const hasBypass = await this.checkBypass(userId);
    if (hasBypass) {
      return {
        used: 0,
        limit: 999999,
        canUse: true,
        resetsAt: new Date('2099-12-31'),
        tier: 'pro',
      };
    }

    // Get user and subscription tier
    const user = await this.usersService.findOne(userId);
    const tier = user.subscriptionTier || 'free';

    // Determine limit
    let limit = 3;
    if (tier === 'pro') {
      limit = 30;
    }

    // Get current month's usage
    const startOfMonth = this.getStartOfMonth();
    const endOfMonth = this.getEndOfMonth();

    const used = await this.aiUsageLogRepository.count({
      where: {
        userId,
        feature,
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    const resetsAt = this.getNextMonthStart();

    return {
      used,
      limit,
      canUse: used < limit,
      resetsAt,
      tier,
    };
  }

  /**
   * Get the full subscription status response for a user
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResponse> {
    const user = await this.usersService.findOne(userId);
    const tier = user.subscriptionTier || 'free';

    const projectPlanningStatus = await this.checkMonthlyLimit(userId, 'project_planning');
    const descriptionGenStatus = await this.checkMonthlyLimit(userId, 'description_generation');

    return {
      tier,
      stripeCustomerId: user.stripeCustomerId || undefined,
      stripeSubscriptionId: user.stripeSubscriptionId || undefined,
      subscriptionExpiresAt: user.subscriptionExpiresAt?.toISOString() || undefined,
      aiPlans: {
        used: projectPlanningStatus.used,
        limit: projectPlanningStatus.limit,
        canUse: projectPlanningStatus.canUse,
        resetsAt: projectPlanningStatus.resetsAt.toISOString(),
      },
      aiDescriptions: {
        used: descriptionGenStatus.used,
        limit: descriptionGenStatus.limit,
        canUse: descriptionGenStatus.canUse,
        resetsAt: descriptionGenStatus.resetsAt.toISOString(),
      },
    };
  }

  /**
   * Check if user has bypass permission
   */
  private async checkBypass(userId: string): Promise<boolean> {
    // Get user
    const user = await this.usersService.findOne(userId);

    // Admin bypass - check roles array
    if (user.roles && Array.isArray(user.roles) && user.roles.includes('admin')) {
      return true;
    }

    // Email bypass
    const bypassEmails = this.configService
      .get<string>('AI_BYPASS_EMAILS', '')
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e);

    if (bypassEmails.includes(user.email)) {
      return true;
    }

    return false;
  }

  /**
   * Calculate estimated cost based on tokens and model
   */
  private calculateCost(tokens: number, model: string): number {
    // Pricing per 1M tokens (approximate)
    const pricing: Record<string, number> = {
      'gpt-4o': 2.50,
      'gpt-4o-mini': 0.15,
      'gpt-3.5-turbo': 0.002,
      'text-embedding-3-small': 0.02,
    };

    const pricePerMillion = pricing[model] || 0.10;
    return (tokens / 1000000) * pricePerMillion;
  }

  /**
   * Get start of current month
   */
  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  /**
   * Get end of current month
   */
  private getEndOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  /**
   * Get start of next month (for reset date)
   */
  private getNextMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  }

  /**
   * Get user's usage history
   */
  async getUserUsageHistory(
    userId: string,
    months: number = 3,
  ): Promise<AiUsageLog[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await this.aiUsageLogRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
