import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { AiPlanSession } from './entities/ai-plan-session.entity';
import { AiEstimation } from './entities/ai-estimation.entity';
import { AiConversation } from './entities/ai-conversation.entity';
import { AiMessage } from './entities/ai-message.entity';

import {
  CreateAiPlanSessionDto, UpdateAiPlanSessionDto,
  CreateAiEstimationDto, UpdateAiEstimationDto,
  CreateAiConversationDto, UpdateAiConversationDto,
  CreateAiMessageDto, UpdateAiMessageDto,
  GenerateProjectPlanDto,
  AcceptPlanDto,
  ProjectStatus,
  TaskType,
  TaskStatus,
  TaskPriority,
} from '@orchest/shared';

import { AiJobService } from './services/ai-job.service';
import { AiUsageService } from './services/ai-usage.service';
import { AiPipelineService } from './services/ai-pipeline.service';
import { AiRagService } from './services/ai-rag.service';
import { AiAssistantService } from './services/ai-assistant.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiPlanSession) private aiPlanSessionRepo: Repository<AiPlanSession>,
    @InjectRepository(AiEstimation) private aiEstimationRepo: Repository<AiEstimation>,
    @InjectRepository(AiConversation) private aiConversationRepo: Repository<AiConversation>,
    @InjectRepository(AiMessage) private aiMessageRepo: Repository<AiMessage>,
    private aiJobService: AiJobService,
    private aiUsageService: AiUsageService,
    private aiPipelineService: AiPipelineService,
    private aiRagService: AiRagService,
    private aiAssistantService: AiAssistantService,
    private projectsService: ProjectsService,
    private tasksService: TasksService,
    private usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  // AiPlanSession
  async createPlanSession(dto: CreateAiPlanSessionDto) {
    const session = this.aiPlanSessionRepo.create(dto as any) as any;
    return await this.aiPlanSessionRepo.save(session);
  }

  async findAllPlanSessions() {
    return await this.aiPlanSessionRepo.find();
  }

  async findOnePlanSession(id: string) {
    const session = await this.aiPlanSessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException('AiPlanSession not found');
    return session;
  }

  async updatePlanSession(id: string, dto: UpdateAiPlanSessionDto) {
    const session = await this.findOnePlanSession(id);
    Object.assign(session, dto);
    return await this.aiPlanSessionRepo.save(session);
  }

  async removePlanSession(id: string) {
    const session = await this.findOnePlanSession(id);
    return await this.aiPlanSessionRepo.remove(session);
  }

  // AiEstimation
  async createEstimation(dto: CreateAiEstimationDto) {
    const est = this.aiEstimationRepo.create(dto as any) as any;
    return await this.aiEstimationRepo.save(est);
  }

  async findAllEstimations() {
    return await this.aiEstimationRepo.find();
  }

  async updateEstimation(id: string, dto: UpdateAiEstimationDto) {
    const est = await this.aiEstimationRepo.findOne({ where: { id } });
    if (!est) throw new NotFoundException('AiEstimation not found');
    Object.assign(est, dto);
    return await this.aiEstimationRepo.save(est);
  }

  async removeEstimation(id: string) {
    const est = await this.aiEstimationRepo.findOne({ where: { id } });
    if (!est) throw new NotFoundException('AiEstimation not found');
    return await this.aiEstimationRepo.remove(est);
  }

  // AiConversation
  async createConversation(dto: CreateAiConversationDto) {
    const convo = this.aiConversationRepo.create(dto as any) as any;
    return await this.aiConversationRepo.save(convo);
  }

  async findAllConversations() {
    return await this.aiConversationRepo.find({ relations: ['messages'] });
  }

  async updateConversation(id: string, dto: UpdateAiConversationDto) {
    const convo = await this.aiConversationRepo.findOne({ where: { id } });
    if (!convo) throw new NotFoundException('AiConversation not found');
    Object.assign(convo, dto);
    return await this.aiConversationRepo.save(convo);
  }

  async removeConversation(id: string) {
    const convo = await this.aiConversationRepo.findOne({ where: { id } });
    if (!convo) throw new NotFoundException('AiConversation not found');
    return await this.aiConversationRepo.remove(convo);
  }

  // AiMessage
  async createMessage(dto: CreateAiMessageDto) {
    const msg = this.aiMessageRepo.create(dto as any) as any;
    return await this.aiMessageRepo.save(msg);
  }

  async findAllMessages() {
    return await this.aiMessageRepo.find();
  }

  async updateMessage(id: string, dto: UpdateAiMessageDto) {
    const msg = await this.aiMessageRepo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException('AiMessage not found');
    Object.assign(msg, dto);
    return await this.aiMessageRepo.save(msg);
  }

  async removeMessage(id: string) {
    const msg = await this.aiMessageRepo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException('AiMessage not found');
    return await this.aiMessageRepo.remove(msg);
  }

  // ========================================
  // NEW: AI PROJECT PLANNING METHODS
  // ========================================

  /**
   * Start async AI project plan generation
   * Returns jobId immediately
   */
  async startProjectPlanGeneration(
    userId: string,
    input: GenerateProjectPlanDto,
  ): Promise<{ jobId: string }> {
    // Check usage limit
    const limitCheck = await this.aiUsageService.checkMonthlyLimit(
      userId,
      'project_planning',
    );

    if (!limitCheck.canUse) {
      throw new ForbiddenException(
        `Monthly AI usage limit exceeded (${limitCheck.used}/${limitCheck.limit}). Resets on ${limitCheck.resetsAt.toLocaleDateString()}.`,
      );
    }

    // Create AI job
    const job = await this.aiJobService.createJob(userId, 'project_planning', input);

    // Start pipeline asynchronously (fire-and-forget)
    this.aiPipelineService
      .executePipeline(job.id, userId, input)
      .catch((error) => {
        // Errors are handled inside pipeline
      });

    return { jobId: job.id };
  }

  /**
   * Accept AI-generated plan and create actual project
   */
  async acceptPlanAndCreateProject(
    userId: string,
    jobId: string,
    acceptDto: AcceptPlanDto,
  ): Promise<{ projectId: string; milestonesCreated: number; tasksCreated: number }> {
    // Get and validate job
    const job = await this.aiJobService.getJob(jobId, userId);

    if (job.status !== 'completed') {
      throw new BadRequestException('AI job not completed yet');
    }

    // Create project in transaction
    return await this.dataSource.transaction(async (manager) => {
      // Create project
      const project = await this.projectsService.create(userId, {
        name: acceptDto.projectName || job.resultData.projectName,
        description: job.inputData.description,
        status: ProjectStatus.PLANNING,
      });

      let milestonesCreated = 0;
      let tasksCreated = 0;

      // Create milestones and tasks
      for (const milestoneDto of acceptDto.milestones) {
        const milestone = await this.projectsService.createMilestone(
          project.id,
          {
            title: milestoneDto.title,
            description: milestoneDto.description,
            targetDate: milestoneDto.targetDate ? milestoneDto.targetDate : undefined,
          },
          userId,
        );
        milestonesCreated++;

        // Create tasks for milestone
        for (const taskDto of milestoneDto.tasks) {
          const task = await this.tasksService.create({
            projectId: project.id,
            milestoneId: milestone.id,
            createdBy: userId,
            title: taskDto.title,
            description: taskDto.description,
            type: (taskDto.type as TaskType) || TaskType.FEATURE,
            status: TaskStatus.BACKLOG,
            priority: (taskDto.priority as TaskPriority) || TaskPriority.MEDIUM,
            estimatedHours: taskDto.estimatedHours,
          });
          tasksCreated++;

          // Assign if specified
          if (taskDto.assigneeEmail) {
            try {
              const assigneeUser = await this.usersService.findByEmail(taskDto.assigneeEmail);
              if (assigneeUser) {
                await this.tasksService.addAssignee(task.id, {
                  userId: assigneeUser.id,
                  isPrimary: true,
                });
              }
            } catch (error) {
              // Skip if user not found
            }
          }
        }
      }

      // Add team members if provided
      if (acceptDto.teamMembers && acceptDto.teamMembers.length > 0) {
        for (const member of acceptDto.teamMembers) {
          try {
            await this.projectsService.addMemberByEmail(
              project.id,
              member.email,
              member.role as any,
              userId,
              member.jobTitle,
              member.skills,
            );
          } catch (error) {
            // Skip if member already exists or not found
          }
        }
      }

      // Update job status
      await this.aiJobService.updateJob(jobId, {
        status: 'accepted',
        acceptedAt: new Date(),
      });

      // Log usage (only count accepted plans)
      await this.aiUsageService.logUsage(
        userId,
        'project_planning',
        job.resultData.tokensUsed || 0,
        job.resultData.modelUsed || 'gpt-4o-mini',
        jobId,
      );

      // Index project for RAG (non-blocking)
      this.aiRagService.indexProjectData(project.id).catch((err) => {
        console.error('RAG indexing failed:', err);
      });

      return {
        projectId: project.id,
        milestonesCreated,
        tasksCreated,
      };
    });
  }

  // ========================================
  // AI ASSISTANT CHAT
  // ========================================

  /**
   * Chat with the built-in AI assistant.
   * Delegates to AiAssistantService which handles RAG + system prompt + history.
   */
  async chatWithAssistant(
    userId: string,
    message: string,
    conversationId?: string,
  ): Promise<{ answer: string; conversationId: string }> {
    return this.aiAssistantService.chat(userId, message, conversationId);
  }
}
