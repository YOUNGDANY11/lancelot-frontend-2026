import { apiClient } from '@/lib/apiClient'
import { fetchAllPages } from '@/lib/listRequest'
import type { Category, CreateCategoryRequest } from '@/types/club'
import { toNumberOr } from '@/utils/toNumber'

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    min_age: toNumberOr(category.min_age, 0),
    max_age: toNumberOr(category.max_age, 0),
  }
}

export const categoriesService = {
  listAll(): Promise<Category[]> {
    return fetchAllPages<Category>('/categories', 'category', {}, normalizeCategory)
  },

  async create(payload: CreateCategoryRequest): Promise<Category> {
    const { data } = await apiClient.http.post<{ category: Category }>('/categories', payload)
    return normalizeCategory(data.category)
  },
}
