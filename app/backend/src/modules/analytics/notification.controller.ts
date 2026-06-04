import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, UpdateNotificationDto } from '@orchest/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createDto: CreateNotificationDto) {
    return this.notificationService.create(createDto);
  }

  @Get()
  findAll() {
    // Mock user for now
    const mockUserId = '00000000-0000-0000-0000-000000000000';
    return this.notificationService.findAll(mockUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
