import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../api/users.api';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
