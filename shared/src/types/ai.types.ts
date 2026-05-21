import { AiSessionStatus, AiPlanItemType, AiComplexity, AiInsightType, AiInsightSeverity, AiMessageRole, AiContextType } from '../enums';

export interface AiPlanSession {
  id: string;
  projectId: string;
  initiatedBy: string;
  status?: AiSessionStatus;
  inputData?: any;
  generatedPlan?: any;
  riskAnalysis?: any;
  resourceRecommendations?: any;
  generationTimeMs?: number;
  createdAt: Date;
}

export interface AiPlanItem {
  id: string;
  sessionId: string;
  itemType?: AiPlanItemType;
  title: string;
  description?: string;
  estimatedHours?: number;
  priority?: string;
  sortOrder?: number;
  isAccepted?: boolean;
  createdAt: Date;
}

export interface AiEstimation {
  id: string;
  projectId?: string;
  createdBy: string;
  taskId?: string;
  taskDescription: string;
  estimatedHours?: number;
  confidencePercent?: number;
  complexityLabel?: AiComplexity;
  similarTasksData?: any;
  breakdown?: any;
  createdAt: Date;
}

export interface AiTaskInsight {
  id: string;
  taskId: string;
  insightType?: AiInsightType;
  message: string;
  severity?: AiInsightSeverity;
  isDismissed?: boolean;
  metadata?: any;
  createdAt: Date;
}

export interface AiConversation {
  id: string;
  userId: string;
  title?: string;
  contextType?: AiContextType;
  contextId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role?: AiMessageRole;
  content: string;
  metadata?: any;
  createdAt: Date;
}
