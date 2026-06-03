import type { CreateUserDto, User } from '@orchest/shared'
import apiClient from './client'

export const loginUser = async (credentials: {
  email: string
  password: string
}): Promise<User> => {
  const response = await apiClient.post<User>('/users/login', credentials)
  return response.data
}

export const registerUser = async (dto: CreateUserDto): Promise<User> => {
  const response = await apiClient.post<User>('/users', dto)
  return response.data
}

export const googleAuthUser = async (data: {
  email: string
  fullName: string
  avatarUrl?: string
  authProviderId: string
}): Promise<User> => {
  const response = await apiClient.post<User>('/users/google', data)
  return response.data
}
