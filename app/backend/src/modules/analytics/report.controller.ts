import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto, UpdateReportDto, CreateReportSnapshotDto } from '@orchest/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() createDto: CreateReportDto) {
    // Assuming user_id comes from auth middleware, mocked for now
    const mockUserId = '00000000-0000-0000-0000-000000000000';
    return this.reportService.create(mockUserId, createDto);
  }

  @Get()
  findAll(@Query('project_id') projectId?: string) {
    return this.reportService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateReportDto) {
    return this.reportService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }

  @Post(':id/snapshots')
  addSnapshot(@Param('id') id: string, @Body() snapshotDto: CreateReportSnapshotDto) {
    return this.reportService.addSnapshot(id, snapshotDto);
  }
}
