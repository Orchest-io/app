import { Injectable, Logger } from '@nestjs/common';
import { AiJobService } from './ai-job.service';
import { AiAgentsService } from './ai-agents.service';
import { GenerateProjectPlanDto, GeneratedPlan } from '@orchest/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AiPipelineService {
  private readonly logger = new Logger(AiPipelineService.name);

  constructor(
    private aiJobService: AiJobService,
    private aiAgentsService: AiAgentsService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Execute 5-stage AI pipeline
   * Runs asynchronously in background
   */
  async executePipeline(
    jobId: string,
    userId: string,
    input: GenerateProjectPlanDto,
  ): Promise<void> {
    this.logger.log(`Starting pipeline for job ${jobId}`);
    let totalTokensUsed = 0;

    try {
      // Start job
      await this.aiJobService.startJob(jobId);

      // STAGE 1: Analyze Context (20%)
      this.logger.log(`[${jobId}] Stage 1: Analyzing context`);
      await this.updateProgress(jobId, 20, 'Analyzing your project...');
      
      const contextAnalysis = await this.aiAgentsService.analyzeProjectContext(
        input.description,
        userId,
        input.goals,
        input.timelinePreference,
      );
      totalTokensUsed += contextAnalysis.tokensUsed;

      // STAGE 2: Generate Milestones (40%)
      this.logger.log(`[${jobId}] Stage 2: Generating milestones`);
      await this.updateProgress(jobId, 40, 'Creating project milestones...');
      
      const { milestones, tokensUsed: milestonesTokens } = 
        await this.aiAgentsService.generateMilestones({
          description: input.description,
          projectType: contextAnalysis.projectType,
          complexity: contextAnalysis.complexity,
          keyFeatures: contextAnalysis.keyFeatures,
          suggestedDuration: contextAnalysis.suggestedDuration,
        }, userId);
      totalTokensUsed += milestonesTokens;

      // STAGE 3: Generate Tasks (60%)
      this.logger.log(`[${jobId}] Stage 3: Generating tasks`);
      await this.updateProgress(jobId, 60, 'Breaking down tasks...');
      
      let totalTasks = 0;
      for (const milestone of milestones) {
        const { tasks, tokensUsed: tasksTokens } = 
          await this.aiAgentsService.generateTasksForMilestone(
            milestone,
            {
              projectType: contextAnalysis.projectType,
              complexity: contextAnalysis.complexity,
            },
            userId,
          );
        milestone.tasks = tasks;
        totalTasks += tasks.length;
        totalTokensUsed += tasksTokens;
      }

      // STAGE 4: Suggest Assignments (80%)
      this.logger.log(`[${jobId}] Stage 4: Suggesting assignments`);
      await this.updateProgress(jobId, 80, 'Optimizing team assignments...');
      
      const allTasks = milestones.flatMap((m) => m.tasks);
      const { tasks: assignedTasks, tokensUsed: assignTokens } = 
        await this.aiAgentsService.suggestTaskAssignments(
          allTasks,
          input.teamMembers,
        );
      totalTokensUsed += assignTokens;

      // Update milestones with assigned tasks
      let taskIndex = 0;
      for (const milestone of milestones) {
        milestone.tasks = assignedTasks.slice(taskIndex, taskIndex + milestone.tasks.length);
        taskIndex += milestone.tasks.length;
      }

      // STAGE 5: Validate (100%)
      this.logger.log(`[${jobId}] Stage 5: Validating plan`);
      await this.updateProgress(jobId, 100, 'Finalizing your plan...');
      
      const validation = await this.aiAgentsService.validatePlan({
        milestones,
        totalTasks,
        estimatedDuration: contextAnalysis.suggestedDuration,
        complexity: contextAnalysis.complexity,
      }, userId);
      totalTokensUsed += validation.tokensUsed;

      // Build final result
      const result: GeneratedPlan = {
        projectName: this.generateProjectName(input.description, contextAnalysis.projectType),
        estimatedDuration: contextAnalysis.suggestedDuration,
        complexity: contextAnalysis.complexity,
        milestones,
        totalTasks,
        confidence: this.calculateConfidence(validation),
        warnings: validation.warnings,
        tokensUsed: totalTokensUsed,
        modelUsed: 'gpt-4o',
      };

      // Complete job
      await this.aiJobService.completeJob(jobId, result);
      this.logger.log(`[${jobId}] Pipeline completed successfully`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`[${jobId}] Pipeline failed: ${errorMessage}`, errorStack);
      await this.aiJobService.failJob(jobId, errorMessage);
      throw error;
    }
  }

  /**
   * Update job progress and emit SSE event
   */
  private async updateProgress(
    jobId: string,
    progress: number,
    stage: string,
  ): Promise<void> {
    await this.aiJobService.updateJobProgress(jobId, progress, stage);
    
    // Emit SSE event
    this.eventEmitter.emit('ai.job.progress', {
      jobId,
      progress,
      stage,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate project name from description
   */
  private generateProjectName(description: string, projectType: string): string {
    const words = description.split(' ').slice(0, 4);
    const name = words.join(' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(validation: any): number {
    if (!validation.isValid) return 60;
    if (validation.warnings.length > 3) return 70;
    if (validation.warnings.length > 0) return 85;
    return 95;
  }
}
