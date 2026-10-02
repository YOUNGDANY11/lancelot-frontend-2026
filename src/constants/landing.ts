import {
  Activity,
  BadgeDollarSign,
  BrainCircuit,
  CalendarRange,
  ChartLine,
  ClipboardList,
  Cpu,
  EyeOff,
  FileCheck,
  FolderX,
  HeartPulse,
  LayoutDashboard,
  Lock,
  Shield,
  TrendingUp,
  Unlink,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface LandingNavLink {
  id: string
  label: string
}

export const LANDING_SECTION_IDS = {
  hero: 'inicio',
  problem: 'problema',
  howItWorks: 'como-funciona',
  modules: 'modulos',
  intelligence: 'inteligencia',
  roles: 'roles',
  privacy: 'privacidad',
  partner: 'socio',
  team: 'equipo',
} as const

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { id: LANDING_SECTION_IDS.howItWorks, label: 'Cómo funciona' },
  { id: LANDING_SECTION_IDS.modules, label: 'Módulos' },
  { id: LANDING_SECTION_IDS.intelligence, label: 'Inteligencia' },
  { id: LANDING_SECTION_IDS.privacy, label: 'Privacidad' },
  { id: LANDING_SECTION_IDS.team, label: 'Equipo' },
]

export const AUTH_ACTION_LABELS = {
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  dashboard: 'Ir a mi panel',
  howItWorks: 'Ver cómo funciona',
} as const

export const HERO_CONTENT = {
  eyebrow: 'Fútbol y fútbol sala',
  title: 'El historial completo de cada deportista, de la escuela al primer equipo',
  subtitle:
    'Lancelot reúne evaluaciones, carga de entrenamiento, salud y progreso en un solo lugar, para escuelas de formación y clubes profesionales-amateur de fútbol y fútbol sala.',
  illustrativeLabel: 'Ilustrativo',
}

export interface ProblemCard {
  icon: LucideIcon
  title: string
  description: string
  source?: string
}

export const PROBLEM_CARDS: ProblemCard[] = [
  {
    icon: FolderX,
    title: 'Registros dispersos',
    description:
      'Los datos físicos, técnicos y médicos viven en papel o en plantillas sueltas, sin trazabilidad entre categorías ni temporadas.',
  },
  {
    icon: Unlink,
    title: 'El historial se pierde al ascender',
    description:
      'Cuando un jugador cambia de categoría su historia no lo acompaña, y las convocatorias y los ascensos se deciden de forma subjetiva.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Plataformas fuera de alcance',
    description:
      'Wyscout cuesta entre 250 y 400 USD al año por usuario y Catapult One entre 180 y 215 USD al año por atleta: demasiado para este segmento.',
    source: 'Fuentes: Wyscout (2026); Catapult Sports (2026).',
  },
]

export interface JourneyStep {
  icon: LucideIcon
  stage: string
  title: string
  description: string
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    icon: ClipboardList,
    stage: 'Paso 1',
    title: 'Pre-temporada',
    description:
      'Evaluación física (talla, peso, VO₂ máx. y velocidad), evaluación técnica, historial médico y objetivos de desarrollo.',
  },
  {
    icon: CalendarRange,
    stage: 'Paso 2',
    title: 'Durante la temporada',
    description:
      'Estadísticas por partido, carga de entrenamiento con RPE, lesiones y alertas de fatiga diferenciadas por categoría.',
  },
  {
    icon: ChartLine,
    stage: 'Paso 3',
    title: 'Post-temporada',
    description:
      'Comparativa entre temporadas, informes de evolución, detección de potencial de ascenso y planificación del siguiente ciclo.',
  },
  {
    icon: Cpu,
    stage: 'Paso 4',
    title: 'Motor de análisis',
    description:
      'Paneles longitudinales, índice de progreso ponderado por posición y categoría, y apoyo a la decisión sobre riesgo y talento.',
  },
]

export interface LandingModule {
  icon: LucideIcon
  title: string
  description: string
}

export const LANDING_MODULES: LandingModule[] = [
  {
    icon: LayoutDashboard,
    title: 'Inicio por rol',
    description: 'Cada persona ve primero lo que necesita hacer hoy, sin menús de más.',
  },
  {
    icon: Shield,
    title: 'Club',
    description:
      'Temporadas, categorías, competencias, partidos y plantilla, con cambios de categoría que conservan el historial.',
  },
  {
    icon: Users,
    title: 'Deportistas',
    description:
      'Ficha 360° con evaluaciones físicas y técnicas, carga, salud, objetivos y evolución entre temporadas.',
  },
  {
    icon: Activity,
    title: 'Entrenamiento',
    description:
      'Registro rápido de RPE desde el celular, estadísticas de partido y carga del equipo en un vistazo.',
  },
  {
    icon: HeartPulse,
    title: 'Salud',
    description:
      'Bandeja de alertas para revisar, lesiones con su mecanismo, registros de salud y consentimientos de acudientes.',
  },
  {
    icon: TrendingUp,
    title: 'Talento y progreso',
    description:
      'Índice de progreso por categoría y señalizaciones de talento con sus criterios y advertencias.',
  },
  {
    icon: BrainCircuit,
    title: 'Análisis IA',
    description:
      'Estado del motor, preparación de los datos, calidad de los registros y métricas de validación del sistema.',
  },
]

