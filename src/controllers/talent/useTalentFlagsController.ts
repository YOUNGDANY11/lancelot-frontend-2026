import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  REVIEW_STATUS,
  TALENT_FLAG_SOURCE,
  type ReviewStatus,
  type TalentFlagSource,
} from '@/constants/enums'
import { APP_MODULES } from '@/constants/navigation'
import { useAppContext } from '@/hooks/useAppContext'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { talentService, type TalentFlagFilters } from '@/services/talentService'
import type { DetectionSummary, TalentFlag } from '@/types/talent'
import { parseApiError } from '@/utils/parseApiError'

const ALL = 'all'

const DECISION_MESSAGES: Record<Exclude<ReviewStatus, 'open'>, string> = {
  reviewed: 'quedó revisada',
  dismissed: 'quedó descartada',
}

export function useTalentFlagsController() {
  const { season } = useAppContext()
  const { can } = useRole()
  const queryClient = useQueryClient()
  const manualSheet = useDisclosure()
  const idSeason = season?.id_season
  const [status, setStatus] = useState<ReviewStatus | typeof ALL>('open')
  const [source, setSource] = useState<TalentFlagSource | typeof ALL>(ALL)
  const [confirmingDetect, setConfirmingDetect] = useState(false)
  const [summary, setSummary] = useState<DetectionSummary | null>(null)

  const filters: TalentFlagFilters = {
    id_season: idSeason,
    status: status === ALL ? undefined : status,
    source: source === ALL ? undefined : source,
  }

  const query = useQuery({
    queryKey: queryKeys.talent.flags(filters),
    queryFn: () => talentService.listFlags(filters),
    enabled: idSeason !== undefined,
  })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.talent.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
    ])

  const reviewMutation = useMutation({
    mutationFn: ({ flag, next }: { flag: TalentFlag; next: Exclude<ReviewStatus, 'open'> }) =>
      talentService.reviewFlag(flag.id_flag, next),
    onSuccess: async (_data, { flag, next }) => {
      await refresh()
      toast.success(
        `La señalización de ${flag.athlete_name || 'el deportista'} ${DECISION_MESSAGES[next]}.`,
      )
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const detectMutation = useMutation({
    mutationFn: () => talentService.detect(idSeason ?? 0),
    onSuccess: async (result) => {
      await refresh()
      setConfirmingDetect(false)
      setSummary(result)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const flags = [...(query.data ?? [])].sort(
    (first, second) => (second.score ?? -1) - (first.score ?? -1),
  )

  return {
    season,
    hasSeason: idSeason !== undefined,
    flags,
    isLoading: idSeason !== undefined && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    status,
    setStatus: (value: string) => setStatus(value as ReviewStatus | typeof ALL),
    statusOptions: [
      { value: ALL, label: 'Todos los estados' },
      ...REVIEW_STATUS.options.map(({ value, label }) => ({ value, label })),
    ],
    source,
    setSource: (value: string) => setSource(value as TalentFlagSource | typeof ALL),
    sourceOptions: [
      { value: ALL, label: 'Cualquier origen' },
      ...TALENT_FLAG_SOURCE.options.map(({ value, label }) => ({ value, label })),
    ],
    decide: (flag: TalentFlag, next: Exclude<ReviewStatus, 'open'>) =>
      reviewMutation.mutate({ flag, next }),
    pendingFlag: reviewMutation.isPending ? reviewMutation.variables?.flag.id_flag : undefined,
    athletePath: (flag: TalentFlag) => `${APP_MODULES.athletes.path}/${flag.id_user}`,
    canDetect: can('runTalentDetection'),
    confirmingDetect,
    askDetect: () => setConfirmingDetect(true),
    cancelDetect: () => setConfirmingDetect(false),
    detect: () => detectMutation.mutate(),
    isDetecting: detectMutation.isPending,
    summary,
    closeSummary: () => setSummary(null),
    nameOf: (idUser: number) =>
      flags.find((flag) => flag.id_user === idUser)?.athlete_name || `Deportista ${idUser}`,
    manualSheet,
  }
}
