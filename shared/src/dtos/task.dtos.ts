import { IsString, IsOptional, IsEnum, IsInt, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { TaskType, TaskStatus, TaskPriority } from '../index';

export class CreateTaskDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  @IsOptional()
  milestoneId?: string;

  @IsUUID()
  createdBy: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsInt()
  @IsOptional()
  complexity?: number;

  @IsInt()
  @IsOptional()
  estimatedHours?: number;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsInt()
  @IsOptional()
  complexity?: number;

  @IsInt()
  @IsOptional()
  estimatedHours?: number;

  @IsInt()
  @IsOptional()
  actualHours?: number;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsUUID()
  @IsOptional()
  milestoneId?: string;
}
