import type { TokenPair } from '@/types/auth'

export const REFRESH_TOKEN_STORAGE_KEY = 'lancelot-refresh-token'

let accessToken: string | null = null

export const tokenStorage = {
  getAccessToken(): string | null {
    return accessToken
  },

  getRefreshToken(): string | null {
    try {
      return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  },

  setTokens(tokens: TokenPair): void {
    accessToken = tokens.access_token
    try {
      window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh_token)
    } catch {
      return
    }
  },

  clear(): void {
    accessToken = null
    try {
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    } catch {
      return
    }
  },
}
