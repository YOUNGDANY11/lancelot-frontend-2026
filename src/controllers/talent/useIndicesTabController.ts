import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { talentService } from '@/services/talentService'
import type { FailedAthlete, RankingEntry, RecalculationSummary } from '@/types/talent'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function useIndicesTabController() {
  const { season, category, categories } = useAppContext()
  const { can } = useRole()
  const queryClient = useQueryClient()
  const idSeason = season?.id_season
  const [localCategoryId, setLocalCategoryId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [confirmingSeason, setConfirmingSeason] = useState(false)
  const [summary, setSummary] = useState<RecalculationSummary | null>(null)
  const idCategory = category?.id_category ?? localCategoryId
  const { page, setPage } = usePagination(PAGE_SIZE, `${idSeason ?? ''}:${idCategory ?? ''}`)

  const filters = {
    id_season: idSeason ?? 0,
    id_category: idCategory ?? undefined,
    page,
    limit: PAGE_SIZE,
  }
  const rankingQuery = useQuery({
    queryKey: queryKeys.talent.ranking(filters),
    queryFn: () => talentService.ranking(filters),
    enabled: idSeason !== undefined,
    placeholderData: keepPreviousData,
  })

  const ranking = rankingQuery.data?.entries ?? []
  const selected =
    ranking.find((entry) => entry.index.id_user === selectedUser) ?? ranking[0] ?? null

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.talent.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
    ])

  const seasonMutation = useMutation({
    mutationFn: () => talentService.recalculateSeason(idSeason ?? 0),
    onSuccess: async (result) => {
      await refresh()
      setConfirmingSeason(false)
      setSummary(result)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const athleteMutation = useMutation({
    mutationFn: (entry: RankingEntry) =>
      talentService.recalculateAthlete(entry.index.id_user, idSeason ?? 0),
    onSuccess: async (_data, entry) => {
      await refresh()
      toast.success(`Índice de ${entry.athleteName} recalculado.`)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  return {
    season,
    hasSeason: idSeason !== undefined,
    canChooseCategory: !category,
    categoryValue: idCategory !== null ? String(idCategory) : 'all',
    categoryOptions: [
      { value: 'all', label: 'Todas las categorías' },
      ...categories.map((item) => ({ value: String(item.id_category), label: item.name })),
    ],
    onCategoryChange: (value: string) => {
      setLocalCategoryId(value === 'all' ? null : Number(value))
      setSelectedUser(null)
    },
    categoryName: categories.find((item) => item.id_category === idCategory)?.name,
    ranking,
    pagination: rankingQuery.data?.pagination,
    setPage,
    missing: rankingQuery.data?.missing ?? { total: 0, first: null },
    selected,
    selectEntry: (entry: RankingEntry) => setSelectedUser(entry.index.id_user),
    isLoading: idSeason !== undefined && rankingQuery.isPending,
    errorMessage: rankingQuery.isError ? parseApiError(rankingQuery.error) : undefined,
    retry: () => void rankingQuery.refetch(),
    canRecalculateSeason: can('runTalentDetection'),
    confirmingSeason,
    askRecalculateSeason: () => setConfirmingSeason(true),
    cancelRecalculateSeason: () => setConfirmingSeason(false),
    recalculateSeason: () => seasonMutation.mutate(),
    isRecalculatingSeason: seasonMutation.isPending,
    summary,
    closeSummary: () => setSummary(null),
    failureName: (failure: FailedAthlete) =>
      failure.athlete_name || `Deportista ${failure.id_user}`,
    recalculateAthlete: (entry: RankingEntry) => athleteMutation.mutate(entry),
    recalculatingUser: athleteMutation.isPending
      ? athleteMutation.variables?.index.id_user
      : undefined,
  }
}
