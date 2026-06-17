import { Controller, Get, Post, Body, Param, UseGuards, Sse, Query, Logger, HttpException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiService } from './ai.service';
import { AiJobService } from './services/ai-job.service';
import { AiUsageService } from './services/ai-usage.service';
import {
  GenerateProjectPlanDto,
  AcceptPlanDto,
} from '@orchest/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
  id: string;
  email: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiJobService: AiJobService,
    private readonly aiUsageService: AiUsageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ========================================
  // AI PROJECT PLANNING ENDPOINTS
  // ========================================

  /**
   * POST /ai/generate-project-plan
   * Start async AI project plan generation
   */
  @Post('generate-project-plan')
  async generateProjectPlan(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateProjectPlanDto,
  ) {
    return await this.aiService.startProjectPlanGeneration(user.id, dto);
  }

  /**
   * GET /ai/jobs/:jobId
   * Get AI job status (polling endpoint)
   */
  @Get('jobs/:jobId')
  async getJobStatus(
    @CurrentUser() user: JwtPayload,
    @Param('jobId') jobId: string,
  ) {
    return await this.aiJobService.getJob(jobId, user.id);
  }

  /**
   * SSE /ai/jobs/:jobId/progress
   * Real-time progress updates
   */
  @Sse('jobs/:jobId/progress')
  async streamJobProgress(
    @CurrentUser() user: JwtPayload,
    @Param('jobId') jobId: string,
  ): Promise<Observable<MessageEvent>> {
    // Verify ownership first (await it)
    try {
      await this.aiJobService.getJob(jobId, user.id);
    } catch (error) {
      throw new ForbiddenException('Not your job or job not found');
    }

    // Create observable that emits progress events
    return new Observable((subscriber) => {
      const eventHandler = (data: any) => {
        if (data.jobId === jobId) {
          subscriber.next({
            data: JSON.stringify(data),
          } as MessageEvent);

          // Complete stream when job is done
          if (data.progress >= 100) {
            subscriber.complete();
          }
        }
      };

      // Listen to progress events
      this.eventEmitter.on('ai.job.progress', eventHandler);

      // Cleanup on unsubscribe
      return () => {
        this.eventEmitter.off('ai.job.progress', eventHandler);
      };
    });
  }

  /**
   * POST /ai/jobs/:jobId/accept
   * Accept AI plan and create project
   */
  @Post('jobs/:jobId/accept')
  async acceptPlan(
    @CurrentUser() user: JwtPayload,
    @Param('jobId') jobId: string,
    @Body() dto: AcceptPlanDto,
  ) {
    try {
      return await this.aiService.acceptPlanAndCreateProject(user.id, jobId, dto);
    } catch (error: any) {
      Logger.error(`Accept plan failed for job ${jobId}: ${error.message}`, error.stack, 'AiController');
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Failed to accept plan', 500);
    }
  }

  /**
   * GET /ai/usage-limit
   * Check user's monthly AI usage
   */
  @Get('usage-limit')
  async checkUsageLimit(@CurrentUser() user: JwtPayload) {
    const result = await this.aiUsageService.checkMonthlyLimit(
      user.id,
      'project_planning',
    );

    return {
      used: result.used,
      limit: result.limit,
      canUse: result.canUse,
      resetsAt: result.resetsAt.toISOString(),
    };
  }

  /**
   * GET /ai/subscription-status
   * Get complete subscription status and AI quotas
   */
  @Get('subscription-status')
  async getSubscriptionStatus(@CurrentUser() user: JwtPayload) {
    return await this.aiUsageService.getSubscriptionStatus(user.id);
  }

  /**
   * POST /ai/generate-description
   * AI Description generator infrastructure stub
   */
  @Post('generate-description')
  async generateDescription(
    @CurrentUser() user: JwtPayload,
    @Body() body: { context: string; type: 'task' | 'project' },
  ) {
    const limitCheck = await this.aiUsageService.checkMonthlyLimit(
      user.id,
      'description_generation',
    );

    if (!limitCheck.canUse) {
      throw new HttpException(
        {
          statusCode: 403,
          code: 'AI_LIMIT_REACHED',
          tier: limitCheck.tier,
          used: limitCheck.used,
          limit: limitCheck.limit,
          message: `Monthly AI usage limit exceeded (${limitCheck.used}/${limitCheck.limit}).`,
        },
        403,
      );
    }

    throw new HttpException('AI Description Generator is coming soon!', 501);
  }

  /**
   * GET /ai/my-jobs
   * Get user's AI job history
   */
  @Get('my-jobs')
  async getMyJobs(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    return await this.aiJobService.getUserJobs(user.id, status);
  }

  /**
   * POST /ai/jobs/:jobId/cancel
   * Cancel ongoing AI generation
   */
  @Post('jobs/:jobId/cancel')
  async cancelJob(
    @CurrentUser() user: JwtPayload,
    @Param('jobId') jobId: string,
  ) {
    await this.aiJobService.cancelJob(jobId, user.id);
    return { success: true };
  }

  // ========================================
  // AI ASSISTANT CHAT ENDPOINT
  // ========================================

  /**
   * POST /ai/chat
   * Send a message to the AI assistant and receive an answer.
   * The assistant only answers questions related to this system.
   * Body: { message: string, conversationId?: string }
   */
  @Post('chat')
  async chat(
    @CurrentUser() user: JwtPayload,
    @Body() body: { message: string; conversationId?: string },
  ) {
    const { message, conversationId } = body;
    return this.aiService.chatWithAssistant(user.id, message, conversationId);
  }
}