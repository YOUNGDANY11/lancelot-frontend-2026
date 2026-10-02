import { m } from 'motion/react'
import type { ReactNode } from 'react'
import { LevelBadge } from '@/components/common/LevelBadge'
import { IllustrativeTag } from '@/components/landing/IllustrativeTag'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'
import { cn } from '@/lib/utils'

const EVOLUTION_POINTS = [38, 44, 41, 52, 57, 55, 64, 71]
const EVOLUTION_SCALE = { min: 30, max: 80 }
const PROGRESS_DIMENSIONS = [
  { label: 'Física', value: 74, className: 'bg-primary' },
  { label: 'Técnica', value: 68, className: 'bg-secondary' },
  { label: 'Participación', value: 81, className: 'bg-accent' },
]
const PROGRESS_INDEX = 72

export function HeroIllustration() {
  return (
    <div
      role="img"
      aria-label="Ejemplos ilustrativos de lo que muestra Lancelot: una curva de evolución, una alerta de carga y un índice de progreso. No son datos reales."
      className="relative mx-auto grid w-full max-w-md gap-4 sm:max-w-lg lg:max-w-none"
    >
      <FloatingCard delay={0.05} className="lg:mr-12">
        <CardHeader title="Evolución del índice" />
        <EvolutionCurve points={EVOLUTION_POINTS} />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Pre-temporada</span>
          <span>Post-temporada</span>
        </div>
      </FloatingCard>

      <FloatingCard delay={0.12} className="lg:ml-12" floatOffset>
        <CardHeader title="Alerta de carga" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">ACWR de la semana</p>
            <p className="font-heading text-3xl font-semibold tabular-nums">1,48</p>
          </div>
          <LevelBadge level="medio" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Pendiente de revisión por el cuerpo técnico
        </p>
      </FloatingCard>

      <FloatingCard delay={0.19} className="lg:mr-6">
        <CardHeader title="Índice de progreso" />
        <div className="flex items-center gap-4">
          <p className="font-heading text-4xl font-semibold text-accent tabular-nums">
            {PROGRESS_INDEX}
            <span className="text-base text-muted-foreground">/100</span>
          </p>
          <ul className="flex flex-1 flex-col gap-2">
            {PROGRESS_DIMENSIONS.map((dimension) => (
              <li key={dimension.label} className="text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{dimension.label}</span>
                  <span className="tabular-nums">{dimension.value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', dimension.className)}
                    style={{ width: `${dimension.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </FloatingCard>
    </div>
  )
}

interface FloatingCardProps {
  children: ReactNode
  className?: string
  delay: number
  floatOffset?: boolean
}

function FloatingCard({ children, className, delay, floatOffset = false }: FloatingCardProps) {
  const entranceAnimation = useEntranceAnimation(delay)

  return (
    <m.div className={className} {...entranceAnimation}>
      <div
        className={cn(
          'landing-float rounded-2xl glass p-5',
          floatOffset && '[animation-delay:-3.5s]',
        )}
      >
        {children}
      </div>
    </m.div>
  )
}

function CardHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="text-sm font-semibold">{title}</p>
      <IllustrativeTag />
    </div>
  )
}

function EvolutionCurve({ points }: { points: number[] }) {
  const width = 300
  const height = 90
  const range = EVOLUTION_SCALE.max - EVOLUTION_SCALE.min
  const step = width / (points.length - 1)
  const coordinates = points.map((value, index) => [
    index * step,
    height - ((value - EVOLUTION_SCALE.min) / range) * height,
  ])
  const linePath = coordinates
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L${width} ${height} L0 ${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-24 w-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-evolution-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#hero-evolution-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {coordinates.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r="3"
          fill="var(--background)"
          stroke="var(--primary)"
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}
