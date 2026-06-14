import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiJob } from '../entities/ai-job.entity';

@Injectable()
export class AiJobService {
  constructor(
    @InjectRepository(AiJob)
    private aiJobRepository: Repository<AiJob>,
  ) {}

  /**
   * Create new AI job
   */
  async createJob(userId: string, type: string, inputData: any): Promise<AiJob> {
    const job = this.aiJobRepository.create({
      user: { id: userId } as any,
      type,
      status: 'pending' as any,
      progress: 0,
      inputData,
    });

    return await this.aiJobRepository.save(job);
  }

  /**
   * Get job by ID (with ownership check)
   */
  async getJob(jobId: string, userId?: string): Promise<AiJob> {
    const job = await this.aiJobRepository.findOne({ where: { id: jobId } });
    
    if (!job) {
      throw new NotFoundException('AI job not found');
    }

    if (userId && job.userId !== userId) {
      throw new ForbiddenException('Not your AI job');
    }

    return job;
  }

  /**
   * Update job progress
   */
  async updateJobProgress(
    jobId: string,
    progress: number,
    stage: string,
  ): Promise<void> {
    await this.aiJobRepository.update(jobId, {
      progress,
      currentStage: stage,
      status: progress < 100 ? 'processing' : 'processing', // Will be updated to 'completed' separately
    });
  }

  /**
   * Mark job as processing (started)
   */
  async startJob(jobId: string): Promise<void> {
    await this.aiJobRepository.update(jobId, {
      status: 'processing',
      startedAt: new Date(),
    });
  }

  /**
   * Mark job as completed with result
   */
  async completeJob(jobId: string, resultData: any): Promise<void> {
    await this.aiJobRepository.update(jobId, {
      status: 'completed',
      progress: 100,
      currentStage: 'Completed',
      resultData,
      completedAt: new Date(),
    });
  }

  /**
   * Mark job as failed with error message
   */
  async failJob(jobId: string, errorMessage: string): Promise<void> {
    await this.aiJobRepository.update(jobId, {
      status: 'failed',
      errorMessage,
      completedAt: new Date(),
    });
  }

  /**
   * Update job (generic)
   */
  async updateJob(jobId: string, updates: Partial<AiJob>): Promise<void> {
    await this.aiJobRepository.update(jobId, updates);
  }

  /**
   * Get user's jobs
   */
  async getUserJobs(userId: string, status?: string): Promise<AiJob[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return await this.aiJobRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 jobs
    });
  }

  /**
   * Cancel/reject job
   */
  async cancelJob(jobId: string, userId: string): Promise<void> {
    const job = await this.getJob(jobId, userId);

    if (job.status === 'completed' || job.status === 'accepted') {
      throw new ForbiddenException('Cannot cancel completed/accepted job');
    }

    await this.aiJobRepository.update(jobId, {
      status: 'rejected',
      completedAt: new Date(),
    });
  }
}
