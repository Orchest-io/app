import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { CreateActivityLogDto } from '@orchest/shared';

@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  create(@Body() createDto: CreateActivityLogDto) {
    const mockUserId = '00000000-0000-0000-0000-000000000000';
    return this.activityLogService.create(mockUserId, createDto);
  }

  @Get()
  findAll(@Query('project_id') projectId?: string, @Query('user_id') userId?: string) {
    return this.activityLogService.findAll(projectId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityLogService.findOne(id);
  }
}
