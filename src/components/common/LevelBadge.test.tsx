import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LevelBadge } from '@/components/common/LevelBadge'

describe('LevelBadge', () => {
  it.each([
    ['bajo', 'Bajo'],
    ['medio', 'Medio'],
    ['alto', 'Alto'],
  ] as const)('muestra el texto del nivel %s además del color', (level, label) => {
    render(<LevelBadge level={level} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
