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
