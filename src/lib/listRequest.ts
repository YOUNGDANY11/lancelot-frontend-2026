import { apiClient } from '@/lib/apiClient'
import type { Pagination } from '@/types/api'
import { getApiErrorStatus } from '@/utils/parseApiError'

export const MAX_PAGE_SIZE = 100

export type QueryParams = Record<string, string | number | boolean | null | undefined>

export interface ListResult<T> {
  items: T[]
  pagination: Pagination
}

function emptyPagination(params: QueryParams): Pagination {
  return {
    total: 0,
    page: Number(params.page ?? 1),
    limit: Number(params.limit ?? 10),
    totalPages: 0,
  }
}

function cleanParams(params: QueryParams): QueryParams {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    ),
  )
}

export async function fetchList<T>(
  url: string,
  itemsKey: string,
  params: QueryParams = {},
  normalize: (item: T) => T = (item) => item,
): Promise<ListResult<T>> {
  const query = cleanParams(params)
  try {
    const { data } = await apiClient.http.get<Record<string, unknown>>(url, { params: query })
    const rawItems = data[itemsKey]
    const items = Array.isArray(rawItems) ? (rawItems as T[]).map(normalize) : []
    const pagination = (data.pagination as Pagination | undefined) ?? {
      ...emptyPagination(query),
      total: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    }
    return { items, pagination }
  } catch (error) {
    if (getApiErrorStatus(error) === 404) return { items: [], pagination: emptyPagination(query) }
    throw error
  }
}

export async function fetchAllPages<T>(
  url: string,
  itemsKey: string,
  params: QueryParams = {},
  normalize?: (item: T) => T,
): Promise<T[]> {
  const first = await fetchList<T>(
    url,
    itemsKey,
    { ...params, page: 1, limit: MAX_PAGE_SIZE },
    normalize,
  )
  const remainingPages = Array.from(
    { length: Math.max(first.pagination.totalPages - 1, 0) },
    (_, index) => index + 2,
  )
  const rest = await Promise.all(
    remainingPages.map((page) =>
      fetchList<T>(url, itemsKey, { ...params, page, limit: MAX_PAGE_SIZE }, normalize),
    ),
  )
  return [first, ...rest].flatMap((result) => result.items)
}

export async function fetchTotal(url: string, params: QueryParams = {}): Promise<number> {
  const result = await fetchList<unknown>(url, '__count__', { ...params, page: 1, limit: 1 })
  return result.pagination.total
}
