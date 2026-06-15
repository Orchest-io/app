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
  await apiClient.post(`/users/${userId}/change-password`, dto)
}

// Delete account
export const deleteAccount = async (password: string): Promise<void> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  await apiClient.post(`/users/${userId}/delete-account`, { password })
}

// Get user sessions
export const getUserSessions = async (): Promise<any[]> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  const response = await apiClient.get(`/users/${userId}/sessions`)
  return response.data
}

// Revoke a session
export const revokeSession = async (sessionId: string): Promise<void> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  await apiClient.delete(`/users/${userId}/sessions/${sessionId}`)
}

// Revoke all other sessions
export const revokeAllOtherSessions = async (currentSessionId: string): Promise<void> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  await apiClient.post(`/users/${userId}/sessions/revoke-all`, { currentSessionId })
}

// Get user activity logs
export const getUserActivityLogs = async (): Promise<any[]> => {
  const userId = localStorage.getItem('orchest_user_id')
  if (!userId) throw new Error('Not authenticated')
  const response = await apiClient.get(`/activity-logs?user_id=${userId}`)
  return response.data
}
