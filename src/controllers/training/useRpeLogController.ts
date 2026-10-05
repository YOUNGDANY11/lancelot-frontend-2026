import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { trainingService } from '@/services/trainingService'
import type { TrainingSession } from '@/types/training'
import { runWithConcurrency } from '@/utils/batchRunner'
import { parseApiError } from '@/utils/parseApiError'
import {
  buildRpeRows,
  MAX_SESSION_MINUTES,
  parseMinutes,
  planRpeOperations,
  summarizeRows,
  type RpeRow,
} from '@/utils/rpeBatch'

const SAVE_CONCURRENCY = 4

export type RowSaveState =
  { state: 'saving' } | { state: 'saved' } | { state: 'error'; message: string }

export function useRpeLogData(session: TrainingSession) {
  const rosterFilters = {
    id_category: session.id_category,
    id_season: session.id_season,
    scope: 'all',
  }
  const rosterQuery = useQuery({
    queryKey: queryKeys.assignments.list(rosterFilters),
    queryFn: () =>
      athleteAssignmentsService.listAll({
        id_category: session.id_category,
        id_season: session.id_season,
      }),
  })
  const loadsQuery = useQuery({
    queryKey: queryKeys.training.sessionLoads(session.id_session),
    queryFn: () => trainingService.listSessionLoads(session.id_session),
  })

  const failed = rosterQuery.isError ? rosterQuery.error : loadsQuery.error
  const isReady = rosterQuery.isSuccess && loadsQuery.isSuccess

  return {
    isLoading: rosterQuery.isPending || loadsQuery.isPending,
    errorMessage: failed ? parseApiError(failed) : undefined,
    retry: () => {
      void rosterQuery.refetch()
      void loadsQuery.refetch()
    },
    initialRows: isReady
      ? buildRpeRows(rosterQuery.data, loadsQuery.data, session.planned_duration_min)
      : null,
  }
}

export function useRpeLogForm(session: TrainingSession, initialRows: RpeRow[]) {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState(initialRows)
  const [rowStates, setRowStates] = useState<Record<number, RowSaveState>>({})
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const updateRow = (idUser: number, change: Partial<RpeRow>) => {
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
    const { operations, invalidUsers } = planRpeOperations(rows)
    const invalidStates = Object.fromEntries(
      invalidUsers.map((idUser) => [
        idUser,
        { state: 'error', message: `Minutos entre 1 y ${MAX_SESSION_MINUTES}.` } as RowSaveState,
      ]),
    )
    if (operations.length === 0) {
      setRowStates((current) => ({ ...current, ...invalidStates }))
      if (invalidUsers.length === 0) toast.info('No hay cambios por guardar.')
      return
    }

    setRowStates({
      ...invalidStates,
      ...Object.fromEntries(
        operations.map((operation) => [operation.id_user, { state: 'saving' }]),
      ),
    })
    setProgress({ done: 0, total: operations.length })

    const outcomes = await runWithConcurrency(
      operations.map((operation) => async () => {
        const payload = {
          id_session: session.id_session,
          id_user: operation.id_user,
          rpe: operation.rpe,
          duration_min: operation.duration_min,
        }
        if (operation.kind === 'update' && operation.loadId !== null) {
          await trainingService.updateLoad(operation.loadId, payload)
          return operation.loadId
        }
        const created = await trainingService.createLoad(payload)
        return created.id_load
      }),
      SAVE_CONCURRENCY,
      (index, outcome) => {
        const operation = operations[index]
        setProgress((current) => (current ? { ...current, done: current.done + 1 } : current))
        setRowStates((current) => ({
          ...current,
          [operation.id_user]: outcome.ok
            ? { state: 'saved' }
            : { state: 'error', message: parseApiError(outcome.error) },
        }))
        if (outcome.ok) {
          setRows((current) =>
            current.map((row) =>
              row.id_user === operation.id_user
                ? {
                    ...row,
                    loadId: outcome.value,
                    savedRpe: operation.rpe,
                    savedMinutes: operation.duration_min,
                  }
                : row,
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
        savedCount === 1
          ? 'Guardamos 1 registro de RPE.'
          : `Guardamos ${savedCount} registros de RPE.`,
      )
    } else {
      toast.error(
        `Guardamos ${savedCount} y fallaron ${failedCount}. Revisa las filas marcadas y vuelve a guardar.`,
      )
    }
  }

  return {
    rows,
    rowStates,
    progress,
    isSaving: progress !== null,
    summary: summarizeRows(rows),
    setRpe: (idUser: number, rpe: number) => updateRow(idUser, { rpe, absent: false }),
    setMinutes: (idUser: number, minutes: string) => updateRow(idUser, { minutes }),
    toggleAbsent: (idUser: number) =>
      setRows((current) =>
        current.map((row) => (row.id_user === idUser ? { ...row, absent: !row.absent } : row)),
      ),
    applyPlannedMinutes: () =>
      setRows((current) =>
        current.map((row) =>
          row.loadId === null ? { ...row, minutes: String(session.planned_duration_min) } : row,
        ),
      ),
    parsedMinutes: (row: RpeRow) => parseMinutes(row.minutes),
    save,
  }
}
