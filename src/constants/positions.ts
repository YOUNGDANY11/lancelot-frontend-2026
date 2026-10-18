export interface PositionGroup {
  label: string
  positions: string[]
}

export const POSITION_GROUPS: PositionGroup[] = [
  {
    label: 'Fútbol',
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
  {
    label: 'Fútbol sala',
    positions: ['Portero de fútbol sala', 'Cierre', 'Ala', 'Pívot', 'Universal'],
  },
]

export const ALL_POSITIONS = POSITION_GROUPS.flatMap((group) => group.positions)

export const GOALKEEPER_POSITIONS = ['Portero', 'Portero de fútbol sala']

function normalizePosition(position: string): string {
  return position
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()
}

const NORMALIZED_GOALKEEPERS = new Set(GOALKEEPER_POSITIONS.map(normalizePosition))

export function isGoalkeeperPosition(position: string | null | undefined): boolean {
  return Boolean(position) && NORMALIZED_GOALKEEPERS.has(normalizePosition(position ?? ''))
}

export const POSITION_HINT =
  'Usa la misma posición en la plantilla y en los perfiles de pesos: el índice de progreso las empareja por nombre exacto.'
