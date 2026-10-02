export const DEFAULT_API_URL = 'http://localhost:3000/api'

export function resolveApiUrl(rawUrl: string | undefined): string {
  const trimmed = rawUrl?.trim()
  if (!trimmed) return DEFAULT_API_URL
  return trimmed.replace(/\/+$/, '')
}

export const env = {
  apiUrl: resolveApiUrl(import.meta.env.VITE_API_URL),
} as const
