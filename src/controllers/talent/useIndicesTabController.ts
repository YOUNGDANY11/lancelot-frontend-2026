import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { talentService } from '@/services/talentService'
import type { RecalculationSummary } from '@/types/talent'
import { parseApiError } from '@/utils/parseApiError'
import {
  athletesWithoutIndex,
  baseAssignmentByUser,
  buildRanking,
  type RankingEntry,
} from '@/utils/talentRanking'
import { fullName } from '@/utils/text'

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

  const indicesQuery = useQuery({
    queryKey: queryKeys.talent.indices(idSeason ?? 0),
    queryFn: () => talentService.listIndices(idSeason ?? 0),
    enabled: idSeason !== undefined,
  })
  const assignmentsFilters = { id_season: idSeason, scope: 'all' }
  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list(assignmentsFilters),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: idSeason !== undefined,
  })

  const maxAgeById = new Map(
    categories.flatMap((item) =>
      item.max_age !== undefined ? [[item.id_category, item.max_age] as const] : [],
    ),
  )
  const baseByUser = baseAssignmentByUser(assignmentsQuery.data ?? [], maxAgeById)
  const indices = indicesQuery.data ?? []
  const ranking = buildRanking(indices, baseByUser, idCategory)
  const missing = athletesWithoutIndex(baseByUser, indices, idCategory)
  const selected =
    ranking.find((entry) => entry.index.id_user === selectedUser) ?? ranking[0] ?? null
  const nameOf = (idUser: number) => {
    const assignment = baseByUser.get(idUser)
    return assignment ? fullName(assignment) : `Deportista ${idUser}`
  }

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
    mutationFn: (entry: { id_user: number; name: string }) =>
      talentService.recalculateAthlete(entry.id_user, idSeason ?? 0),
    onSuccess: async (_data, entry) => {
      await refresh()
      toast.success(`Índice de ${entry.name} recalculado.`)
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
    missing,
    selected,
    selectEntry: (entry: RankingEntry) => setSelectedUser(entry.index.id_user),
    isLoading: idSeason !== undefined && (indicesQuery.isPending || assignmentsQuery.isPending),
    errorMessage: indicesQuery.isError
      ? parseApiError(indicesQuery.error)
      : assignmentsQuery.isError
        ? parseApiError(assignmentsQuery.error)
        : undefined,
    retry: () => {
      void indicesQuery.refetch()
      void assignmentsQuery.refetch()
    },
    canRecalculateSeason: can('runTalentDetection'),
    confirmingSeason,
    askRecalculateSeason: () => setConfirmingSeason(true),
    cancelRecalculateSeason: () => setConfirmingSeason(false),
    recalculateSeason: () => seasonMutation.mutate(),
    isRecalculatingSeason: seasonMutation.isPending,
    summary,
    closeSummary: () => setSummary(null),
    nameOf,
    recalculateAthlete: (idUser: number) =>
      athleteMutation.mutate({ id_user: idUser, name: nameOf(idUser) }),
    recalculatingUser: athleteMutation.isPending ? athleteMutation.variables?.id_user : undefined,
  }
}
