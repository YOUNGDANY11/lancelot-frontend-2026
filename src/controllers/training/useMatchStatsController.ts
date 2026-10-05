import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { competitionService } from '@/services/competitionService'
import { trainingService } from '@/services/trainingService'
import type { Match } from '@/types/competition'
import type { RowSaveState } from '@/controllers/training/useRpeLogController'
import { runWithConcurrency } from '@/utils/batchRunner'
import {
  buildMatchStatRows,
  isStatRowDirty,
  toMatchStatPayload,
  type MatchStatRow,
} from '@/utils/matchStatsBatch'
import { parseApiError } from '@/utils/parseApiError'
import type { RosterMember } from '@/utils/rpeBatch'

const SAVE_CONCURRENCY = 4

function mergeRoster(primary: RosterMember[], extra: RosterMember[]): RosterMember[] {
  const seen = new Set(primary.map((member) => member.id_user))
  return [...primary, ...extra.filter((member) => !seen.has(member.id_user))]
}

export function useMatchStatsData(match: Match) {
  const { season } = useAppContext()
  const callUpsQuery = useQuery({
    queryKey: queryKeys.callUps.list(match.id_competency),
    queryFn: () => competitionService.listCallUps(match.id_competency),
  })
  const rosterFilters = {
    id_category: match.id_category,
    id_season: season?.id_season,
    scope: 'all',
  }
  const rosterQuery = useQuery({
    queryKey: queryKeys.assignments.list(rosterFilters),
    queryFn: () =>
      athleteAssignmentsService.listAll({
        id_category: match.id_category,
        id_season: season?.id_season,
      }),
    enabled: callUpsQuery.isSuccess && callUpsQuery.data.length === 0,
  })
  const statsQuery = useQuery({
    queryKey: queryKeys.training.matchStats(match.id_match),
    queryFn: () => trainingService.listMatchStatistics(match.id_match),
  })

  const usesCallUps = (callUpsQuery.data ?? []).length > 0
  const base: RosterMember[] = usesCallUps ? (callUpsQuery.data ?? []) : (rosterQuery.data ?? [])
  const fromStats: RosterMember[] = (statsQuery.data ?? []).map((stat) => {
    const [name, ...rest] = (stat.athlete_name ?? `Deportista ${stat.id_user}`).split(' ')
    return { id_user: stat.id_user, name, lastname: rest.join(' ') }
  })
  const rosterReady = usesCallUps || rosterQuery.isSuccess
  const isReady = callUpsQuery.isSuccess && statsQuery.isSuccess && rosterReady
  const failed = callUpsQuery.error ?? rosterQuery.error ?? statsQuery.error

  return {
    usesCallUps,
    isLoading: !isReady && !failed,
    errorMessage: failed ? parseApiError(failed) : undefined,
    retry: () => {
      void callUpsQuery.refetch()
      void rosterQuery.refetch()
      void statsQuery.refetch()
    },
    initialRows: isReady
      ? buildMatchStatRows(mergeRoster(base, fromStats), statsQuery.data ?? [])
      : null,
  }
}

export function useMatchStatsForm(match: Match, initialRows: MatchStatRow[]) {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState(initialRows)
  const [rowStates, setRowStates] = useState<Record<number, RowSaveState>>({})
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const updateRow = (idUser: number, change: Partial<MatchStatRow>) => {
    setRows((current) =>
      current.map((row) => (row.id_user === idUser ? { ...row, ...change } : row)),
    )
    setRowStates((current) => {
      if (!current[idUser]) return current
      const next = { ...current }
      delete next[idUser]
      return next
    })
  }

  const save = async () => {
    const dirtyRows = rows.filter((row) => isStatRowDirty(row, match.id_match))
    const planned = dirtyRows.map((row) => ({ row, ...toMatchStatPayload(row, match.id_match) }))
    const invalid = planned.filter((item) => item.payload === null)
    const valid = planned.filter((item) => item.payload !== null)

    setRowStates(
      Object.fromEntries([
        ...invalid.map((item) => [item.row.id_user, { state: 'error', message: item.error ?? '' }]),
        ...valid.map((item) => [item.row.id_user, { state: 'saving' }]),
      ]),
    )
    if (valid.length === 0) {
      if (invalid.length === 0) toast.info('No hay cambios por guardar.')
      return
    }
    setProgress({ done: 0, total: valid.length })

    const outcomes = await runWithConcurrency(
      valid.map(({ row, payload }) => async () => {
        if (!payload) throw new Error('Datos incompletos')
        if (row.statId !== null) {
          await trainingService.updateMatchStatistic(row.statId, payload)
          return { ...payload, id_match_stat: row.statId }
        }
        return trainingService.createMatchStatistic(payload)
      }),
      SAVE_CONCURRENCY,
      (index, outcome) => {
        const { row } = valid[index]
        setProgress((current) => (current ? { ...current, done: current.done + 1 } : current))
        setRowStates((current) => ({
          ...current,
          [row.id_user]: outcome.ok
            ? { state: 'saved' }
            : { state: 'error', message: parseApiError(outcome.error) },
        }))
        if (outcome.ok) {
          setRows((current) =>
            current.map((item) =>
              item.id_user === row.id_user
                ? {
                    ...item,
                    statId: outcome.value.id_match_stat,
                    saved: { ...outcome.value, rpe: outcome.value.rpe ?? null },
                  }
                : item,
            ),
          )
        }
      },
    )

    setProgress(null)
    const failedCount = outcomes.filter((outcome) => !outcome.ok).length
    const savedCount = outcomes.length - failedCount
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.training.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
    ])
    if (failedCount === 0) {
      toast.success(
        savedCount === 1 ? 'Guardamos 1 estadística.' : `Guardamos ${savedCount} estadísticas.`,
      )
    } else {
      toast.error(`Guardamos ${savedCount} y fallaron ${failedCount}. Revisa las filas marcadas.`)
    }
  }

  return {
    rows,
    rowStates,
    progress,
    isSaving: progress !== null,
    playedCount: rows.filter((row) => row.played).length,
    dirtyCount: rows.filter((row) => isStatRowDirty(row, match.id_match)).length,
    updateRow,
    togglePlayed: (row: MatchStatRow) =>
      updateRow(row.id_user, { played: !row.played, minutes: row.minutes || '90' }),
    save,
  }
}
