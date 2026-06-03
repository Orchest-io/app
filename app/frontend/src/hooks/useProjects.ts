import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../api/projects.api';

export const useProjects = () => {
  return useQuery({ queryKey: ['projects'], queryFn: getProjects });
};
