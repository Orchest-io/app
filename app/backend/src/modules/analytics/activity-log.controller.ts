import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { CreateActivityLogDto } from '@orchest/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateActivityLogDto) {
    return this.activityLogService.create(user.id, createDto);
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
