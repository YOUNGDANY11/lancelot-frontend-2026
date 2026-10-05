import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type {
  MatchStatistic,
  MatchStatisticRequest,
  SessionLoad,
  TeamAcwr,
  TrainingLoadRequest,
  TrainingSession,
  TrainingSessionRequest,
} from '@/types/training'
import { withNumbers } from '@/utils/toNumber'

export interface SessionFilters extends QueryParams {
  id_category?: number
  id_season?: number
  page?: number
  limit?: number
}

function normalizeSession(session: TrainingSession): TrainingSession {
  return withNumbers({ ...session, date: String(session.date).slice(0, 10) }, [
    'planned_duration_min',
  ])
}

function normalizeLoad(load: SessionLoad): SessionLoad {
  return withNumbers(load, ['rpe', 'duration_min', 'session_load'])
}

function normalizeStatistic(statistic: MatchStatistic): MatchStatistic {
  return withNumbers(statistic, [
    'minutes_played',
    'goals',
    'assists',
    'yellow_cards',
    'red_cards',
    'rpe',
  ])
}

export const trainingService = {
  listSessions(filters: SessionFilters) {
    return fetchList<TrainingSession>('/training-sessions', 'sessions', filters, normalizeSession)
  },

  listAllSessions(filters: SessionFilters): Promise<TrainingSession[]> {
    return fetchAllPages<TrainingSession>(
      '/training-sessions',
      'sessions',
      filters,
      normalizeSession,
    )
  },

  async createSession(payload: TrainingSessionRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/training-sessions', payload)
    return data
  },

  async updateSession(id: number, payload: Partial<TrainingSessionRequest>): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/training-sessions/id/${id}`, payload)
    return data
  },

  async removeSession(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/training-sessions/id/${id}`)
    return data
  },

  listSessionLoads(idSession: number): Promise<SessionLoad[]> {
    return fetchAllPages<SessionLoad>(
      '/training-loads',
      'loads',
      { id_session: idSession },
      normalizeLoad,
    )
  },

  listUserLoads(idUser: number): Promise<SessionLoad[]> {
    return fetchAllPages<SessionLoad>(
      '/training-loads',
      'loads',
      { id_user: idUser },
      normalizeLoad,
    )
  },

  async createLoad(payload: TrainingLoadRequest): Promise<SessionLoad> {
    const { data } = await apiClient.http.post<{ load: SessionLoad }>('/training-loads', payload)
    return normalizeLoad(data.load)
  },

  async updateLoad(id: number, payload: Partial<TrainingLoadRequest>): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/training-loads/id/${id}`, payload)
    return data
  },

  listMatchStatistics(idMatch: number): Promise<MatchStatistic[]> {
    return fetchAllPages<MatchStatistic>(
      '/match-statistics',
      'stats',
      { id_match: idMatch },
      normalizeStatistic,
    )
  },

  async createMatchStatistic(payload: MatchStatisticRequest): Promise<MatchStatistic> {
    const { data } = await apiClient.http.post<{ stat: MatchStatistic }>(
      '/match-statistics',
      payload,
    )
    return normalizeStatistic(data.stat)
  },

  async updateMatchStatistic(
    id: number,
    payload: Partial<MatchStatisticRequest>,
  ): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/match-statistics/id/${id}`, payload)
    return data
  },

  async categoryAcwr(idCategory: number, date?: string): Promise<TeamAcwr> {
    const { data } = await apiClient.http.get<TeamAcwr>(
      `/load-monitoring/acwr/category/${idCategory}`,
      {
        params: { date },
      },
    )
    return {
      ...data,
      thresholds: withNumbers(data.thresholds, ['low_min', 'low_max', 'medium_max']),
      athletes: data.athletes.map((athlete) =>
        withNumbers(athlete, ['daily_load', 'acute_load', 'chronic_load', 'acwr', 'sessions_7d']),
      ),
    }
  },
}
