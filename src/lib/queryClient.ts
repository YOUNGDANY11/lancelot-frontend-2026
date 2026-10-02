import { QueryClient } from '@tanstack/react-query'
import { getApiErrorStatus } from '@/utils/parseApiError'

const MAX_RETRIES = 2

export function shouldRetryRequest(failureCount: number, error: unknown): boolean {
  const status = getApiErrorStatus(error)
  if (status !== undefined && status >= 400 && status < 500) return false
  return failureCount < MAX_RETRIES
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: shouldRetryRequest,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
