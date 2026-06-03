import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities';
import { CreateActivityLogDto } from '@orchest/shared';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(userId: string, createDto: CreateActivityLogDto): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({ ...createDto, userId: userId });
    return this.activityLogRepository.save(log);
  }

  async findAll(projectId?: string, userId?: string): Promise<ActivityLog[]> {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    return this.activityLogRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ActivityLog> {
    const log = await this.activityLogRepository.findOne({ where: { id } });
    if (!log) throw new NotFoundException('Activity log not found');
    return log;
  }
}
