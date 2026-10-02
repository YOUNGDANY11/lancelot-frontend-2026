import type { ApiMessage } from '@/types/api'

export interface User {
  id_user: number
  id_role: number
  name: string
  lastname: string
  email: string
  birth_date: string | null
  role_name: string
  id_ath_cat?: number[]
}

export interface UserResponse extends ApiMessage {
  user: User
}

export interface UpdateMyProfileRequest {
  name?: string
  lastname?: string
  email?: string
  birth_date?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}
