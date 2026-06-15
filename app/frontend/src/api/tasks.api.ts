import apiClient from './client';
import type { CreateTaskDto, UpdateTaskDto } from '@orchest/shared';

export const getProjectTasks = async (projectId: string) => {
  const response = await apiClient.get<any[]>(`/tasks/board/${projectId}`);
  return response.data;
};

export const getTask = async (taskId: string) => {
  const response = await apiClient.get<any>(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (dto: CreateTaskDto) => {
  const response = await apiClient.post<any>('/tasks', dto);
  return response.data;
};

export const updateTask = async (taskId: string, dto: UpdateTaskDto) => {
  const response = await apiClient.patch<any>(`/tasks/${taskId}`, dto);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await apiClient.delete(`/tasks/${taskId}`);
};
