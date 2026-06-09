import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto, UpdateReportDto, CreateReportSnapshotDto } from '@orchest/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateReportDto) {
    return this.reportService.create(user.id, createDto);
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
