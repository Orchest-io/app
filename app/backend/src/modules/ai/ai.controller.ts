import { Controller, Get, Post, Body, Param, UseGuards, Sse, Query, Logger, HttpException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiService } from './ai.service';
import { AiJobService } from './services/ai-job.service';
import { AiUsageService } from './services/ai-usage.service';
import { AiTaskGeneratorService } from './services/ai-task-generator.service';
import {
  GenerateProjectPlanDto,
  AcceptPlanDto,
} from '@orchest/shared';
import { GenerateTaskRequestDto } from './dto/generate-task.dto';
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
    private readonly aiTaskGeneratorService: AiTaskGeneratorService,
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

  // ========================================
  // AI TASK GENERATION ENDPOINT
  // ========================================

  /**
   * POST /ai/generate-task
   * Generate a single AI-powered task from a natural-language description
   */
  @Post('generate-task')
  async generateTask(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GenerateTaskRequestDto,
  ) {
    // 1. Check monthly usage limit
    const limitCheck = await this.aiUsageService.checkMonthlyLimit(user.id, 'task_generation');

    if (!limitCheck.canUse) {
      throw new HttpException(
        {
          code: 'AI_LIMIT_REACHED',
          tier: limitCheck.tier,
          used: limitCheck.used,
          limit: limitCheck.limit,
        },
        403,
      );
    }

    // 2. Delegate to generator service, handle errors
    let tokensUsed = 0;
    let modelUsed = 'gpt-4o-mini';

    try {
      const result = await this.aiTaskGeneratorService.generateTask(user.id, dto);
      tokensUsed = result.tokensUsed;
      modelUsed = result.modelUsed;

      // 3. Log usage on success
      await this.aiUsageService.logUsage(user.id, 'task_generation', tokensUsed, modelUsed);

      return result.task;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        // Log usage even on parse failure (Requirement 10.2)
        await this.aiUsageService.logUsage(user.id, 'task_generation', tokensUsed, modelUsed);
        throw new HttpException(
          'AI returned an unexpected response. Please refine your description and try again.',
          502,
        );
      }

      // Network / provider errors (ECONNREFUSED, ETIMEDOUT, fetch failures, etc.)
      if (
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === 'ENOTFOUND' ||
        error?.status === 503 ||
        error?.status === 429
      ) {
        throw new HttpException(
          'AI service is temporarily unavailable. Please try again later.',
          503,
        );
      }

      Logger.error(`generateTask failed for user ${user.id}: ${error.message}`, error.stack, 'AiController');
      throw new HttpException(
        'An unexpected error occurred while generating the task. Please try again later.',
        500,
      );
    }
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