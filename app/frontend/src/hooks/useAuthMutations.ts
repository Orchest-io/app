import { useMutation } from '@tanstack/react-query'
import { loginUser, registerUser, googleAuthUser } from '../api/users.api'

export const useLoginUser = () => {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      loginUser(credentials),
  })
}

export const useRegisterUser = () => {
  return useMutation({
    mutationFn: (dto: { fullName: string; email: string; password: string }) =>
      registerUser(dto),
  })
}

export const useGoogleAuth = () => {
  return useMutation({
    mutationFn: (data: {
      email: string
      fullName: string
      avatarUrl?: string
      authProviderId: string
    }) => googleAuthUser(data),
  })
}
