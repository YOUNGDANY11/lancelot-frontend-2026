import type { ConfigKind, ConfigValues } from '@/types/config'

export interface ConfigField {
  key: string
  label: string
  help: string
  type: 'decimal' | 'integer' | 'boolean'
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export interface ConfigRule {
  message: string
  check: (values: ConfigValues) => boolean
}

export interface ConfigDefinition {
  kind: ConfigKind
  title: string
  description: string
  endpoint: string
  itemKey: string
  listKey: string
  idKey: string
  fields: ConfigField[]
  rules: ConfigRule[]
}

export const CONFIG_DEFINITIONS: Record<ConfigKind, ConfigDefinition> = {
  acwr: {
    kind: 'acwr',
    title: 'Umbrales de ACWR',
    description:
      'Definen las zonas de la relación aguda:crónica que usan las alertas de fatiga y los gráficos de carga.',
    endpoint: '/acwr-config',
    itemKey: 'threshold',
    listKey: 'thresholds',
    idKey: 'id_threshold',
    fields: [
      {
        key: 'low_min',
        label: 'Límite inferior de la zona segura',
        help: 'Por debajo de este valor el deportista está en destreno, que también es un riesgo.',
        type: 'decimal',
        min: 0,
        step: 0.05,
      },
      {
        key: 'low_max',
        label: 'Límite superior de la zona segura',
        help: 'Entre el límite inferior y este valor la carga es estable (riesgo bajo).',
        type: 'decimal',
        min: 0,
        step: 0.05,
      },
      {
        key: 'medium_max',
        label: 'Límite de la zona de vigilancia',
        help: 'Hasta este valor el riesgo es medio. Por encima hay sobrecarga (riesgo alto).',
        type: 'decimal',
        min: 0,
        step: 0.05,
      },
    ],
    rules: [
      {
        message:
          'Los límites deben ir en orden: inferior, luego superior de la zona segura, luego vigilancia.',
        check: (values) =>
          Number(values.low_min) < Number(values.low_max) &&
          Number(values.low_max) < Number(values.medium_max),
      },
    ],
  },
  risk: {
    kind: 'risk',
    title: 'Reglas de riesgo de lesión',
    description:
      'Las reglas de la fase 1 que generan las evaluaciones de riesgo cada noche a partir de la carga.',
    endpoint: '/injury-risk-rule-config',
    itemKey: 'config',
    listKey: 'configs',
    idKey: 'id_config',
    fields: [
      {
        key: 'sustained_acwr_threshold',
        label: 'ACWR alto sostenido: valor',
        help: 'ACWR a partir del cual un día cuenta como carga alta.',
        type: 'decimal',
        min: 0.01,
        step: 0.05,
      },
      {
        key: 'sustained_acwr_min_days',
        label: 'ACWR alto sostenido: días mínimos',
        help: 'Cuántos días con ACWR alto activan la regla.',
        type: 'integer',
        min: 1,
        suffix: 'días',
      },
      {
        key: 'sustained_acwr_lookback_days',
        label: 'ACWR alto sostenido: ventana',
        help: 'Días hacia atrás en los que se buscan esos días de ACWR alto.',
        type: 'integer',
        min: 1,
        suffix: 'días',
      },
      {
        key: 'sustained_rpe_threshold',
        label: 'RPE alto repetido: valor',
        help: 'RPE (de 0 a 10) desde el cual una sesión cuenta como muy exigente.',
        type: 'integer',
        min: 1,
        max: 10,
      },
      {
        key: 'sustained_rpe_min_sessions',
        label: 'RPE alto repetido: sesiones mínimas',
        help: 'Cuántas sesiones con RPE alto activan la regla.',
        type: 'integer',
        min: 1,
        suffix: 'sesiones',
      },
      {
        key: 'sustained_rpe_lookback_days',
        label: 'RPE alto repetido: ventana',
        help: 'Días hacia atrás en los que se cuentan esas sesiones.',
        type: 'integer',
        min: 1,
        suffix: 'días',
      },
    ],
    rules: [
      {
        message: 'Los días mínimos de ACWR alto no pueden superar los días de la ventana.',
        check: (values) =>
          Number(values.sustained_acwr_min_days) <= Number(values.sustained_acwr_lookback_days),
      },
      {
        message: 'Las sesiones mínimas de RPE alto no pueden superar los días de la ventana.',
        check: (values) =>
          Number(values.sustained_rpe_min_sessions) <= Number(values.sustained_rpe_lookback_days),
      },
    ],
  },
  talent: {
    kind: 'talent',
    title: 'Reglas de detección de talento',
    description:
      'Criterios con los que el sistema sugiere talentos. Siempre llegan como pendientes para que el cuerpo técnico decida.',
    endpoint: '/talent-rule-config',
    itemKey: 'config',
    listKey: 'configs',
    idKey: 'id_config',
    fields: [
      {
        key: 'min_percentile',
        label: 'Percentil mínimo del índice',
        help: 'Obligatorio. Posición mínima del deportista frente a su categoría y temporada.',
        type: 'decimal',
        min: 0,
        max: 100,
        step: 1,
      },
      {
        key: 'min_dimension_score',
        label: 'Piso de cada dimensión',
        help: 'Obligatorio. Las tres dimensiones (física, técnica y participación) deben superarlo.',
        type: 'decimal',
        min: 0,
        max: 100,
        step: 1,
      },
      {
        key: 'min_improvement_delta',
        label: 'Mejora mínima frente a la temporada anterior',
        help: 'Criterio de soporte: puntos de mejora del índice.',
        type: 'decimal',
        min: 0,
        max: 100,
        step: 0.5,
        suffix: 'puntos',
      },
      {
        key: 'min_participation_score',
        label: 'Participación mínima (disponibilidad)',
        help: 'Criterio de soporte. Debe ser al menos el piso de cada dimensión.',
        type: 'decimal',
        min: 0,
        max: 100,
        step: 1,
      },
      {
        key: 'exclude_severe_injury',
        label: 'Una lesión severa quita la disponibilidad',
        help: 'Si está activo, quien tuvo una lesión severa en la temporada no cumple el criterio de disponibilidad.',
        type: 'boolean',
      },
      {
        key: 'min_supporting_criteria',
        label: 'Criterios de soporte exigidos',
        help: 'Cuántos de los 2 criterios de soporte (mejora y disponibilidad) debe cumplir además de los obligatorios.',
        type: 'integer',
        min: 0,
        max: 2,
      },
      {
        key: 'near_max_age_months',
        label: 'Aviso de edad máxima',
        help: 'Meses de anticipación para avisar que el deportista está por cumplir la edad máxima de su categoría.',
        type: 'integer',
        min: 0,
        max: 60,
        suffix: 'meses',
      },
    ],
    rules: [
      {
        message: 'La participación mínima no puede ser menor que el piso de cada dimensión.',
        check: (values) =>
          Number(values.min_participation_score) >= Number(values.min_dimension_score),
      },
    ],
  },
}
