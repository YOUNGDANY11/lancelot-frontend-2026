import type { RoleCode } from '@/constants/roles'

const SPORTS_STAFF: RoleCode[] = ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR']

export const PERMISSIONS = {
  manageSeasons: ['ADMIN', 'DIRECTOR_TECNICO'],
  manageClub: SPORTS_STAFF,
  manageEvaluations: SPORTS_STAFF,
  manageObjectives: SPORTS_STAFF,
  viewSeasonReports: SPORTS_STAFF,
  viewAssignmentHistory: [...SPORTS_STAFF, 'DEPORTISTA'],
  viewInjuries: ['ADMIN', 'ENTRENADOR', 'ENCARGADO_SALUD'],
  viewHealthRecords: ['ADMIN', 'ENCARGADO_SALUD'],
  viewConsents: ['ADMIN', 'ENCARGADO_SALUD'],
  viewHealthAudit: ['ADMIN'],
  runTalentDetection: ['ADMIN', 'DIRECTOR_TECNICO'],
  createAthleteAccounts: ['ADMIN'],
} satisfies Record<string, RoleCode[]>

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: RoleCode | null, permission: Permission): boolean {
  return role !== null && (PERMISSIONS[permission] as RoleCode[]).includes(role)
}
