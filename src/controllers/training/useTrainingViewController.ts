import { useRole } from '@/hooks/useRole'

export type TrainingTab = 'sesiones' | 'partidos' | 'carga'

export function useTrainingViewController() {
  const { role } = useRole()
  const tabs: TrainingTab[] =
    role === 'ENCARGADO_SALUD' ? ['carga'] : ['sesiones', 'partidos', 'carga']

  return { isAthlete: role === 'DEPORTISTA', tabs }
}
