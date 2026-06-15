import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjectAttachments,
  getTaskAttachments,
  uploadProjectAttachment,
  uploadTaskAttachment,
  deleteAttachment,
  uploadUserAvatar,
} from '../api/attachments.api';

// ─── Project Attachments ───────────────────────────────────────────────────

export function useProjectAttachments(projectId: string | undefined) {
  return useQuery({
    queryKey: ['attachments', 'project', projectId],
    queryFn: () => getProjectAttachments(projectId!),
    enabled: !!projectId,
  });
}

export function useUploadProjectAttachment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadProjectAttachment(projectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'project', projectId] });
    },
  });
}

// ─── Task Attachments ──────────────────────────────────────────────────────

export function useTaskAttachments(taskId: string | undefined) {
  return useQuery({
    queryKey: ['attachments', 'task', taskId],
    queryFn: () => getTaskAttachments(taskId!),
    enabled: !!taskId,
  });
}

export function useUploadTaskAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadTaskAttachment(taskId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'task', taskId] });
    },
  });
}

// ─── Delete Attachment ─────────────────────────────────────────────────────

export function useDeleteAttachment(context: { projectId?: string; taskId?: string }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      if (context.projectId) {
        queryClient.invalidateQueries({ queryKey: ['attachments', 'project', context.projectId] });
      }
      if (context.taskId) {
        queryClient.invalidateQueries({ queryKey: ['attachments', 'task', context.taskId] });
      }
    },
  });
}

// ─── Avatar Upload ─────────────────────────────────────────────────────────

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadUserAvatar(file),
    onSuccess: () => {
      // Invalidate the current user cache so avatar updates everywhere
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
