import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AppContext, type AppContextValue, type ContextCategory } from '@/context/AppContext'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { categoriesService } from '@/services/categoriesService'
import { seasonsService } from '@/services/seasonsService'
import {
  findActiveSeason,
  readStoredSelection,
  resolveSeason,
  sortSeasons,
  storeSelection,
  type StoredContextSelection,
} from '@/utils/contextSelection'

interface AppContextProviderProps {
  children: ReactNode
}

const CONTEXT_STALE_TIME = 5 * 60_000

export function AppContextProvider({ children }: AppContextProviderProps) {
  const { role } = useRole()
  const isAthlete = role === 'DEPORTISTA'
  const [selection, setSelection] = useState<StoredContextSelection>(readStoredSelection)

  const seasonsQuery = useQuery({
    queryKey: queryKeys.seasons.list(),
    queryFn: seasonsService.listAll,
    staleTime: CONTEXT_STALE_TIME,
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesService.listAll,
    staleTime: CONTEXT_STALE_TIME,
    enabled: role !== null && !isAthlete,
  })

  const myAssignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.mine(),
    queryFn: athleteAssignmentsService.getMine,
    staleTime: CONTEXT_STALE_TIME,
    enabled: isAthlete,
  })

  useEffect(() => {
    storeSelection(selection)
  }, [selection])

  const setSeasonId = useCallback(
    (seasonId: number) => setSelection((current) => ({ ...current, seasonId })),
    [],
  )

  const setCategoryId = useCallback(
    (categoryId: number | null) => setSelection((current) => ({ ...current, categoryId })),
    [],
  )

  const { refetch: refetchSeasons } = seasonsQuery
  const { refetch: refetchCategories } = categoriesQuery
  const retry = useCallback(() => {
    void refetchSeasons()
    void refetchCategories()
  }, [refetchSeasons, refetchCategories])

  const value = useMemo<AppContextValue>(() => {
    const seasons = sortSeasons(seasonsQuery.data ?? [])
    const categories: ContextCategory[] = isAthlete
      ? (myAssignmentsQuery.data ?? []).flatMap((assignment) =>
          assignment.id_category
            ? [{ id_category: assignment.id_category, name: assignment.category_name ?? '' }]
            : [],
        )
      : (categoriesQuery.data ?? []).map(({ id_category, name, max_age }) => ({
          id_category,
          name,
          max_age: Number(max_age),
        }))
    const category = isAthlete
      ? (categories[0] ?? null)
      : (categories.find((item) => item.id_category === selection.categoryId) ?? null)

    return {
      seasons,
      categories,
      season: resolveSeason(seasons, selection.seasonId),
      activeSeason: findActiveSeason(seasons),
      category,
      canChooseCategory: !isAthlete,
      setSeasonId,
      setCategoryId,
      isLoading:
        seasonsQuery.isPending ||
        (!isAthlete && categoriesQuery.isPending) ||
        (isAthlete && myAssignmentsQuery.isPending),
      isError: seasonsQuery.isError || categoriesQuery.isError,
      retry,
    }
  }, [
    seasonsQuery.data,
    seasonsQuery.isPending,
    seasonsQuery.isError,
    categoriesQuery.data,
    categoriesQuery.isPending,
    categoriesQuery.isError,
    myAssignmentsQuery.data,
    myAssignmentsQuery.isPending,
    isAthlete,
    selection,
    setSeasonId,
    setCategoryId,
    retry,
  ])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
