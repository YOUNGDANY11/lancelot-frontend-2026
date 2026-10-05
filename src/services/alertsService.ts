import { fetchTotal } from '@/lib/listRequest'

export interface OpenAlertsCount {
  fatigue: number
  risk: number
  total: number
}

export const alertsService = {
  async countOpen(): Promise<OpenAlertsCount> {
    const [fatigue, risk] = await Promise.all([
      fetchTotal('/fatigue-alerts', { status: 'open' }),
      fetchTotal('/injury-risk-assessments', { status: 'open' }),
    ])
    return { fatigue, risk, total: fatigue + risk }
  },
}
