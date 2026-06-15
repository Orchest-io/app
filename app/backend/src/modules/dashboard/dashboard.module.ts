import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { ActivityLog } from '../analytics/entities/activity-log.entity';
import { Notification } from '../analytics/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectMember,
      Task,
      ActivityLog,
      Notification,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
