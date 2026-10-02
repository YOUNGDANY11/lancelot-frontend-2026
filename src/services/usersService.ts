import { apiClient } from '@/lib/apiClient'
import type { ApiMessage } from '@/types/api'
import type {
  ChangePasswordRequest,
  UpdateMyProfileRequest,
  User,
  UserResponse,
} from '@/types/user'

export const usersService = {
  async getMe(): Promise<User> {
    const { data } = await apiClient.http.get<UserResponse>('/users/me')
    return data.user
  },

  async updateMe(payload: UpdateMyProfileRequest): Promise<User> {
    const { data } = await apiClient.http.put<UserResponse>('/users/me', payload)
    return data.user
  },

  async changeMyPassword(payload: ChangePasswordRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>('/users/me/password', payload)
    return data
  },
}
