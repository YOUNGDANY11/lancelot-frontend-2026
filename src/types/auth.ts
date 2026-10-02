import type { ApiMessage } from '@/types/api'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse extends ApiMessage {
  token: TokenPair
}

export interface RegisterRequest {
  name: string
  lastname: string
  email: string
  password: string
  birth_date: string
}

export interface AccessTokenPayload {
  id: number
  id_role: number
  email: string
  iat?: number
  exp?: number
}
