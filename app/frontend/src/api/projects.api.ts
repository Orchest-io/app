import apiClient from './client';
import type {
  ProjectListItemDto,
  ProjectDetailDto,
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from '@orchest/shared';

export const getProjects = async (): Promise<ProjectListItemDto[]> => {
  const response = await apiClient.get<ProjectListItemDto[]>('/projects');
  return response.data;
};

export const getProject = async (id: string): Promise<ProjectDetailDto> => {
  const response = await apiClient.get<ProjectDetailDto>(`/projects/${id}`);
  return response.data;
};

export const createProject = async (dto: CreateProjectDto): Promise<ProjectDetailDto> => {
  const response = await apiClient.post<ProjectDetailDto>('/projects', dto);
  return response.data;
};

export const updateProject = async (
  id: string,
  dto: UpdateProjectDto
): Promise<ProjectDetailDto> => {
  const response = await apiClient.patch<ProjectDetailDto>(`/projects/${id}`, dto);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};

export const addMember = async (
  projectId: string,
  dto: { email: string; role: string; jobTitle?: string; skills?: string; status?: string }
): Promise<void> => {
  await apiClient.post(`/projects/${projectId}/members/by-email`, dto);
};

export const removeMember = async (
  projectId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/members/${userId}`);
};

export const createMilestone = async (
  projectId: string,
  dto: CreateMilestoneDto
): Promise<void> => {
  await apiClient.post(`/projects/${projectId}/milestones`, dto);
};

export const updateMilestone = async (
  milestoneId: string,
  dto: UpdateMilestoneDto
): Promise<void> => {
  await apiClient.patch(`/projects/milestones/${milestoneId}`, dto);
};

export const removeMilestone = async (milestoneId: string): Promise<void> => {
  await apiClient.delete(`/projects/milestones/${milestoneId}`);
};
