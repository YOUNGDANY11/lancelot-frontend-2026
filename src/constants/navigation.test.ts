import { describe, expect, it } from 'vitest'
import { canAccessModule, moduleLabel, modulesForRole } from '@/constants/navigation'
import type { RoleCode } from '@/constants/roles'

function labelsFor(role: RoleCode): string[] {
  return modulesForRole(role).map((module) => moduleLabel(module, role))
}

describe('módulos por rol', () => {
  it('muestra los 7 módulos al administrador', () => {
    expect(labelsFor('ADMIN')).toEqual([
      'Inicio',
      'Club',
      'Deportistas',
      'Entrenamiento',
      'Salud',
      'Talento y progreso',
      'Análisis IA',
    ])
  })

  it('no muestra Análisis IA al entrenador', () => {
    expect(labelsFor('ENTRENADOR')).not.toContain('Análisis IA')
    expect(labelsFor('ENTRENADOR')).toContain('Talento y progreso')
  })

  it('no muestra Talento al encargado de salud', () => {
    expect(labelsFor('ENCARGADO_SALUD')).toEqual([
      'Inicio',
      'Club',
      'Deportistas',
      'Entrenamiento',
      'Salud',
      'Análisis IA',
    ])
  })

  it('muestra al deportista solo su espacio, su ficha y su entrenamiento', () => {
    expect(labelsFor('DEPORTISTA')).toEqual(['Mi espacio', 'Mi ficha', 'Mi entrenamiento'])
  })

  it('reserva la configuración al administrador y al director técnico', () => {
    expect(canAccessModule('settings', 'ADMIN')).toBe(true)
    expect(canAccessModule('settings', 'DIRECTOR_TECNICO')).toBe(true)
    expect(canAccessModule('settings', 'ENTRENADOR')).toBe(false)
    expect(canAccessModule('settings', null)).toBe(false)
  })
})
