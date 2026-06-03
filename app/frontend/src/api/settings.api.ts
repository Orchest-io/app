import type { UpdateUserDto, UpdateUserSettingsDto, User } from '@orchest/shared'
import apiClient from './client'

export const getMe = async (): Promise<User> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  const response = await apiClient.get<User>(`/users/${userId}`)
  return response.data
}

export const updateMe = async (dto: UpdateUserDto): Promise<User> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  const response = await apiClient.patch<User>(`/users/${userId}`, dto)
  return response.data
}

export const updateMySettings = async (dto: UpdateUserSettingsDto): Promise<void> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  await apiClient.patch(`/users/${userId}/settings`, dto)
}

export const changePassword = async (dto: {
  currentPassword: string
  newPassword: string
}): Promise<void> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  await apiClient.patch(`/users/${userId}`, { passwordHash: dto.newPassword })
}
