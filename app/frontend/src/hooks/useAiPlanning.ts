import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {
  startProjectPlanGeneration,
  getJobStatus,
  acceptAiPlan,
  checkAiUsageLimit,
  getMyAiJobs,
  cancelAiJob,
} from '../api/ai.api';
import type {
  AcceptPlanDto,
} from '@orchest/shared';

/**
 * Hook for starting AI project plan generation
 */
export const useStartGeneration = () => {
  return useMutation({
    mutationFn: startProjectPlanGeneration,
    onError: (error: any) => {
      console.error('Failed to start AI generation:', error);
    },
  });
};

/**
 * Hook for polling job status (fallback if SSE fails)
 */
export const useJobStatus = (jobId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['ai-job', jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      // Stop polling when completed or failed
      const data = query.state.data;
      if (
        data?.status === 'completed' ||
        data?.status === 'failed' ||
        data?.status === 'accepted' ||
        data?.status === 'rejected'
      ) {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
};

/**
 * Hook for real-time job progress via SSE
 * Uses @microsoft/fetch-event-source for auth support
 */
export const useJobProgress = (jobId: string | null) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const token = localStorage.getItem('orchest_token');
    if (!token) {
      setError('No authentication token');
      return;
    }

    let abortController = new AbortController();
    let timeout: ReturnType<typeof setTimeout>;

    const connectSSE = async () => {
      try {
        setIsConnected(true);
        setError(null);

        // Fall back to polling if SSE doesn't connect within 5 seconds
        timeout = setTimeout(() => {
          abortController.abort();
          setIsConnected(false);
          setError('SSE timed out, using polling fallback');
        }, 5000);

        await fetchEventSource(
          `http://localhost:3000/api/v1/ai/jobs/${jobId}/progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: abortController.signal,
            onmessage(event) {
              try {
                // Skip empty messages
                if (!event.data || event.data.trim() === '') {
                  return;
                }
                
                const data = JSON.parse(event.data);
                clearTimeout(timeout);
                setProgress(data.progress || 0);
                setStage(data.stage || '');
                if (data.progress >= 100) {
                  abortController.abort();
                }
              } catch (err) {
                console.error('Failed to parse SSE message:', err);
                // Don't throw - just skip this message
              }
            },
            onerror(err) {
              console.error('SSE error:', err);
              clearTimeout(timeout);
              setError('Connection lost, falling back to polling');
              setIsConnected(false);
              abortController.abort();
              throw err;
            },
            onclose() {
              clearTimeout(timeout);
              setIsConnected(false);
            },
          },
        );
      } catch (err: any) {
        clearTimeout(timeout);
        if (err.name !== 'AbortError') {
          console.error('SSE connection failed:', err);
          setError('SSE failed, using polling fallback');
          setIsConnected(false);
        }
      }
    };

    connectSSE();

    return () => {
      clearTimeout(timeout);
      abortController.abort();
    };
  }, [jobId]);

  return { progress, stage, isConnected, error };
};

/**
 * Hook for accepting AI plan and creating project
 */
export const useAcceptPlan = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: AcceptPlanDto }) =>
      acceptAiPlan(jobId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Navigate to new project
      navigate(`/projects/${response.projectId}`);
    },
    onError: (error: any) => {
      console.error('Failed to accept plan:', error);
    },
  });
};

/**
 * Hook for checking AI usage limit
 */
export const useAiUsageLimit = () => {
  return useQuery({
    queryKey: ['ai-usage-limit'],
    queryFn: checkAiUsageLimit,
    staleTime: 60000, // Cache for 1 minute
  });
};

/**
 * Hook for getting user's AI job history
 */
export const useMyAiJobs = (status?: string) => {
  return useQuery({
    queryKey: ['ai-jobs', status],
    queryFn: () => getMyAiJobs(status),
  });
};

/**
 * Hook for cancelling AI job
 */
export const useCancelJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAiJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-jobs'] });
    },
  });
};
