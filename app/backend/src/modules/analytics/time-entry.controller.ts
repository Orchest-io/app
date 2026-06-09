import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { TimeEntryService } from './time-entry.service';
import { CreateTimeEntryDto, UpdateTimeEntryDto } from '@orchest/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntryController {
  constructor(private readonly timeEntryService: TimeEntryService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() createDto: CreateTimeEntryDto) {
    return this.timeEntryService.create(user.id, createDto);
  }

  @Get()
  findAll(@Query('project_id') projectId?: string, @Query('task_id') taskId?: string) {
    return this.timeEntryService.findAll(projectId, taskId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timeEntryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateTimeEntryDto) {
    return this.timeEntryService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timeEntryService.remove(id);
  }
}
