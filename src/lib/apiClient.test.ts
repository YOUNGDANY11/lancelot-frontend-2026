import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApiClient } from '@/lib/apiClient'
import { tokenStorage } from '@/utils/tokenStorage'

type Handler = (url: string, authorization: string | undefined) => { status: number; data: unknown }

function createAdapter(handler: Handler): AxiosAdapter {
  return async (config) => {
    await Promise.resolve()
    const authorization = AxiosHeaders.from(config.headers).get('Authorization')
    const { status, data } = handler(config.url ?? '', authorization?.toString())
    const response: AxiosResponse = { status, data, statusText: '', headers: {}, config }
    if (status >= 400) {
      throw new AxiosError(`Error ${status}`, 'ERR_BAD_REQUEST', config, null, response)
    }
    return response
  }
}

const NEW_TOKENS = { access_token: 'access-nuevo', refresh_token: 'refresh-nuevo' }

describe('apiClient', () => {
  beforeEach(() => {
    tokenStorage.setTokens({ access_token: 'access-viejo', refresh_token: 'refresh-viejo' })
  })

  it('renueva la sesión una sola vez para varias peticiones simultáneas y las reintenta', async () => {
    const refreshCalls: unknown[] = []
    const client = createApiClient({
      baseURL: 'http://api.test',
      adapter: createAdapter((url, authorization) => {
        if (url === '/auth/refresh') {
          refreshCalls.push(url)
          return { status: 200, data: { status: 'Success', mensaje: 'ok', token: NEW_TOKENS } }
        }
        if (authorization === 'Bearer access-nuevo') return { status: 200, data: { url } }
        return { status: 401, data: { status: 'Error', mensaje: 'No esta autorizado' } }
      }),
    })

    const [first, second, third] = await Promise.all([
      client.http.get('/seasons'),
      client.http.get('/categories'),
      client.http.get('/users/me'),
    ])

    expect(refreshCalls).toHaveLength(1)
    expect([first.data.url, second.data.url, third.data.url]).toEqual([
      '/seasons',
      '/categories',
      '/users/me',
    ])
    expect(tokenStorage.getRefreshToken()).toBe('refresh-nuevo')
    expect(tokenStorage.getAccessToken()).toBe('access-nuevo')
  })

  it('cierra la sesión una sola vez si la renovación es rechazada', async () => {
    const onExpired = vi.fn()
    const client = createApiClient({
      baseURL: 'http://api.test',
      adapter: createAdapter((url) =>
        url === '/auth/refresh'
          ? { status: 401, data: { status: 'Error', mensaje: 'Refresh token invalido' } }
          : { status: 401, data: { status: 'Error', mensaje: 'No esta autorizado' } },
      ),
    })
    client.onSessionExpired(onExpired)

    const results = await Promise.allSettled([
      client.http.get('/seasons'),
      client.http.get('/categories'),
    ])

    expect(results.every((result) => result.status === 'rejected')).toBe(true)
    const [firstResult] = results
    if (firstResult.status === 'rejected') {
      expect((firstResult.reason as AxiosError).config?.url).toBe('/seasons')
    }
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(tokenStorage.getRefreshToken()).toBeNull()
  })

  it('no intenta renovar cuando falla el inicio de sesión', async () => {
    const refreshCalls: string[] = []
    const client = createApiClient({
      baseURL: 'http://api.test',
      adapter: createAdapter((url) => {
        if (url === '/auth/refresh') refreshCalls.push(url)
        return { status: 401, data: { status: 'Error', mensaje: 'Contraseña incorrecta' } }
      }),
    })

    await expect(
      client.http.post('/auth/login', { email: 'ana@club.com', password: 'x' }),
    ).rejects.toBeInstanceOf(AxiosError)
    expect(refreshCalls).toHaveLength(0)
  })

  it('conserva la sesión si la renovación falla por un problema de red', async () => {
    const onExpired = vi.fn()
    const client = createApiClient({
      baseURL: 'http://api.test',
      adapter: async (config) => {
        if (config.url === '/auth/refresh')
          throw new AxiosError('Network Error', 'ERR_NETWORK', config)
        const response: AxiosResponse = {
          status: 401,
          data: {},
          statusText: '',
          headers: {},
          config,
        }
        throw new AxiosError('401', 'ERR_BAD_REQUEST', config, null, response)
      },
    })
    client.onSessionExpired(onExpired)

    await expect(client.http.get('/seasons')).rejects.toBeInstanceOf(AxiosError)
    expect(onExpired).not.toHaveBeenCalled()
    expect(tokenStorage.getRefreshToken()).toBe('refresh-viejo')
  })
})
