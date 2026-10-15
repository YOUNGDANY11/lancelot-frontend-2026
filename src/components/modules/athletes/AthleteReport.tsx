import type { ReactNode } from 'react'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import {
  DEVELOPMENT_OBJECTIVE_STATUS,
  EVALUATION_DIMENSION,
  PHYSICAL_EVALUATION_STAGE,
  RISK_LEVEL,
  SPORT,
  type RiskLevelValue,
  type Sport,
} from '@/constants/enums'
import { PARTNER_CONTENT } from '@/constants/landing'
import type { useAthleteReportController } from '@/controllers/athletes/useAthleteReportController'
import type { SportSummary } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { formatNumber, formatPercent } from '@/utils/formatNumber'
import { sportViewsOf } from '@/utils/sportViews'

type ReportData = ReturnType<typeof useAthleteReportController>

const LEVELS: RiskLevelValue[] = ['alto', 'medio', 'bajo']

function ReportSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="report-avoid-break flex flex-col gap-3 border-t border-border pt-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
      {hint && <dd className="text-xs text-muted-foreground">{hint}</dd>}
    </div>
  )
}

function withSport(title: string, sport: Sport | null, multiSport: boolean) {
  return multiSport && sport ? `${title} · ${SPORT.labels[sport]}` : title
}

