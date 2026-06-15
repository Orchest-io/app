import apiClient from './client';
import type { AttachmentResponseDto } from '@orchest/shared';

export const getProjectAttachments = async (
  projectId: string,
): Promise<AttachmentResponseDto[]> => {
  const res = await apiClient.get(`/attachments/project/${projectId}`);
  return res.data;
};

export const getTaskAttachments = async (
  taskId: string,
): Promise<AttachmentResponseDto[]> => {
  const res = await apiClient.get(`/attachments/task/${taskId}`);
  return res.data;
};

export const uploadProjectAttachment = async (
  projectId: string,
  file: File,
): Promise<AttachmentResponseDto> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(`/attachments/project/${projectId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const uploadTaskAttachment = async (
  taskId: string,
  file: File,
): Promise<AttachmentResponseDto> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post(`/attachments/task/${taskId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteAttachment = async (id: string): Promise<void> => {
  await apiClient.delete(`/attachments/${id}`);
};

export const uploadUserAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