export const INTELLIGENCE_CONTENT = {
  eyebrow: 'Inteligencia que apoya, no reemplaza',
  title: 'Datos para decidir mejor, con una persona siempre al mando',
  principle: 'El sistema sugiere, el cuerpo técnico decide.',
  principleDetail:
    'Cada alerta, evaluación de riesgo o señalización de talento llega como pendiente. Una persona la revisa y la marca como revisada o descartada. Ningún proceso asciende jugadores ni cambia el estado de una lesión por su cuenta.',
}

export interface IntelligencePillar {
  title: string
  phases: { label: string; description: string }[]
}

export const INTELLIGENCE_PILLARS: IntelligencePillar[] = [
  {
    title: 'Riesgo de lesión en dos fases',
    phases: [
      {
        label: 'Fase 1 · Reglas sobre la carga',
        description:
          'Carga de sesión (RPE × minutos) y relación aguda:crónica (ACWR), con umbrales configurables por categoría etaria.',
      },
      {
        label: 'Fase 2 · Aprendizaje automático',
        description:
          'Se activa solo cuando hay al menos una temporada de datos etiquetados, y antes se valida en modo sombra frente a las reglas.',
      },
    ],
  },
  {
    title: 'Detección de talento multidimensional',
    phases: [
      {
        label: 'Varias dimensiones a la vez',
        description:
          'Exige un percentil alto en su categoría y que ninguna dimensión (física, técnica o de participación) quede por debajo del mínimo.',
      },
      {
        label: 'Con contexto',
        description:
          'Advierte sobre el efecto de edad relativa y la cercanía a la edad máxima de la categoría para sugerir evaluar un ascenso.',
      },
    ],
  },
]

export interface ScientificReference {
  author: string
  year: number
  topic: string
}

export const SCIENTIFIC_REFERENCES: ScientificReference[] = [
  { author: 'Foster et al.', year: 2001, topic: 'Carga de sesión con la escala RPE' },
  { author: 'Vaeyens et al.', year: 2008, topic: 'Identificación multidimensional del talento' },
  {
    author: 'Rossi et al.',
    year: 2018,
    topic: 'Predicción de lesiones con datos de entrenamiento',
  },
  {
    author: 'Van Eetvelde et al.',
    year: 2021,
    topic: 'Aprendizaje automático en la prevención de lesiones',
  },
]

export const ROLES_CONTENT = {
  eyebrow: 'Roles',
  title: 'Cada persona del club, con lo que necesita',
  description: 'La interfaz muestra solo los módulos y las acciones que corresponden a cada rol.',
}

export interface PrivacyPrinciple {
  icon: LucideIcon
  title: string
  description: string
}

export const PRIVACY_CONTENT = {
  eyebrow: 'Privacidad y datos de menores',
  title: 'Tratamiento conforme a la Ley 1581 de 2012',
  description:
    'Gran parte de los deportistas son menores de edad. Por eso la protección de sus datos está en el diseño, no al final.',
}

export const PRIVACY_PRINCIPLES: PrivacyPrinciple[] = [
  {
    icon: FileCheck,
    title: 'Consentimiento de los acudientes',
    description:
      'El club registra el consentimiento de los acudientes de cada menor y la plataforma destaca a quienes aún no lo tienen.',
  },
  {
    icon: Lock,
    title: 'Acceso a la salud restringido por rol',
    description:
      'Solo los roles que lo necesitan ven la información de salud, y cada acceso a los registros de salud queda auditado.',
  },
  {
    icon: EyeOff,
    title: 'Datos seudonimizados para el análisis',
    description:
      'El motor de análisis trabaja con variables sin nombres, correos ni diagnósticos, y las exportaciones reemplazan la identidad por un código.',
  },
]

export const PARTNER_CONTENT = {
  eyebrow: 'Socio estratégico',
  name: 'VERA FC',
  description:
    'VERA FC es el club socio que valida Lancelot en condiciones operativas reales, para que la plataforma responda al trabajo diario de un club de formación.',
}

export interface TeamMember {
  name: string
  role: string
  initials: string
  photoFile: string
}

export const TEAM_CONTENT = {
  eyebrow: 'Equipo',
  title: 'Quienes desarrollan Lancelot',
  description: 'Trabajo de grado de Ingeniería de Software de la Universidad de Cundinamarca.',
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Daniel Jose Morales Teatino',
    role: 'Dev Backend - AI ML',
    initials: 'DM',
    photoFile: 'daniel.jpg',
  },
  {
    name: 'Lukas David Davila Alzate',
    role: 'Dev Frontend',
    initials: 'LD',
    photoFile: 'lukas.jpg',
  },
]

export const FOOTER_CONTENT = {
  university: 'Universidad de Cundinamarca',
  faculty: 'Facultad de Ingeniería',
  program: 'Programa de Ingeniería de Software',
  advisor: 'Docente asesora: Angélica Gaitán Nuñez',
  year: 2026,
}
