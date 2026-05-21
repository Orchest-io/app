import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Report, 
  ReportSnapshot, 
  TimeEntry, 
  Notification, 
  ActivityLog 
} from './entities';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TimeEntryService } from './time-entry.service';
import { TimeEntryController } from './time-entry.controller';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportSnapshot,
      TimeEntry,
      Notification,
      ActivityLog,
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
  ],
  exports: [
    ReportService,
    TimeEntryService,
    NotificationService,
    ActivityLogService,
  ],
})
export class AnalyticsModule {}
