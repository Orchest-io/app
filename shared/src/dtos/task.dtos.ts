import { IsString, IsOptional, IsEnum, IsInt, IsUUID, IsDateString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskType, TaskStatus, TaskPriority, DependencyType } from '../index';

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

export class BoardTaskUpdateDto {
  @IsUUID()
  taskId: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class BulkUpdateTasksDto {
  @ValidateNested({ each: true })
  @Type(() => BoardTaskUpdateDto)
  tasks: BoardTaskUpdateDto[];
}

export class CreateSubtaskDto {
  @IsString()
  title: string;
}

export class UpdateSubtaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class AddTaskAssigneeDto {
  @IsUUID()
  userId: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateTaskDependencyDto {
  @IsUUID()
  dependsOnTaskId: string;

  @IsEnum(DependencyType)
  @IsOptional()
  type?: DependencyType;
}

export class CreateCommentDto {
  @IsString()
  content: string;
}

