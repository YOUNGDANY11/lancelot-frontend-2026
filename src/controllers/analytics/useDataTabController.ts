import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { LABEL_QUALITY_LABELS } from '@/constants/ml'
import { useDateRange } from '@/hooks/useDateRange'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { mlService, type FeatureFilters } from '@/services/mlService'
import { usersService } from '@/services/usersService'
import type { FailedRow, FeatureLabelQuality } from '@/types/ml'
import { downloadFile } from '@/utils/downloadFile'
import { parseApiError } from '@/utils/parseApiError'
import { fullName } from '@/utils/text'

const PAGE_SIZE = 15
const ALL = 'all'

type Operation = 'backfill' | 'relabel'

export interface OperationSummary {
  title: string
  message: string
  stats: { label: string; value: number }[]
  failures: FailedRow[]
}

export function useDataTabController() {
  const { can } = useRole()
  const queryClient = useQueryClient()
  const range = useDateRange(28)
  const [page, setPage] = useState(1)
  const [quality, setQuality] = useState<FeatureLabelQuality | typeof ALL>(ALL)
  const [confirming, setConfirming] = useState<Operation | null>(null)
  const [summary, setSummary] = useState<OperationSummary | null>(null)

  const filters: FeatureFilters = {
    from: range.from,
    to: range.to,
    page,
    limit: PAGE_SIZE,
    label_quality: quality === ALL ? undefined : quality,
  }
  const featuresQuery = useQuery({
    queryKey: queryKeys.ml.features(filters),
    queryFn: () => mlService.listFeatures(filters),
    enabled: range.isValid,
    placeholderData: keepPreviousData,
  })
  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
  })
  const names = new Map(
    (athletesQuery.data ?? []).map((athlete) => [athlete.id_user, fullName(athlete)]),
  )
  const nameOf = (idUser: number) => names.get(idUser) ?? `Deportista ${idUser}`

  const exportMutation = useMutation({
    mutationFn: () => mlService.exportFeatures({ from: range.from, to: range.to }),
    onSuccess: (blob) => {
      downloadFile(blob, `lancelot_variables_${range.from}_${range.to}.csv`)
      toast.success('Descargamos el CSV seudonimizado.')
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const operationMutation = useMutation({
    mutationFn: async (operation: Operation): Promise<OperationSummary> => {
      const params = { from: range.from, to: range.to }
      if (operation === 'backfill') {
        const result = await mlService.backfill(params)
        return {
          title: 'Reconstrucción de snapshots',
          message: result.mensaje,
          stats: [
            { label: 'Deportistas', value: result.snapshot.athletes },
            { label: 'Snapshots', value: result.snapshot.snapshots },
            { label: 'Positivos', value: result.labels.labeled_positive },
            { label: 'Negativos', value: result.labels.labeled_negative },
            { label: 'Mecanismo desconocido', value: result.labels.unknown_mechanism },
          ],
          failures: [...result.snapshot.failed, ...result.labels.failed],
        }
      }
      const result = await mlService.relabel(params)
      return {
        title: 'Re-etiquetado',
        message: result.mensaje,
        stats: [
          { label: 'Procesados', value: result.labels.processed },
          { label: 'Positivos', value: result.labels.labeled_positive },
          { label: 'Negativos', value: result.labels.labeled_negative },
          { label: 'Mecanismo desconocido', value: result.labels.unknown_mechanism },
        ],
        failures: result.labels.failed,
      }
    },
    onSuccess: async (result) => {
      setConfirming(null)
      setSummary(result)
      await queryClient.invalidateQueries({ queryKey: queryKeys.ml.all })
    },
    onError: (error) => {
      setConfirming(null)
      toast.error(parseApiError(error))
    },
  })

  return {
    range: {
      ...range,
      setFrom: (value: string) => {
        range.setFrom(value)
        setPage(1)
      },
      setTo: (value: string) => {
        range.setTo(value)
        setPage(1)
      },
    },
    rows: featuresQuery.data?.items ?? [],
    pagination: featuresQuery.data?.pagination,
    setPage,
    isLoading: range.isValid && featuresQuery.isPending,
    errorMessage: featuresQuery.isError ? parseApiError(featuresQuery.error) : undefined,
    retry: () => void featuresQuery.refetch(),
    quality,
    setQuality: (value: string) => {
      setQuality(value as FeatureLabelQuality | typeof ALL)
      setPage(1)
    },
    qualityOptions: [
      { value: ALL, label: 'Todas las etiquetas' },
      ...Object.entries(LABEL_QUALITY_LABELS).map(([value, label]) => ({ value, label })),
    ],
    qualityLabel: (value: FeatureLabelQuality) => LABEL_QUALITY_LABELS[value],
    nameOf,
    exportCsv: () => range.isValid && exportMutation.mutate(),
    isExporting: exportMutation.isPending,
    canRunOperations: can('manageMlEngine'),
    confirming,
    askOperation: (operation: Operation) => range.isValid && setConfirming(operation),
    cancelOperation: () => setConfirming(null),
    runOperation: () => confirming && operationMutation.mutate(confirming),
    isRunning: operationMutation.isPending,
    summary,
    closeSummary: () => setSummary(null),
  }
}
