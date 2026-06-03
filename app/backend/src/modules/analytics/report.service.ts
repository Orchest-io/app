import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportSnapshot } from './entities';
import { CreateReportDto, UpdateReportDto, CreateReportSnapshotDto } from '@orchest/shared';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportSnapshot)
    private readonly snapshotRepository: Repository<ReportSnapshot>,
  ) {}

  async create(userId: string, createDto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create({ ...createDto, generatedBy: userId } as any);
    return this.reportRepository.save(report);
  }

  async findAll(projectId?: string): Promise<Report[]> {
    const where = projectId ? { projectId: projectId } : {};
    return this.reportRepository.find({ where, relations: ['snapshots'] });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id }, relations: ['snapshots'] });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async update(id: string, updateDto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);
    Object.assign(report, updateDto);
    return this.reportRepository.save(report);
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
  }

  async addSnapshot(reportId: string, snapshotDto: CreateReportSnapshotDto): Promise<ReportSnapshot> {
    const snapshot = this.snapshotRepository.create({ ...snapshotDto, reportId: reportId } as any);
    return this.snapshotRepository.save(snapshot);
  }
}
