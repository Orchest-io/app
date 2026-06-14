import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@orchest/shared';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  markAllNotificationsRead,
} from '../api/notifications.api';

// GET /notifications?page=&limit= — cached by ['notifications', page, limit]
export const useNotifications = (page = 1, limit = 20) =>
  useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => getNotifications(page, limit),
  });

// Derived count of unread notifications from the first page
export const useUnreadCount = () => {
  const { data } = useNotifications(1, 20);
  return data?.data.filter((n: Notification) => !n.isRead).length ?? 0;
};

// PUT /notifications/:id — marks one notification as read, invalidates ['notifications']
export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// DELETE /notifications/:id — invalidates ['notifications']
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// POST /notifications/mark-all-read — invalidates ['notifications']
export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
