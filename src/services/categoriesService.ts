import { apiClient } from '@/lib/apiClient'
import { fetchAllPages } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type { Category, CreateCategoryRequest } from '@/types/club'
import { withNumbers } from '@/utils/toNumber'

function normalizeCategory(category: Category): Category {
  return withNumbers(category, ['min_age', 'max_age'])
}

export const categoriesService = {
  listAll(): Promise<Category[]> {
    return fetchAllPages<Category>('/categories', 'category', {}, normalizeCategory)
  },

  async create(payload: CreateCategoryRequest): Promise<Category> {
    const { data } = await apiClient.http.post<{ category: Category }>('/categories', payload)
    return normalizeCategory(data.category)
  },

  async update(idCategory: number, payload: Partial<CreateCategoryRequest>): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/categories/id/${idCategory}`, payload)
    return data
  },

  async remove(idCategory: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/categories/id/${idCategory}`)
    return data
  },
}
