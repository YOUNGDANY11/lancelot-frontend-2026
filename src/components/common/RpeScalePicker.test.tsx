import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { RpeScalePicker } from '@/components/common/RpeScalePicker'

function Harness() {
  const [value, setValue] = useState<number | null>(null)
  return <RpeScalePicker value={value} onChange={setValue} label="RPE de Ana" />
}

describe('RpeScalePicker', () => {
  it('muestra la etiqueta de la escala al elegir un valor', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('radio', { name: '7: Muy duro' }))

    expect(screen.getByRole('radio', { name: '7: Muy duro' })).toBeChecked()
    expect(screen.getByText('7: Muy duro')).toBeInTheDocument()
  })

  it('se puede usar solo con el teclado', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.tab()
    await user.keyboard('{ArrowRight}{ArrowRight}')

    expect(screen.getByRole('radio', { name: '2: Fácil' })).toBeChecked()
  })
})
