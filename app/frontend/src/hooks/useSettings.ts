import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateUserDto, UpdateUserSettingsDto } from '@orchest/shared'
import { getMe, updateMe, updateMySettings, changePassword } from '../api/settings.api'

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
