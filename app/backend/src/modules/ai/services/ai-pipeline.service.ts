import { Injectable, Logger } from '@nestjs/common';
import { AiJobService } from './ai-job.service';
import { AiAgentsService } from './ai-agents.service';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { GenerateProjectPlanDto, GeneratedPlan } from '@orchest/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AiPipelineService {
  private readonly logger = new Logger(AiPipelineService.name);

  constructor(
    private aiJobService: AiJobService,
    private aiAgentsService: AiAgentsService,
    private orchestrator: AiOrchestratorService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Execute ADVANCED 6-Agent Pipeline
   * Uses specialized agents for maximum accuracy
   */
  async executeAdvancedPipeline(
    jobId: string,
    userId: string,
    input: GenerateProjectPlanDto,
  ): Promise<void> {
    this.logger.log(`🚀 Starting ADVANCED Multi-Agent Pipeline for job ${jobId}`);
    let totalTokensUsed = 0;

    try {
      await this.aiJobService.startJob(jobId);

      // ========================================
      // AGENT 1: Research (15%)
      // ========================================
      this.logger.log(`[${jobId}] 🔍 Agent 1: Research & Analysis`);
      await this.updateProgress(jobId, 15, 'Analyzing requirements...');
      
      const { analysis, insights, tokensUsed: researchTokens } = 
        await this.orchestrator.researchAgent({
          description: input.description,
          goals: input.goals,
          userId,
        });
      totalTokensUsed += researchTokens;

      // ========================================
      // AGENT 2: Planning (30%)
      // ========================================
      this.logger.log(`[${jobId}] 📋 Agent 2: Strategic Planning`);
      await this.updateProgress(jobId, 30, 'Creating project structure...');
      
      const { plan, tokensUsed: planTokens } = 
        await this.orchestrator.planningAgent({
          analysis,
          description: input.description,
          userId,
        });
      totalTokensUsed += planTokens;

      // ========================================
      // AGENT 3: Breakdown (50%)
      // ========================================
      this.logger.log(`[${jobId}] 🔨 Agent 3: Task Breakdown`);
      await this.updateProgress(jobId, 50, 'Breaking down into tasks...');
      
      const allTasks: any[] = [];
      for (const milestone of plan.milestones) {
        const { tasks, tokensUsed: breakdownTokens } = 
          await this.orchestrator.breakdownAgent({
            milestone,
            projectContext: {
              projectType: analysis.projectType,
              complexity: analysis.complexity,
            },
            userId,
          });
        
        milestone.tasks = tasks;
        allTasks.push(...tasks);
        totalTokensUsed += breakdownTokens;
      }

      // ========================================
      // AGENT 4: Estimation (65%)
      // ========================================
      this.logger.log(`[${jobId}] ⏱️ Agent 4: Estimate Refinement`);
      await this.updateProgress(jobId, 65, 'Refining estimates...');
      
      const { refinedTasks, adjustments, tokensUsed: estTokens } = 
        await this.orchestrator.estimationAgent({
          tasks: allTasks,
        });
      totalTokensUsed += estTokens;

      // Update milestones with refined tasks
      let taskIndex = 0;
      for (const milestone of plan.milestones) {
        const count = milestone.tasks.length;
        milestone.tasks = refinedTasks.slice(taskIndex, taskIndex + count);
        taskIndex += count;
      }

      // ========================================
      // AGENT 5: Assignment (80%)
      // ========================================
      this.logger.log(`[${jobId}] 👥 Agent 5: Team Assignment`);
      await this.updateProgress(jobId, 80, 'Matching tasks to team...');
      
      const { assignments, tokensUsed: assignTokens } = 
        await this.orchestrator.assignmentAgent({
          tasks: refinedTasks,
          teamMembers: input.teamMembers || [],
        });
      totalTokensUsed += assignTokens;

      // Apply assignments
      if (assignments.length > 0) {
        for (const milestone of plan.milestones) {
          milestone.tasks = milestone.tasks.map((task: any) => {
            const assignment = assignments.find((a: any) => a.taskTitle === task.title);
            if (assignment) {
              return {
                ...task,
                suggestedAssignee: {
                  email: assignment.assignedTo,
                  matchScore: assignment.matchScore,
                  reason: assignment.reason,
                  alternatives: assignment.alternatives,
                },
              };
            }
            return task;
          });
        }
      }

      // ========================================
      // AGENT 6: Validation (100%)
      // ========================================
      this.logger.log(`[${jobId}] ✅ Agent 6: Final Validation`);
      await this.updateProgress(jobId, 100, 'Finalizing your plan...');
      
      const validation = await this.orchestrator.validationAgent({
        plan,
        tasks: refinedTasks,
        assignments,
      });
      totalTokensUsed += validation.tokensUsed;

      // ========================================
      // Build Final Result
      // ========================================
      const result: GeneratedPlan = {
        projectName: this.generateProjectName(input.description, analysis.projectType),
        estimatedDuration: plan.totalDuration,
        complexity: analysis.complexity,
        milestones: plan.milestones.map(milestone => ({
          title: milestone.title,
          description: milestone.description,
          estimatedWeeks: milestone.estimatedWeeks,
          tasks: milestone.tasks || [],
          order: milestone.order,
        })),
        totalTasks: refinedTasks.length,
        confidence: validation.score,
        warnings: validation.warnings,
        suggestions: validation.suggestions,
        insights: insights,
        tokensUsed: totalTokensUsed,
        modelUsed: 'gpt-4o + multi-agent',
      };

      await this.aiJobService.completeJob(jobId, result);
      this.logger.log(`✨ [${jobId}] Advanced pipeline completed! Quality: ${validation.score}/100`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[${jobId}] Pipeline failed: ${errorMessage}`);
      await this.aiJobService.failJob(jobId, errorMessage);
      throw error;
    }
  }

  /**
   * Execute BASIC 5-stage AI pipeline (Legacy - for comparison)
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
