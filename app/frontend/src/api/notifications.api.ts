import apiClient from './client';
import type { Notification, PaginatedNotifications } from '@orchest/shared';

export const getNotifications = async (
  page: number,
  limit: number,
): Promise<PaginatedNotifications> => {
  const response = await apiClient.get<PaginatedNotifications>('/notifications', {
    params: { page, limit },
  });
  return response.data;
};

export const markNotificationRead = async (id: string): Promise<Notification> => {
  const response = await apiClient.put<Notification>(`/notifications/${id}`, {
    isRead: true,
  });
  return response.data;
};

export const archiveNotification = async (id: string): Promise<Notification> => {
  const response = await apiClient.put<Notification>(`/notifications/${id}`, {
    isArchived: true,
  });
  return response.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

export const markAllNotificationsRead = async (): Promise<{ count: number }> => {
  const response = await apiClient.post<{ count: number }>('/notifications/mark-all-read');
  return response.data;
};
