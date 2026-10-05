export interface GlossaryEntry {
  term: string
  definition: string
  source?: string
}

export const GLOSSARY = {
  trainingLoad: {
    term: 'Carga de entrenamiento',
    definition:
      'Mide el esfuerzo interno de una sesión: RPE × minutos. Se expresa en unidades arbitrarias (UA). Por ejemplo, RPE 7 durante 75 minutos son 525 UA.',
    source: 'Foster et al. (2001)',
  },
  rpe: {
    term: 'RPE (esfuerzo percibido)',
    definition:
      'Qué tan dura sintió el deportista la sesión, en una escala de 0 (reposo) a 10 (máximo). Se recomienda preguntarlo unos 30 minutos después de terminar.',
    source: 'Escala CR-10, Foster et al. (2001)',
  },
  acuteLoad: {
    term: 'Carga aguda',
    definition: 'Promedio diario de la carga de los últimos 7 días. Refleja la fatiga reciente.',
  },
  chronicLoad: {
    term: 'Carga crónica',
    definition:
      'Promedio diario de la carga de los últimos 28 días. Refleja la preparación acumulada.',
  },
  acwr: {
    term: 'ACWR (relación aguda:crónica)',
    definition:
      'Divide la carga aguda (7 días) entre la crónica (28 días). Cerca de 1 indica una carga estable; valores altos indican un aumento brusco que eleva el riesgo de lesión. Los umbrales se configuran por categoría.',
  },
  progressIndex: {
    term: 'Índice de progreso ponderado',
    definition:
      'Combina tres dimensiones (física, técnica y de participación) con pesos que dependen de la posición y la categoría del deportista.',
    source: 'Vaeyens et al. (2008)',
  },
  percentile: {
    term: 'Percentil',
    definition:
      'Posición del deportista frente a su grupo (misma categoría y temporada). Percentil 80 significa que supera al 80 % del grupo.',
  },
  talentDetection: {
    term: 'Detección de talento',
    definition:
      'Reglas que señalan a deportistas con un percentil alto y sin dimensiones débiles. Es una sugerencia: el cuerpo técnico revisa cada señalización y decide.',
    source: 'Vaeyens et al. (2008)',
  },
  readiness: {
    term: 'Readiness (preparación de los datos)',
    definition:
      'Indica si ya hay datos suficientes para entrenar el modelo de aprendizaje automático: días con datos etiquetados, lesiones sin contacto y número de deportistas. Mientras no se cumpla, el sistema usa solo reglas.',
    source: 'Rossi et al. (2018); Van Eetvelde et al. (2021)',
  },
  shadowMode: {
    term: 'Modo sombra',
    definition:
      'El modelo calcula sus predicciones en segundo plano sin generar alertas visibles. Sirve para compararlo con las reglas antes de confiar en él.',
  },
  contactInjury: {
    term: 'Lesión con contacto',
    definition:
      'Lesión causada por un choque o golpe con otra persona u objeto. No depende de la carga, por eso no se usa para el modelo de riesgo.',
  },
  nonContactInjury: {
    term: 'Lesión sin contacto',
    definition:
      'Lesión que ocurre sin choque, por ejemplo un desgarro al acelerar. Solo estas lesiones alimentan el modelo de riesgo, porque se relacionan con la carga.',
    source: 'Rossi et al. (2018)',
  },
  multiAgeCategory: {
    term: 'Categoría multi-etaria',
    definition:
      'Categoría que agrupa deportistas de varias edades, definida por una edad mínima y una máxima (por ejemplo, Sub-15 de 13 a 15 años).',
  },
  weightProfile: {
    term: 'Perfil de pesos',
    definition:
      'Define cuánto pesa cada dimensión (física, técnica y de participación) en el índice de progreso para una posición y categoría. Los tres pesos suman 100 %.',
  },
} satisfies Record<string, GlossaryEntry>

export type GlossaryKey = keyof typeof GLOSSARY
