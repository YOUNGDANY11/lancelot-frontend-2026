import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { trainingService } from '@/services/trainingService'
import type { SessionLoad, TrainingSession } from '@/types/training'
import { toApiDate, todayApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'
import { parseMinutes } from '@/utils/rpeBatch'

const REPORT_WINDOW_DAYS = 7

export interface MyRpeDraft {
  rpe: number | null
  minutes: string
}

export function useMyRpeController() {
  const { user } = useAuth()
  const { season, category } = useAppContext()
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<Record<number, MyRpeDraft>>({})
  const idUser = user?.id_user
  const idCategory = category?.id_category
  const idSeason = season?.id_season
  const today = todayApiDate()
  const windowStart = toApiDate(subDays(new Date(), REPORT_WINDOW_DAYS - 1))

  const sessionFilters = { id_category: idCategory, id_season: idSeason, scope: 'all' }
  const sessionsQuery = useQuery({
    queryKey: queryKeys.training.sessions(sessionFilters),
    queryFn: () =>
      trainingService.listAllSessions({ id_category: idCategory, id_season: idSeason }),
    enabled: idCategory !== undefined && idSeason !== undefined,
  })
  const loadsQuery = useQuery({
    queryKey: queryKeys.training.myLoads(idUser ?? 0),
    queryFn: () => trainingService.listUserLoads(idUser ?? 0),
    enabled: idUser !== undefined,
  })

  const loadBySession = new Map((loadsQuery.data ?? []).map((load) => [load.id_session, load]))
  const sessions = (sessionsQuery.data ?? [])
    .filter((session) => session.date >= windowStart && session.date <= today)
    .sort((first, second) => second.date.localeCompare(first.date))

  const draftFor = (session: TrainingSession): MyRpeDraft => {
    const load = loadBySession.get(session.id_session)
    return (
      drafts[session.id_session] ?? {
        rpe: load?.rpe ?? null,
        minutes: String(load?.duration_min ?? session.planned_duration_min),
      }
    )
  }

  const mutation = useMutation({
    mutationFn: async ({ session, draft }: { session: TrainingSession; draft: MyRpeDraft }) => {
      const minutes = parseMinutes(draft.minutes)
      if (idUser === undefined || draft.rpe === null || minutes === null) {
        throw new Error('Elige el RPE y escribe los minutos (entre 1 y 300).')
      }
      const payload = {
        id_session: session.id_session,
        id_user: idUser,
        rpe: draft.rpe,
        duration_min: minutes,
      }
      const existing: SessionLoad | undefined = loadBySession.get(session.id_session)
      return existing
        ? trainingService.updateLoad(existing.id_load, payload)
        : trainingService.createLoad(payload)
    },
    onSuccess: async (_data, { session }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.training.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
      ])
      setDrafts((current) => {
        const next = { ...current }
        delete next[session.id_session]
        return next
      })
      toast.success('Tu RPE quedó registrado. ¡Gracias!')
    },
    onError: (error) =>
      toast.error(
        error instanceof Error && !('isAxiosError' in error) ? error.message : parseApiError(error),
      ),
  })

  const failed = sessionsQuery.error ?? loadsQuery.error

  return {
    hasCategory: idCategory !== undefined,
    hasSeason: idSeason !== undefined,
    sessions,
    isLoading:
      idCategory !== undefined &&
      idSeason !== undefined &&
      (sessionsQuery.isPending || loadsQuery.isPending),
    errorMessage: failed ? parseApiError(failed) : undefined,
    retry: () => {
      void sessionsQuery.refetch()
      void loadsQuery.refetch()
    },
    isToday: (session: TrainingSession) => session.date === today,
    isReported: (session: TrainingSession) => loadBySession.has(session.id_session),
    draftFor,
    setDraft: (session: TrainingSession, change: Partial<MyRpeDraft>) =>
      setDrafts((current) => ({
        ...current,
        [session.id_session]: { ...draftFor(session), ...change },
      })),
    submit: (session: TrainingSession) => mutation.mutate({ session, draft: draftFor(session) }),
    savingSessionId: mutation.isPending ? mutation.variables?.session.id_session : undefined,
  }
}
