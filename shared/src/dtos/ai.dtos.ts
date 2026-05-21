import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsObject, IsUUID } from 'class-validator';

export enum AiSessionStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AiPlanItemType {
  TASK = 'task',
  MILESTONE = 'milestone',
  DEPENDENCY = 'dependency',
}

export enum AiComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  VERY_COMPLEX = 'very-complex',
}

export enum AiInsightType {
  SUGGESTION = 'suggestion',
  PREDICTION = 'prediction',
  RISK = 'risk',
  OPTIMIZATION = 'optimization',
}

export enum AiInsightSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum AiMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum AiContextType {
  GENERAL = 'general',
  PROJECT = 'project',
  TASK = 'task',
}

export class CreateAiPlanSessionDto {
  @IsUUID()
  project_id: string;

  @IsUUID()
  initiated_by: string;

  @IsOptional()
  @IsObject()
  input_data?: Record<string, any>;
}

export class UpdateAiPlanSessionDto {
  @IsOptional()
  @IsEnum(AiSessionStatus)
  status?: AiSessionStatus;

  @IsOptional()
  @IsObject()
  generated_plan?: Record<string, any>;

  @IsOptional()
  @IsObject()
  risk_analysis?: Record<string, any>;

  @IsOptional()
  @IsObject()
  resource_recommendations?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  generation_time_ms?: number;
}

export class CreateAiPlanItemDto {
  @IsUUID()
  session_id: string;

  @IsEnum(AiPlanItemType)
  item_type: AiPlanItemType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  estimated_hours?: number;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_accepted?: boolean;
}

export class UpdateAiPlanItemDto {
  @IsOptional()
  @IsEnum(AiPlanItemType)
  item_type?: AiPlanItemType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  estimated_hours?: number;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsNumber()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_accepted?: boolean;
}

export class CreateAiEstimationDto {
  @IsUUID()
  project_id: string;

  @IsUUID()
  created_by: string;

  @IsOptional()
  @IsUUID()
  task_id?: string;

  @IsString()
  task_description: string;

  @IsOptional()
  @IsNumber()
  estimated_hours?: number;

  @IsOptional()
  @IsNumber()
  confidence_percent?: number;

  @IsOptional()
  @IsEnum(AiComplexity)
  complexity_label?: AiComplexity;

  @IsOptional()
  @IsObject()
  similar_tasks_data?: Record<string, any>;

  @IsOptional()
  @IsObject()
  breakdown?: Record<string, any>;
}

export class UpdateAiEstimationDto {
  @IsOptional()
  @IsString()
  task_description?: string;

  @IsOptional()
  @IsNumber()
  estimated_hours?: number;

  @IsOptional()
  @IsNumber()
  confidence_percent?: number;

  @IsOptional()
  @IsEnum(AiComplexity)
  complexity_label?: AiComplexity;

  @IsOptional()
  @IsObject()
  similar_tasks_data?: Record<string, any>;

  @IsOptional()
  @IsObject()
  breakdown?: Record<string, any>;
}

export class CreateAiTaskInsightDto {
  @IsUUID()
  task_id: string;

  @IsOptional()
  @IsEnum(AiInsightType)
  insight_type?: AiInsightType;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(AiInsightSeverity)
  severity?: AiInsightSeverity;

  @IsOptional()
  @IsBoolean()
  is_dismissed?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateAiTaskInsightDto {
  @IsOptional()
  @IsEnum(AiInsightType)
  insight_type?: AiInsightType;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(AiInsightSeverity)
  severity?: AiInsightSeverity;

  @IsOptional()
  @IsBoolean()
  is_dismissed?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateAiConversationDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(AiContextType)
  context_type?: AiContextType;

  @IsOptional()
  @IsUUID()
  context_id?: string;
}

export class UpdateAiConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(AiContextType)
  context_type?: AiContextType;

  @IsOptional()
  @IsUUID()
  context_id?: string;
}

export class CreateAiMessageDto {
  @IsUUID()
  conversation_id: string;

  @IsOptional()
  @IsEnum(AiMessageRole)
  role?: AiMessageRole;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateAiMessageDto {
  @IsOptional()
  @IsEnum(AiMessageRole)
  role?: AiMessageRole;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
