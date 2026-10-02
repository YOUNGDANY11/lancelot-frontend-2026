import { describe, expect, it } from 'vitest'
import { calculateAge, isMinor } from '@/utils/age'
import { formatDate, isValidApiDate, parseApiDate, toApiDate } from '@/utils/formatDate'

const TODAY = new Date(2026, 9, 1)

describe('fechas de la API', () => {
  it('muestra las fechas como dd/MM/yyyy sin correrse por zona horaria', () => {
    expect(formatDate('2026-01-05')).toBe('05/01/2026')
    expect(formatDate('2026-01-05T00:00:00.000Z')).toBe('05/01/2026')
  })

  it('devuelve un texto vacío para fechas ausentes o inválidas', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('no-es-fecha')).toBe('')
  })

  it('valida fechas reales en formato YYYY-MM-DD', () => {
    expect(isValidApiDate('2010-02-28')).toBe(true)
    expect(isValidApiDate('2010-02-30')).toBe(false)
    expect(isValidApiDate('28/02/2010')).toBe(false)
  })

  it('convierte una fecha local al formato de la API', () => {
    expect(toApiDate(new Date(2026, 0, 9))).toBe('2026-01-09')
    expect(parseApiDate('2026-01-09')?.getDate()).toBe(9)
  })
})

describe('edad', () => {
  it('calcula la edad cumplida', () => {
    expect(calculateAge('2008-10-01', TODAY)).toBe(18)
    expect(calculateAge('2008-10-02', TODAY)).toBe(17)
  })

  it('identifica a los menores de edad', () => {
    expect(isMinor('2008-10-02', TODAY)).toBe(true)
    expect(isMinor('2008-10-01', TODAY)).toBe(false)
    expect(isMinor('', TODAY)).toBe(false)
  })
})
