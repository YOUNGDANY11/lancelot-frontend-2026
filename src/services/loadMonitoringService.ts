import { apiClient } from '@/lib/apiClient'
import { fetchList } from '@/lib/listRequest'
import type { AcwrSeriesPoint, AthleteAcwrSeries, TrainingLoad } from '@/types/athlete'
import { withNumbers } from '@/utils/toNumber'

interface AthleteSeriesResponse {
  thresholds: AthleteAcwrSeries['thresholds']
  series: AcwrSeriesPoint[]
}

export const loadMonitoringService = {
  async athleteSeries(idUser: number, from?: string, to?: string): Promise<AthleteAcwrSeries> {
    const { data } = await apiClient.http.get<AthleteSeriesResponse>(
      `/load-monitoring/acwr/athlete/${idUser}`,
      { params: { from, to } },
    )
    return {
      thresholds: withNumbers(data.thresholds, ['low_min', 'low_max', 'medium_max']),
      series: data.series.map((point) =>
        withNumbers(point, ['daily_load', 'sessions', 'acute_load', 'chronic_load', 'acwr']),
      ),
    }
  },

  listTrainingLoads(idUser: number, page = 1, limit = 10) {
    return fetchList<TrainingLoad>(
      '/training-loads',
      'loads',
      { id_user: idUser, page, limit },
      (load) => withNumbers(load, ['rpe', 'duration_min', 'session_load']),
    )
  },
}
