import type { CreateUserDto } from '@orchest/shared'
import apiClient from './client'

export interface AuthResponse {
  user: {
    id: string
    email: string
    fullName: string
    avatarUrl?: string
  }
  accessToken: string
  refreshToken: string
}

export const loginUser = async (credentials: {
  email: string
  password: string
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
  // Store tokens
  localStorage.setItem('orchest_token', response.data.accessToken)
  localStorage.setItem('orchest_refresh_token', response.data.refreshToken)
  localStorage.setItem('orchest_user_id', response.data.user.id)
  return response.data
}

export const registerUser = async (dto: {
  fullName: string
  email: string
  password: string
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', dto)
  // Store tokens
  localStorage.setItem('orchest_token', response.data.accessToken)
  localStorage.setItem('orchest_refresh_token', response.data.refreshToken)
  localStorage.setItem('orchest_user_id', response.data.user.id)
  return response.data
}

export const googleAuthUser = async (data: {
  email: string
  fullName: string
  avatarUrl?: string
  authProviderId: string
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/google', data)
  // Store tokens
  localStorage.setItem('orchest_token', response.data.accessToken)
  localStorage.setItem('orchest_refresh_token', response.data.refreshToken)
  localStorage.setItem('orchest_user_id', response.data.user.id)
  return response.data
}
