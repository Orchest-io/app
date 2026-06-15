import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Report, 
  ReportSnapshot, 
  TimeEntry, 
  Notification, 
  ActivityLog 
} from './entities';
import { Task } from '../tasks/entities/task.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TimeEntryService } from './time-entry.service';
import { TimeEntryController } from './time-entry.controller';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { SseService } from './sse.service';
import { DueDateSchedulerService } from './due-date-scheduler.service';
import { NotificationEventsListener } from './notification-events.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportSnapshot,
      TimeEntry,
      Notification,
      ActivityLog,
      Task,
    ]),
  ],
  controllers: [
    ReportController,
    TimeEntryController,
    NotificationController,
    ActivityLogController,
  ],
  providers: [
    ReportService,
    TimeEntryService,
    NotificationService,
    ActivityLogService,
    SseService,
    DueDateSchedulerService,
    NotificationEventsListener,
  ],
  exports: [
    ReportService,
    TimeEntryService,
    NotificationService,
    ActivityLogService,
    SseService,
    DueDateSchedulerService,
  ],
})
export class AnalyticsModule {}
