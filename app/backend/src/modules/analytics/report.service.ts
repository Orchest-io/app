import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportSnapshot } from './entities';
import { CreateReportDto, UpdateReportDto, CreateReportSnapshotDto } from '../../../../../shared/src/dtos/analytics.dtos';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportSnapshot)
    private readonly snapshotRepository: Repository<ReportSnapshot>,
  ) {}

  async create(userId: string, createDto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create({ ...createDto, generated_by: userId });
    return this.reportRepository.save(report);
  }

  async findAll(projectId?: string): Promise<Report[]> {
    const where = projectId ? { project_id: projectId } : {};
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
    const snapshot = this.snapshotRepository.create({ ...snapshotDto, report_id: reportId });
    return this.snapshotRepository.save(snapshot);
  }
}
