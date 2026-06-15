import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateUserDto, UpdateUserSettingsDto } from '@orchest/shared'
import { getMe, updateMe, updateMySettings, changePassword, deleteAccount, getUserSessions, revokeSession, revokeAllOtherSessions, getUserActivityLogs } from '../api/settings.api'

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: 1,
  })
}

export const useUpdateMe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateUserDto) => updateMe(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export const useUpdateMySettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateUserSettingsDto) => updateMySettings(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (dto: { currentPassword: string; newPassword: string }) =>
      changePassword(dto),
  })
}

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: (password: string) => deleteAccount(password),
  })
}

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: getUserSessions,
    staleTime: 1000 * 30, // 30 seconds
  })
}

export const useRevokeSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (currentSessionId: string) => revokeAllOtherSessions(currentSessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export const useActivityLogs = () => {
  return useQuery({
    queryKey: ['activity-logs'],
    queryFn: getUserActivityLogs,
    staleTime: 1000 * 60, // 1 minute
  })
}
