import { apiClient } from '@/lib/apiClient'
import type { ApiMessage } from '@/types/api'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth'
import type { UserResponse } from '@/types/user'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.http.post<LoginResponse>('/auth/login', credentials)
    return data
  },

  async register(payload: RegisterRequest): Promise<UserResponse> {
    const { data } = await apiClient.http.post<UserResponse>('/auth/register', payload)
    return data
  },

  refreshSession(): Promise<string> {
    return apiClient.refreshSession()
  },

  async logout(refreshToken: string): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/auth/logout', {
      refresh_token: refreshToken,
    })
    return data
  },

  async logoutAll(): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/auth/logout-all')
    return data
  },
}
