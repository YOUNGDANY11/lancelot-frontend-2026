export type ReportStage = 'iniciacion' | 'formacion' | 'rendimiento'

export interface ReportStageConfig {
  value: ReportStage
  label: string
  ages: string
  intro: string
  showIndex: boolean
  showPerformanceTests: boolean
  showCompetitionStats: boolean
  showLoadControl: boolean
  physicalNote?: string
}

export const REPORT_STAGES: Record<ReportStage, ReportStageConfig> = {
  iniciacion: {
    value: 'iniciacion',
    label: 'Iniciación',
    ages: 'hasta 10 años',
    intro:
      'Pensado para compartir con el deportista y su familia. A esta edad lo importante es jugar, aprender y disfrutar: el informe muestra su participación, su crecimiento y lo que está aprendiendo, sin puntajes ni comparaciones con sus compañeros.',
    showIndex: false,
    showPerformanceTests: false,
    showCompetitionStats: false,
    showLoadControl: false,
    physicalNote: 'Talla y peso para seguir su crecimiento a lo largo de la temporada.',
  },
  formacion: {
    value: 'formacion',
    label: 'Formación',
    ages: 'de 11 a 14 años',
    intro:
      'En estas edades el crecimiento y la maduración cambian mucho de un deportista a otro. Compara su evolución consigo mismo, temporada a temporada, antes que con sus compañeros.',
    showIndex: true,
    showPerformanceTests: true,
    showCompetitionStats: true,
    showLoadControl: true,
    physicalNote:
      'Un estirón de talla puede bajar por un tiempo la velocidad y la coordinación; tenlo en cuenta al leer las pruebas físicas.',
  },
  rendimiento: {
    value: 'rendimiento',
    label: 'Rendimiento',
    ages: '15 años o más',
    intro:
      'Informe completo: índice ponderado frente a su categoría, contribución en partidos y control de carga.',
    showIndex: true,
    showPerformanceTests: true,
    showCompetitionStats: true,
    showLoadControl: true,
  },
}

export const REPORT_STAGE_ORDER: ReportStage[] = ['iniciacion', 'formacion', 'rendimiento']

export function reportStageForAge(age: number | null | undefined): ReportStage {
  if (age === null || age === undefined) return 'rendimiento'
  if (age <= 10) return 'iniciacion'
  if (age <= 14) return 'formacion'
  return 'rendimiento'
}
