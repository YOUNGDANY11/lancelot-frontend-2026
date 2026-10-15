import type { Sport } from '@/constants/enums'

export interface SportRules {
  label: string
  matchMinutes: number
  maxMatchMinutes: number
  positions: string[]
}

export const SPORT_RULES: Record<Sport, SportRules> = {
  futbol: {
    label: 'Fútbol',
    matchMinutes: 90,
    maxMatchMinutes: 130,
    positions: [
      'Portero',
      'Defensa central',
      'Lateral',
      'Mediocampista defensivo',
      'Mediocampista',
      'Mediocampista ofensivo',
      'Extremo',
      'Delantero',
    ],
  },
  futbol_sala: {
    label: 'Fútbol sala',
    matchMinutes: 40,
    maxMatchMinutes: 50,
    positions: ['Portero de fútbol sala', 'Cierre', 'Ala', 'Pívot', 'Universal'],
  },
}

export const DEFAULT_SPORT: Sport = 'futbol'

export function sportOf(category: { sport?: Sport } | null | undefined): Sport {
  return category?.sport ?? DEFAULT_SPORT
}

export const ALL_POSITIONS = Object.values(SPORT_RULES).flatMap((rules) => rules.positions)

export function positionGroupsFor(sport?: Sport | null) {
  const sports = sport ? [sport] : (Object.keys(SPORT_RULES) as Sport[])
  return sports.map((key) => ({
    label: SPORT_RULES[key].label,
    options: SPORT_RULES[key].positions.map((position) => ({ value: position, label: position })),
  }))
}

export function positionFitsSport(position: string, sport: Sport): boolean {
  return SPORT_RULES[sport].positions.includes(position)
}

export const POSITION_HINT =
  'Las posiciones dependen del deporte de la categoría. Usa la misma posición en la plantilla y en los perfiles de pesos: el índice de progreso las empareja por nombre exacto.'
