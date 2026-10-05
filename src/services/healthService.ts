import { fetchAllPages } from '@/lib/listRequest'
import type { HealthRecord, Injury } from '@/types/athlete'

function normalizeInjury(injury: Injury): Injury {
  return {
    ...injury,
    injury_date: String(injury.injury_date).slice(0, 10),
    recovery_date: injury.recovery_date ? String(injury.recovery_date).slice(0, 10) : null,
  }
}

export const healthService = {
  listInjuries(idUser: number): Promise<Injury[]> {
    return fetchAllPages<Injury>('/injuries', 'injuries', { id_user: idUser }, normalizeInjury)
  },

  listHealthRecords(idUser: number): Promise<HealthRecord[]> {
    return fetchAllPages<HealthRecord>('/health-records', 'records', { id_user: idUser })
  },
}
