import { IsString, IsOptional, IsUUID, IsEnum, IsBoolean, IsInt, IsNumber, IsDateString, IsObject } from 'class-validator';
import { ReportType, ReportStatus, ReportFormat, NotificationType, ReferenceType, ActivityAction, EntityType } from '../enums';

export class CreateReportDto {
  @IsUUID()
  @IsOptional()
  project_id?: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;

  @IsString()
  @IsOptional()
  file_url?: string;

  @IsObject()
  @IsOptional()
  filters?: any;
}

export class UpdateReportDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;

  @IsString()
  @IsOptional()
  file_url?: string;

  @IsObject()
  @IsOptional()
  filters?: any;
}

export class CreateReportSnapshotDto {
  @IsUUID()
  report_id: string;

  @IsString()
  metric_name: string;

  @IsNumber()
  @IsOptional()
  metric_value?: number;

  @IsString()
  @IsOptional()
  metric_unit?: string;

  @IsObject()
  @IsOptional()
  chart_data?: any;
}

export class CreateTimeEntryDto {
  @IsUUID()
  @IsOptional()
  task_id?: string;

  @IsUUID()
  project_id: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  duration_minutes: number;

  @IsNumber()
  @IsOptional()
  hourly_rate?: number;

  @IsDateString()
  entry_date: string;

  @IsDateString()
  @IsOptional()
  start_time?: string;

  @IsDateString()
  @IsOptional()
  end_time?: string;
}

export class UpdateTimeEntryDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  duration_minutes?: number;

  @IsDateString()
  @IsOptional()
  entry_date?: string;
}

export class CreateNotificationDto {
  @IsUUID()
  user_id: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(ReferenceType)
  @IsOptional()
  reference_type?: ReferenceType;

  @IsUUID()
  @IsOptional()
  reference_id?: string;
}

export class UpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  is_read?: boolean;

  @IsBoolean()
  @IsOptional()
  is_archived?: boolean;
}

export class CreateActivityLogDto {
  @IsUUID()
  @IsOptional()
  project_id?: string;

  @IsEnum(ActivityAction)
  action: ActivityAction;

  @IsEnum(EntityType)
  @IsOptional()
  entity_type?: EntityType;

  @IsUUID()
  @IsOptional()
  entity_id?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}
