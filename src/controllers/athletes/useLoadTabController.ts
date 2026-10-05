import { useQuery } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { useState } from 'react'
import { queryKeys } from '@/lib/queryKeys'
import { loadMonitoringService } from '@/services/loadMonitoringService'
import { toApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

export const LOAD_RANGES = [
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 180, label: '6 meses' },
] as const

const HEATMAP_DAYS = 56
const LOADS_PAGE_SIZE = 10

export function useLoadTabController(idUser: number) {
  const [rangeDays, setRangeDays] = useState<number>(90)
  const [loadsPage, setLoadsPage] = useState(1)
  const today = new Date()
  const to = toApiDate(today)
  const fetchDays = Math.max(rangeDays, HEATMAP_DAYS)
  const from = toApiDate(subDays(today, fetchDays - 1))
  const rangeStart = toApiDate(subDays(today, rangeDays - 1))

  const seriesQuery = useQuery({
    queryKey: queryKeys.athlete.acwr(idUser, `${from}_${to}`),
    queryFn: () => loadMonitoringService.athleteSeries(idUser, from, to),
  })
  const loadsQuery = useQuery({
    queryKey: queryKeys.athlete.loads(idUser, loadsPage),
    queryFn: () => loadMonitoringService.listTrainingLoads(idUser, loadsPage, LOADS_PAGE_SIZE),
  })

  const series = seriesQuery.data?.series ?? []

  return {
    rangeDays,
    setRangeDays,
    isLoadingSeries: seriesQuery.isPending,
    seriesError: seriesQuery.isError ? parseApiError(seriesQuery.error) : undefined,
    retrySeries: () => void seriesQuery.refetch(),
    thresholds: seriesQuery.data?.thresholds,
    rangeSeries: series.filter((point) => point.date >= rangeStart),
    heatmapSeries: series,
    loads: loadsQuery.data?.items ?? [],
    loadsPagination: loadsQuery.data?.pagination,
    setLoadsPage,
    isLoadingLoads: loadsQuery.isPending,
    loadsError: loadsQuery.isError ? parseApiError(loadsQuery.error) : undefined,
    retryLoads: () => void loadsQuery.refetch(),
  }
}
