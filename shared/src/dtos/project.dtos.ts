import {
	IsString,
	IsOptional,
	IsEnum,
	IsInt,
	Min,
	Max,
	IsDateString,
	IsObject,
	IsUUID,
	IsArray,
	IsHexColor,
} from "class-validator";
import {
	ProjectStatus,
	ProjectPriority,
	ProjectType,
	ProjectMode,
	ProjectMemberRole,
	MilestoneStatus,
} from "../enums";
import { ProjectMember, Milestone } from "../types";

export class CreateProjectDto {
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(ProjectPriority)
	priority?: ProjectPriority;

	@IsOptional()
	@IsEnum(ProjectType)
	projectType?: ProjectType;

	@IsOptional()
	@IsEnum(ProjectMode)
	projectMode?: ProjectMode;

	@IsOptional()
	@IsString()
	budget_amount?: string;

	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string;

	@IsOptional()
	@IsString()
	objectives?: string;

	@IsOptional()
	@IsString()
	requirements?: string;

	@IsOptional()
	@IsObject()
	settings?: Record<string, any>;

	@IsOptional()
	@IsEnum(ProjectStatus)
	status?: ProjectStatus;
}

export class UpdateProjectDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(ProjectStatus)
	status?: ProjectStatus;

	@IsOptional()
	@IsEnum(ProjectPriority)
	priority?: ProjectPriority;

	@IsOptional()
	@IsEnum(ProjectType)
	projectType?: ProjectType;

	@IsOptional()
	@IsEnum(ProjectMode)
	projectMode?: ProjectMode;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(100)
	progress?: number;

	@IsOptional()
	@IsString()
	budget?: string;

	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string;

	@IsOptional()
	@IsString()
	objectives?: string;

	@IsOptional()
	@IsString()
	requirements?: string;

	@IsOptional()
	@IsObject()
	settings?: Record<string, any>;
}

export class AddProjectMemberDto {
	@IsUUID()
	userId: string;

	@IsOptional()
	@IsEnum(ProjectMemberRole)
	role?: ProjectMemberRole;
}

export class CreateMilestoneDto {
	@IsString()
	title: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsDateString()
	targetDate?: string;

	@IsOptional()
	@IsInt()
	sortOrder?: number;

	@IsOptional()
	@IsString()
	color?: string;
}

export class UpdateMilestoneDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(MilestoneStatus)
	status?: MilestoneStatus;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(100)
	progress?: number;

	@IsOptional()
	@IsDateString()
	targetDate?: string;

	@IsOptional()
	@IsInt()
	sortOrder?: number;

	@IsOptional()
	@IsString()
	color?: string;
}

export class AssignTasksToMilestoneDto {
	@IsArray()
	@IsUUID('4', { each: true })
	taskIds: string[];
}

export interface ProjectListItemDto {
	id: string;
	name: string;
	description?: string;
	status: ProjectStatus;
	priority: ProjectPriority;
	progress: number;
	projectType: ProjectType;
	projectMode: ProjectMode;
	createdBy: string;
	startDate?: string;
	endDate?: string;
	createdAt: string | Date;
	updatedAt: string | Date;
}

export interface ProjectDetailDto extends ProjectListItemDto {
	description?: string;
	budget?: string;
	objectives?: string;
	requirements?: string;
	settings?: Record<string, any>;
	members: ProjectMember[];
	milestones: Milestone[];
}

export interface PaginationMeta {
	total: number;
	page: number;
	pageSize: number;
}
