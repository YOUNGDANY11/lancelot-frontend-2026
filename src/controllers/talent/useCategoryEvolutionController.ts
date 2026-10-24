import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useAppContext } from '@/hooks/useAppContext'
import { usePagination } from '@/hooks/usePagination'
import { queryKeys } from '@/lib/queryKeys'
import { reportsService } from '@/services/reportsService'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function useCategoryEvolutionController() {
  const { category, categories } = useAppContext()
  const [localCategoryId, setLocalCategoryId] = useState<number | null>(null)
  const idCategory = category?.id_category ?? localCategoryId ?? categories[0]?.id_category ?? null

  const evolutionQuery = useQuery({
    queryKey: queryKeys.talent.categoryEvolution(idCategory ?? 0),
    queryFn: () => reportsService.categoryEvolution(idCategory ?? 0),
    enabled: idCategory !== null,
  })
  const { page, setPage } = usePagination(PAGE_SIZE, String(idCategory ?? ''))
  const tableQuery = useQuery({
    queryKey: queryKeys.talent.categoryEvolutionPage(idCategory ?? 0, page),
    queryFn: () =>
      reportsService.categoryEvolutionPage(idCategory ?? 0, { page, limit: PAGE_SIZE }),
    enabled: idCategory !== null,
    placeholderData: keepPreviousData,
  })
  const evolution = evolutionQuery.data ?? []
  const withIndex = evolution.filter((point) => point.index_value !== null)

  return {
    hasCategories: categories.length > 0,
    canChooseCategory: !category,
    categoryValue: idCategory !== null ? String(idCategory) : undefined,
    categoryOptions: categories.map((item) => ({
      value: String(item.id_category),
      label: item.name,
    })),
    onCategoryChange: (value: string) => setLocalCategoryId(Number(value)),
    categoryName: categories.find((item) => item.id_category === idCategory)?.name ?? '',
    evolution: tableQuery.data?.items ?? [],
    pagination: tableQuery.data?.pagination,
    setPage,
    chartPoints: withIndex,
    isLoading: idCategory !== null && (evolutionQuery.isPending || tableQuery.isPending),
    errorMessage: evolutionQuery.isError
      ? parseApiError(evolutionQuery.error)
      : tableQuery.isError
        ? parseApiError(tableQuery.error)
        : undefined,
    retry: () => {
      void evolutionQuery.refetch()
      void tableQuery.refetch()
    },
  }
}
