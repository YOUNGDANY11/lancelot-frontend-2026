import axios, {
  isAxiosError,
  type AxiosAdapter,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/lib/env'
import type { LoginResponse } from '@/types/auth'
import { tokenStorage } from '@/utils/tokenStorage'

const ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']
const REFRESH_LOCK_NAME = 'lancelot-refresh-token'
const REQUEST_TIMEOUT_MS = 20_000

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  sessionRetried?: boolean
}

type SessionExpiredListener = () => void

export class MissingRefreshTokenError extends Error {
  constructor() {
    super('No hay una sesión guardada para renovar')
    this.name = 'MissingRefreshTokenError'
  }
}

export interface ApiClientOptions {
  baseURL: string
  adapter?: AxiosAdapter
}

export interface ApiClient {
  http: AxiosInstance
  refreshSession: () => Promise<string>
  onSessionExpired: (listener: SessionExpiredListener) => () => void
}

function isEndpointWithoutRefresh(url: string | undefined): boolean {
  return ENDPOINTS_WITHOUT_REFRESH.some((endpoint) => url?.endsWith(endpoint))
}

function isRejectedRefresh(error: unknown): boolean {
  if (error instanceof MissingRefreshTokenError) return true
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  return status === 400 || status === 401 || status === 403
}

function withCrossTabLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks
  if (!locks) return task()
  return locks.request(REFRESH_LOCK_NAME, task)
}

export function createApiClient({ baseURL, adapter }: ApiClientOptions): ApiClient {
  const baseConfig = {
    baseURL,
    adapter,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  }
  const http = axios.create(baseConfig)
  const refreshHttp = axios.create(baseConfig)
  const listeners = new Set<SessionExpiredListener>()
  let inFlightRefresh: Promise<string> | null = null

  const expireSession = () => {
    tokenStorage.clear()
    listeners.forEach((listener) => listener())
  }

  const requestNewTokens = () =>
    withCrossTabLock(async () => {
      const refreshToken = tokenStorage.getRefreshToken()
      if (!refreshToken) throw new MissingRefreshTokenError()
      const { data } = await refreshHttp.post<LoginResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      })
      tokenStorage.setTokens(data.token)
      return data.token.access_token
    })

  const refreshSession = () => {
    if (!inFlightRefresh) {
      inFlightRefresh = requestNewTokens()
        .catch((error: unknown) => {
          if (isRejectedRefresh(error)) expireSession()
          throw error
        })
        .finally(() => {
          inFlightRefresh = null
        })
    }
    return inFlightRefresh
  }

  http.interceptors.request.use((config) => {
    const accessToken = tokenStorage.getAccessToken()
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    return config
  })

  http.interceptors.response.use(undefined, async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401) throw error
    const config = error.config as RetriableRequestConfig | undefined
    if (!config || config.sessionRetried || isEndpointWithoutRefresh(config.url)) throw error
    if (!tokenStorage.getRefreshToken()) throw error

    config.sessionRetried = true
    let accessToken: string
    try {
      accessToken = await refreshSession()
    } catch {
      throw error
    }
    config.headers.Authorization = `Bearer ${accessToken}`
    return http(config)
  })

  return {
    http,
    refreshSession,
    onSessionExpired(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const apiClient = createApiClient({ baseURL: env.apiUrl })
