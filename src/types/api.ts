export type ApiStatus = 'Success' | 'Error'

export interface ApiMessage {
  status: ApiStatus
  mensaje: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiBusinessErrorBody {
  status: 'Error'
  mensaje: string
}

export interface ApiValidationErrorBody {
  statusCode: number
  message: string[] | string
  error?: string
}
