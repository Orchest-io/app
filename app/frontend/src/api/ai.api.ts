import client from './client';
import {
  GenerateProjectPlanDto,
  GeneratedPlanResponse,
  AiJobDto,
  AcceptPlanDto,
  ProjectCreatedResponse,
  UsageLimitResponse,
} from '@orchest/shared';

/**
 * Start AI project plan generation
 * Returns jobId immediately, processing happens in background
 */
export const startProjectPlanGeneration = async (
  data: GenerateProjectPlanDto,
): Promise<GeneratedPlanResponse> => {
  const response = await client.post('/ai/generate-project-plan', data);
  return response.data;
};

/**
 * Get AI job status (polling endpoint)
 */
export const getJobStatus = async (jobId: string): Promise<AiJobDto> => {
  const response = await client.get(`/ai/jobs/${jobId}`);
  return response.data;
};

/**
 * Accept AI-generated plan and create project
 */
export const acceptAiPlan = async (
  jobId: string,
  data: AcceptPlanDto,
): Promise<ProjectCreatedResponse> => {
  const response = await client.post(`/ai/jobs/${jobId}/accept`, data);
  return response.data;
};

/**
 * Check user's monthly AI usage limit
 */
export const checkAiUsageLimit = async (): Promise<UsageLimitResponse> => {
  const response = await client.get('/ai/usage-limit');
  return response.data;
};

/**
 * Get user's AI job history
 */
export const getMyAiJobs = async (status?: string): Promise<AiJobDto[]> => {
  const response = await client.get('/ai/my-jobs', {
    params: status ? { status } : undefined,
  });
  return response.data;
};

/**
 * Cancel ongoing AI job
 */
export const cancelAiJob = async (jobId: string): Promise<void> => {
  await client.post(`/ai/jobs/${jobId}/cancel`);
};

/**
 * Send a message to the AI assistant
 */
export const chatWithAssistant = async (data: {
  message: string;
  conversationId?: string;
}): Promise<{ answer: string; conversationId: string }> => {
  const response = await client.post('/ai/chat', data);
  return response.data;
};
