import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type {
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  ChangePasswordRequest,
  UpdateMyProfileRequest,
  User,
  UserResponse,
} from '@/types/user'

export interface UserSearchFilters extends QueryParams {
  name?: string
  lastname?: string
  email?: string
  page?: number
  limit?: number
}

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

  listAll(): Promise<User[]> {
    return fetchAllPages<User>('/users', 'users')
  },

  searchAthletes(filters: UserSearchFilters) {
    return fetchList<User>('/users/athletes', 'users', filters)
  },

  listAllAthletes(): Promise<User[]> {
    return fetchAllPages<User>('/users/athletes', 'users')
  },

  async createByAdmin(payload: AdminCreateUserRequest): Promise<User> {
    const { data } = await apiClient.http.post<UserResponse>('/users', payload)
    return data.user
  },

  async updateByAdmin(idUser: number, payload: AdminUpdateUserRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/users/id/${idUser}`, payload)
    return data
  },

  async remove(idUser: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/users/id/${idUser}`)
    return data
  },
}
