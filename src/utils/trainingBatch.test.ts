import { describe, expect, it } from 'vitest'
import { describeSessionLoad, rpeLabel } from '@/constants/rpeScale'
import { runWithConcurrency } from '@/utils/batchRunner'
import { buildMatchStatRows, isStatRowDirty, toMatchStatPayload } from '@/utils/matchStatsBatch'
import { buildRpeRows, planRpeOperations, summarizeRows } from '@/utils/rpeBatch'

const ROSTER = [
  { id_user: 1, name: 'Ana', lastname: 'Ruiz', position: 'Portero' },
  { id_user: 2, name: 'Bruno', lastname: 'Díaz', position: 'Delantero' },
  { id_user: 3, name: 'Carla', lastname: 'Mora', position: 'Lateral' },
]

describe('lote de RPE', () => {
  it('precarga los minutos planificados y las cargas que ya existen', () => {
    const rows = buildRpeRows(
      ROSTER,
      [{ id_load: 50, id_session: 9, id_user: 2, rpe: 6, duration_min: 80, session_load: 480 }],
      90,
    )
    expect(rows.find((row) => row.id_user === 1)).toMatchObject({
      rpe: null,
      minutes: '90',
      loadId: null,
    })
    expect(rows.find((row) => row.id_user === 2)).toMatchObject({
      rpe: 6,
      minutes: '80',
      loadId: 50,
    })
  })

  it('crea las nuevas, actualiza las cambiadas y omite ausentes y sin cambios', () => {
    const rows = buildRpeRows(
      ROSTER,
      [
        { id_load: 50, id_session: 9, id_user: 2, rpe: 6, duration_min: 80, session_load: 480 },
        { id_load: 51, id_session: 9, id_user: 3, rpe: 5, duration_min: 90, session_load: 450 },
      ],
      90,
    ).map((row) => {
      if (row.id_user === 1) return { ...row, rpe: 7 }
      if (row.id_user === 2) return { ...row, rpe: 8 }
      return row
    })

    expect(planRpeOperations(rows).operations).toEqual([
      { kind: 'create', id_user: 1, loadId: null, rpe: 7, duration_min: 90 },
      { kind: 'update', id_user: 2, loadId: 50, rpe: 8, duration_min: 80 },
    ])

    const withAbsent = rows.map((row) => (row.id_user === 1 ? { ...row, absent: true } : row))
    expect(planRpeOperations(withAbsent).operations.map((operation) => operation.id_user)).toEqual([
      2,
    ])
    expect(summarizeRows(withAbsent)).toMatchObject({ present: 2, withRpe: 2, dirty: 1 })
  })

  it('marca como inválidos los minutos fuera de rango', () => {
    const rows = buildRpeRows(ROSTER, [], 90).map((row) =>
      row.id_user === 1 ? { ...row, rpe: 5, minutes: '0' } : row,
    )
    expect(planRpeOperations(rows)).toEqual({ operations: [], invalidUsers: [1] })
  })

  it('muestra la carga calculada con la escala de Foster', () => {
    expect(describeSessionLoad(7, 75)).toBe('RPE 7 × 75 min = 525 UA')
    expect(rpeLabel(10)).toBe('Máximo')
  })
})

describe('lote de estadísticas de partido', () => {
  it('solo envía a quienes jugaron y valida las tarjetas', () => {
    const rows = buildMatchStatRows(ROSTER, [])
    expect(rows.every((row) => !isStatRowDirty(row, 4))).toBe(true)

    const played = { ...rows[0], played: true, minutes: '70', goals: '1', rpe: 7 }
    expect(toMatchStatPayload(played, 4).payload).toEqual({
      id_match: 4,
      id_user: 1,
      minutes_played: 70,
      goals: 1,
      assists: 0,
      yellow_cards: 0,
      red_cards: 0,
      rpe: 7,
    })
    expect(toMatchStatPayload({ ...played, red: '3' }, 4).error).toBe(
      'Revisa goles, asistencias y tarjetas.',
    )
  })
})

describe('runWithConcurrency', () => {
  it('respeta el límite de peticiones simultáneas y reporta cada resultado', async () => {
    let running = 0
    let maxRunning = 0
    const settled: number[] = []
    const tasks = Array.from({ length: 6 }, (_, index) => async () => {
      running += 1
      maxRunning = Math.max(maxRunning, running)
      await new Promise((resolve) => setTimeout(resolve, 5))
      running -= 1
      if (index === 2) throw new Error('falló')
      return index
    })

    const outcomes = await runWithConcurrency(tasks, 2, (index) => settled.push(index))

    expect(maxRunning).toBe(2)
    expect(settled).toHaveLength(6)
    expect(outcomes.filter((outcome) => !outcome.ok)).toHaveLength(1)
  })
})
