import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateProjectDto,
  UpdateProjectDto,
  AddProjectMemberDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
} from '@orchest/shared';
import {
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  createMilestone,
  updateMilestone,
  removeMilestone,
} from '../api/projects.api';

// POST /projects — invalidates ['projects']
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => createProject(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// PATCH /projects/:id — invalidates ['projects'] and ['project', id]
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) =>
      updateProject(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });
};

// DELETE /projects/:id — invalidates ['projects']
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// POST /projects/:id/members — invalidates ['project', id]
export const useAddMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, dto }: { projectId: string; dto: AddProjectMemberDto }) =>
      addMember(projectId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

// DELETE /projects/:id/members/:userId — invalidates ['project', id]
export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      removeMember(projectId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

// POST /projects/:id/milestones — invalidates ['project', id]
export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, dto }: { projectId: string; dto: CreateMilestoneDto }) =>
      createMilestone(projectId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

// PATCH /projects/milestones/:id — invalidates ['project', projectId]
export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      milestoneId,
      dto,
    }: {
      milestoneId: string;
      projectId: string;
      dto: UpdateMilestoneDto;
    }) => updateMilestone(milestoneId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

// DELETE /projects/milestones/:id — invalidates ['project', projectId]
export const useRemoveMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId }: { milestoneId: string; projectId: string }) =>
      removeMilestone(milestoneId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};
