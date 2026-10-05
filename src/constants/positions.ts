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

export const POSITION_HINT =
  'Usa la misma posición en la plantilla y en los perfiles de pesos: el índice de progreso las empareja por nombre exacto.'
