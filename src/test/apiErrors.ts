import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'

export function createApiError(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() }
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse
  return new AxiosError(`Error ${status}`, 'ERR_BAD_REQUEST', config, null, response)
}
