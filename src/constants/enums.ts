export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface EnumOption<T extends string> {
  value: T
  label: string
  tone: StatusTone
}

function defineEnum<T extends string>(options: EnumOption<T>[]) {
  const labels = Object.fromEntries(
    options.map((option) => [option.value, option.label]),
  ) as Record<T, string>
  const tones = Object.fromEntries(options.map((option) => [option.value, option.tone])) as Record<
    T,
    StatusTone
  >
  return { options, labels, tones, values: options.map((option) => option.value) }
}

export type SeasonStatus = 'planned' | 'active' | 'closed'
export const SEASON_STATUS = defineEnum<SeasonStatus>([
  { value: 'planned', label: 'Planeada', tone: 'info' },
  { value: 'active', label: 'Activa', tone: 'success' },
  { value: 'closed', label: 'Cerrada', tone: 'neutral' },
])

export type TrainingSessionType = 'tecnico' | 'fisico' | 'tactico' | 'mixto'
export const TRAINING_SESSION_TYPE = defineEnum<TrainingSessionType>([
  { value: 'tecnico', label: 'Técnica', tone: 'info' },
  { value: 'fisico', label: 'Física', tone: 'info' },
  { value: 'tactico', label: 'Táctica', tone: 'info' },
  { value: 'mixto', label: 'Mixta', tone: 'info' },
])

export type PhysicalEvaluationStage = 'pre' | 'mid' | 'post'
export const PHYSICAL_EVALUATION_STAGE = defineEnum<PhysicalEvaluationStage>([
  { value: 'pre', label: 'Pre-temporada', tone: 'info' },
  { value: 'mid', label: 'Mitad de temporada', tone: 'info' },
  { value: 'post', label: 'Post-temporada', tone: 'info' },
])

export type Vo2TestMethod = 'course_navette' | 'cooper' | 'otro'
export const VO2_TEST_METHOD = defineEnum<Vo2TestMethod>([
  { value: 'course_navette', label: 'Course Navette', tone: 'neutral' },
  { value: 'cooper', label: 'Test de Cooper', tone: 'neutral' },
  { value: 'otro', label: 'Otro', tone: 'neutral' },
])

export type InjurySeverity = 'leve' | 'moderada' | 'severa'
export const INJURY_SEVERITY = defineEnum<InjurySeverity>([
  { value: 'leve', label: 'Leve', tone: 'success' },
  { value: 'moderada', label: 'Moderada', tone: 'warning' },
  { value: 'severa', label: 'Severa', tone: 'danger' },
])

export type InjuryStatus = 'active' | 'recovering' | 'recovered'
export const INJURY_STATUS = defineEnum<InjuryStatus>([
  { value: 'active', label: 'Activa', tone: 'danger' },
  { value: 'recovering', label: 'En recuperación', tone: 'warning' },
  { value: 'recovered', label: 'Recuperada', tone: 'success' },
])

export type InjuryMechanism = 'contacto' | 'sin_contacto'
export const INJURY_MECHANISM = defineEnum<InjuryMechanism>([
  { value: 'contacto', label: 'Con contacto', tone: 'neutral' },
  { value: 'sin_contacto', label: 'Sin contacto', tone: 'info' },
])

export type RiskLevelValue = 'bajo' | 'medio' | 'alto'
export const RISK_LEVEL = defineEnum<RiskLevelValue>([
  { value: 'bajo', label: 'Bajo', tone: 'success' },
  { value: 'medio', label: 'Medio', tone: 'warning' },
  { value: 'alto', label: 'Alto', tone: 'danger' },
])

export type ReviewStatus = 'open' | 'reviewed' | 'dismissed'
export const REVIEW_STATUS = defineEnum<ReviewStatus>([
  { value: 'open', label: 'Pendiente', tone: 'warning' },
  { value: 'reviewed', label: 'Revisada', tone: 'success' },
  { value: 'dismissed', label: 'Descartada', tone: 'neutral' },
])

export type InjuryRiskRuleCode =
  'acwr_sostenido' | 'rpe_alto_sostenido' | 'recaida' | 'prediccion_ml'
export const INJURY_RISK_RULE = defineEnum<InjuryRiskRuleCode>([
  { value: 'acwr_sostenido', label: 'ACWR alto sostenido', tone: 'warning' },
  { value: 'rpe_alto_sostenido', label: 'RPE alto repetido', tone: 'warning' },
  { value: 'recaida', label: 'Riesgo de recaída', tone: 'warning' },
  { value: 'prediccion_ml', label: 'Predicción del modelo', tone: 'info' },
])

export type RiskAssessmentMethod = 'rules' | 'ml_model'
export const RISK_ASSESSMENT_METHOD = defineEnum<RiskAssessmentMethod>([
  { value: 'rules', label: 'Reglas', tone: 'neutral' },
  { value: 'ml_model', label: 'Modelo de ML', tone: 'info' },
])

export type TalentFlagSource = 'manual' | 'rules' | 'ml'
export const TALENT_FLAG_SOURCE = defineEnum<TalentFlagSource>([
  { value: 'manual', label: 'Manual', tone: 'neutral' },
  { value: 'rules', label: 'Reglas', tone: 'info' },
  { value: 'ml', label: 'Modelo de ML', tone: 'info' },
])

export type DevelopmentObjectiveStatus = 'open' | 'achieved' | 'missed'
export const DEVELOPMENT_OBJECTIVE_STATUS = defineEnum<DevelopmentObjectiveStatus>([
  { value: 'open', label: 'En curso', tone: 'info' },
  { value: 'achieved', label: 'Logrado', tone: 'success' },
  { value: 'missed', label: 'No logrado', tone: 'danger' },
])

export type HealthRecordStatus = 'active' | 'resolved'
export const HEALTH_RECORD_STATUS = defineEnum<HealthRecordStatus>([
  { value: 'active', label: 'Activo', tone: 'warning' },
  { value: 'resolved', label: 'Resuelto', tone: 'success' },
])

export type ParentalConsentStatus = 'pending' | 'granted' | 'revoked'
export const PARENTAL_CONSENT_STATUS = defineEnum<ParentalConsentStatus>([
  { value: 'pending', label: 'Pendiente', tone: 'warning' },
  { value: 'granted', label: 'Otorgado', tone: 'success' },
  { value: 'revoked', label: 'Revocado', tone: 'danger' },
])

export type HealthAccessAction = 'list' | 'read' | 'create' | 'update' | 'delete'
export const HEALTH_ACCESS_ACTION = defineEnum<HealthAccessAction>([
  { value: 'list', label: 'Consultó el listado', tone: 'neutral' },
  { value: 'read', label: 'Abrió un registro', tone: 'info' },
  { value: 'create', label: 'Creó un registro', tone: 'success' },
  { value: 'update', label: 'Editó un registro', tone: 'warning' },
  { value: 'delete', label: 'Eliminó un registro', tone: 'danger' },
])

export type MlEngineMode = 'rules' | 'shadow' | 'ml'
export const ML_ENGINE_MODE = defineEnum<MlEngineMode>([
  { value: 'rules', label: 'Solo reglas', tone: 'neutral' },
  { value: 'shadow', label: 'Modo sombra', tone: 'info' },
  { value: 'ml', label: 'Aprendizaje automático', tone: 'success' },
])
