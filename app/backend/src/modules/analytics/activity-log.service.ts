import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities';
import { CreateActivityLogDto } from '../../../../../shared/src/dtos/analytics.dtos';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(userId: string, createDto: CreateActivityLogDto): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({ ...createDto, user_id: userId });
    return this.activityLogRepository.save(log);
  }

  async findAll(projectId?: string, userId?: string): Promise<ActivityLog[]> {
    const where: any = {};
    if (projectId) where.project_id = projectId;
    if (userId) where.user_id = userId;
    return this.activityLogRepository.find({ where, order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<ActivityLog> {
    const log = await this.activityLogRepository.findOne({ where: { id } });
    if (!log) throw new NotFoundException('Activity log not found');
    return log;
  }
}
