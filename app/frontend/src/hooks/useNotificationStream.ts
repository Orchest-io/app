import { useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Notification, PaginatedNotifications } from '@orchest/shared';

const SSE_URL = 'http://localhost:3000/api/v1/notifications/stream';

export const useNotificationStream = () => {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  // Guard against StrictMode double-mount firing two connections
  const openedRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('orchest_token');

    // Do not open a connection when there is no token
    if (!token || openedRef.current) return;

    openedRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;

    fetchEventSource(SSE_URL, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      // Keep connection alive even when the tab is in the background
      openWhenHidden: true,

      async onopen(res) {
        if (!res.ok) {
          throw new Error(`SSE open failed: ${res.status}`);
        }
      },

      onmessage(event) {
        // Filter keepalive comment lines — no cache update, no toast
        if (!event.data || event.data === ': keepalive') return;

        let notification: Notification;
        try {
          notification = JSON.parse(event.data) as Notification;
        } catch {
          // Silently drop malformed events
          return;
        }

        // Prepend the incoming notification to the first-page React Query cache
        queryClient.setQueryData<PaginatedNotifications>(
          ['notifications', 1, 20],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: [notification, ...old.data],
              total: old.total + 1,
            };
          },
        );

        // Show a Sonner toast with title and optional message
        toast(notification.title, {
          description: notification.message ?? undefined,
        });
      },

      onerror(err) {
        // Re-throw to let fetch-event-source apply its built-in exponential back-off
        throw err;
      },
    });

    return () => {
      controller.abort();
      openedRef.current = false;
    };
  }, []); // empty deps — run once per mount
};
