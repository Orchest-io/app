import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from './entities';
import { CreateTimeEntryDto, UpdateTimeEntryDto } from '@orchest/shared';

@Injectable()
export class TimeEntryService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
  ) {}

  async create(userId: string, createDto: CreateTimeEntryDto): Promise<TimeEntry> {
    const entry = this.timeEntryRepository.create({ ...createDto, userId: userId } as any);
    return this.timeEntryRepository.save(entry);
  }

  async findAll(projectId?: string, taskId?: string): Promise<TimeEntry[]> {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;
    return this.timeEntryRepository.find({ where });
  }

  async findOne(id: string): Promise<TimeEntry> {
    const entry = await this.timeEntryRepository.findOne({ where: { id } });
    if (!entry) throw new NotFoundException('Time entry not found');
    return entry;
  }

  async update(id: string, updateDto: UpdateTimeEntryDto): Promise<TimeEntry> {
    const entry = await this.findOne(id);
    Object.assign(entry, updateDto);
    return this.timeEntryRepository.save(entry);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);
    await this.timeEntryRepository.remove(entry);
  }
}
