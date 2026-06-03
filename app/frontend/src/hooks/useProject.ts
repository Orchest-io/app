import { useQuery } from '@tanstack/react-query';
import { getProject } from '../api/projects.api';

export const useProject = (id: string | undefined) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });
};