function IndexSection({ view, multiSport }: { view: SportSummary; multiSport: boolean }) {
  const index = view.weighted_progress_index
  return (
    <ReportSection
      title={withSport('Índice de progreso ponderado', view.sport, multiSport)}
      description="Combina las dimensiones física, técnica y de participación con los pesos de su posición y categoría. Escala de 0 a 100."
    >
      {index ? (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Índice" value={formatNumber(index.index_value, 1)} />
            <Stat label="Física" value={formatNumber(index.physical_score, 1)} />
            <Stat label="Técnica" value={formatNumber(index.technical_score, 1)} />
            <Stat label="Participación" value={formatNumber(index.participation_score, 1)} />
          </dl>
          {index.warnings && index.warnings.length > 0 && (
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
              {index.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <EmptyNote>Aún no se ha calculado el índice de esta temporada.</EmptyNote>
      )}
    </ReportSection>
  )
}

function ParticipationSection({ view, multiSport }: { view: SportSummary; multiSport: boolean }) {
  const { training_participation: training, match_participation: matches } = view
  return (
    <ReportSection title={withSport('Participación', view.sport, multiSport)}>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Asistencia a entrenamientos"
          value={formatPercent(training.attendance_rate)}
          hint={`${training.sessions_attended} de ${training.total_sessions} sesiones`}
        />
        <Stat label="RPE promedio" value={formatNumber(training.avg_rpe, 1)} />
        <Stat label="Carga total" value={`${formatNumber(training.total_session_load, 0)} UA`} />
        <Stat
          label="Partidos jugados"
          value={`${matches.matches_played} de ${matches.matches_in_season}`}
          hint={`${formatNumber(matches.total_minutes, 0)} minutos${matches.match_minutes ? ` · partidos de ${matches.match_minutes}` : ''}`}
        />
        <Stat label="Goles" value={String(matches.goals)} />
        <Stat label="Asistencias" value={String(matches.assists)} />
        <Stat label="Tarjetas amarillas" value={String(matches.yellow_cards)} />
        <Stat label="Tarjetas rojas" value={String(matches.red_cards)} />
        {view.sport === 'futbol_sala' && (
          <Stat
            label="Faltas cometidas"
            value={String(matches.fouls_committed ?? 0)}
            hint="Se acumulan por equipo en fútbol sala"
          />
        )}
      </dl>
    </ReportSection>
  )
}

export function AthleteReport({ report }: { report: ReportData }) {
  const summary = report.summary
  if (!summary) return null
  const { athlete } = summary
  const views = sportViewsOf(summary)
  const multiSport = views.length > 1
  const comparisonSports = new Set(report.comparison.map((point) => point.sport ?? null))
  const technicalGroups = (
    multiSport ? [...views.map((view) => view.sport), null] : [null]
  ).flatMap((sport) =>
    EVALUATION_DIMENSION.options.map(({ value, label }) => ({
      key: `${sport ?? 'todos'}-${value}`,
      sport,
      noun: label.toLowerCase(),
      items: report.technical.filter(
        (item) => item.dimension === value && (!multiSport || (item.sport ?? null) === sport),
      ),
    })),
  )

  return (
    <article className="report-sheet flex flex-col gap-6 rounded-2xl border border-border p-6 sm:p-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Informe de evolución individual
          </p>
          <h1 className="text-3xl font-semibold text-balance">
            {athlete.name} {athlete.lastname}
          </h1>
          {views.map((view) => (
            <p key={view.sport} className="text-muted-foreground">
              {[
                view.category ?? 'Sin categoría',
                SPORT.labels[view.sport],
                view.position ?? 'Sin posición',
              ].join(' · ')}
            </p>
          ))}
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:text-right">
          <dt className="text-muted-foreground">Club</dt>
          <dd className="font-medium">{PARTNER_CONTENT.name}</dd>
          <dt className="text-muted-foreground">Temporada</dt>
          <dd className="font-medium">{summary.season.name}</dd>
          <dt className="text-muted-foreground">Generado el</dt>
          <dd className="font-medium">{report.generatedOn}</dd>
        </dl>
      </header>

      {views.map((view) => (
        <IndexSection key={view.sport} view={view} multiSport={multiSport} />
      ))}

      <ReportSection
        title="Evolución entre temporadas"
        description="Índice de progreso de cada temporada en la que el deportista tiene datos."
      >
        {report.comparison.length > 0 ? (
          <DataTableSimple
            caption="Evolución del índice entre temporadas"
            headers={[
              'Temporada',
              ...(comparisonSports.size > 1 ? ['Deporte'] : []),
              'Índice',
              'Física',
              'Técnica',
              'Participación',
            ]}
            rows={report.comparison.map((point) => [
              point.season_name,
              ...(comparisonSports.size > 1 ? [point.sport ? SPORT.labels[point.sport] : '—'] : []),
              formatNumber(point.index_value, 1),
              formatNumber(point.physical_score, 1),
              formatNumber(point.technical_score, 1),
              formatNumber(point.participation_score, 1),
            ])}
          />
        ) : (
          <EmptyNote>Aún no hay índices calculados en ninguna temporada.</EmptyNote>
        )}
      </ReportSection>

      <ReportSection
        title="Evaluación física"
        description={
          multiSport ? 'La condición física es una sola y sirve para ambos deportes.' : undefined
        }
      >
        {report.physical.length > 0 ? (
          <DataTableSimple
            caption="Evaluaciones físicas de la temporada"
            headers={[
              'Etapa',
              'Fecha',
              'Talla (cm)',
              'Peso (kg)',
              'VO₂ máx.',
              'Velocidad 20 m (s)',
            ]}
            rows={report.physical.map((evaluation) => [
              PHYSICAL_EVALUATION_STAGE.labels[evaluation.stage],
              formatDate(evaluation.eval_date),
              formatNumber(evaluation.height_cm, 1),
              formatNumber(evaluation.weight_kg, 1),
              formatNumber(evaluation.vo2max_estimado, 1),
              formatNumber(evaluation.speed_20m, 2),
            ])}
          />
        ) : (
          <EmptyNote>No tiene evaluaciones físicas en esta temporada.</EmptyNote>
        )}
      </ReportSection>

      {technicalGroups
        .filter((group) => group.sport !== null || !multiSport || group.items.length > 0)
        .map((group) => {
          const sportLabel = group.sport
            ? SPORT.labels[group.sport]
            : multiSport
              ? 'sin deporte indicado'
              : null
          const title = sportLabel
            ? `Evaluación ${group.noun} · ${sportLabel}`
            : `Evaluación ${group.noun}`
          return (
            <ReportSection
              key={group.key}
              title={title}
              description="Promedio de cada indicador en la temporada, en escala de 1 a 10."
            >
              {group.items.length > 0 ? (
                <DataTableSimple
                  caption={
                    sportLabel
                      ? `Promedio por indicador de la evaluación ${group.noun} en ${sportLabel}`
                      : `Promedio por indicador de la evaluación ${group.noun}`
                  }
                  headers={['Indicador', 'Promedio', 'Evaluaciones', 'Última']}
                  rows={group.items.map((item) => [
                    item.indicator,
                    formatNumber(item.average, 1),
                    item.count,
                    formatDate(item.lastDate),
                  ])}
                />
              ) : (
                <EmptyNote>{`No tiene evaluaciones de tipo ${group.noun} en esta temporada.`}</EmptyNote>
              )}
            </ReportSection>
          )
        })}

      {views.map((view) => (
        <ParticipationSection key={view.sport} view={view} multiSport={multiSport} />
      ))}

      <ReportSection title="Objetivos de desarrollo">
        {report.objectives.length > 0 ? (
          <DataTableSimple
            caption="Objetivos de desarrollo de la temporada"
            headers={['Objetivo', 'Fecha meta', 'Estado']}
            rows={report.objectives.map((objective) => [
              objective.description,
              formatDate(objective.target_date),
              DEVELOPMENT_OBJECTIVE_STATUS.labels[objective.status],
            ])}
          />
        ) : (
          <EmptyNote>No tiene objetivos registrados en esta temporada.</EmptyNote>
        )}
      </ReportSection>

      <ReportSection
        title="Control de carga"
        description={`Alertas de fatiga y evaluaciones de riesgo generadas en la temporada a partir del RPE y la relación carga aguda:crónica${multiSport ? ', sumando la carga de ambos deportes' : ''}. Este informe no incluye diagnósticos ni registros de salud.`}
      >
        <DataTableSimple
          caption="Alertas de la temporada por nivel"
          headers={['Tipo', ...LEVELS.map((level) => RISK_LEVEL.labels[level])]}
          rows={[
            ['Alertas de fatiga', ...LEVELS.map((level) => report.alerts.fatigue[level])],
            ['Evaluaciones de riesgo', ...LEVELS.map((level) => report.alerts.risk[level])],
          ]}
        />
      </ReportSection>

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
        Generado con Lancelot. El sistema sugiere; las decisiones las toma el cuerpo técnico.
      </footer>
    </article>
  )
}
