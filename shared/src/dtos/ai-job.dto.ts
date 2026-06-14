// AI Job DTOs

export interface GenerateProjectPlanDto {
  description: string;
  goals?: string;
  timelinePreference?: 'urgent' | 'normal' | 'flexible';
  teamMembers?: TeamMemberInput[];
}

export interface TeamMemberInput {
  email: string;
  name: string;
  jobTitle: string;
  skills: string;
  availability?: 'full-time' | 'part-time';
}

export interface GeneratedPlanResponse {
  jobId: string;
}

export interface GeneratedPlan {
  projectName: string;
  estimatedDuration: string;
  complexity: 'low' | 'medium' | 'high';
  milestones: GeneratedMilestone[];
  totalTasks: number;
  confidence: number;
  warnings: string[];
  tokensUsed?: number;
  modelUsed?: string;
}

export interface GeneratedMilestone {
  title: string;
  description: string;
  estimatedWeeks: number;
  tasks: GeneratedTask[];
  order: number;
}

export interface GeneratedTask {
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  riskLevel: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'medium' | 'complex';
  requiredSkills: string[];
  suggestedAssignee?: {
    email?: string;
    name?: string;
    reason?: string;
    matchScore?: number;
  };
  dependencies: string[];
}

export interface AcceptPlanDto {
  projectName?: string;
  milestones: EditedMilestone[];
  teamMembers?: TeamMemberToAdd[];
}

export interface EditedMilestone {
  title: string;
  description?: string;
  estimatedWeeks?: number;
  targetDate?: string;
  tasks: EditedTask[];
}

export interface EditedTask {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  estimatedHours?: number;
  assigneeEmail?: string;
}

export interface TeamMemberToAdd {
  email: string;
  role: 'owner' | 'member';
  jobTitle?: string;
  skills?: string;
}

export interface AiJobDto {
  id: string;
  userId: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'accepted' | 'rejected';
  progress: number;
  currentStage: string | null;
  inputData: any;
  resultData?: GeneratedPlan;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface UsageLimitResponse {
  used: number;
  limit: number;
  canUse: boolean;
  resetsAt: string;
}

export interface ProjectCreatedResponse {
  projectId: string;
  milestonesCreated: number;
  tasksCreated: number;
}
