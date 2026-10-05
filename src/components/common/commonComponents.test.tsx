import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { AthletePicker, type AthleteOption } from '@/components/common/AthletePicker'
import { DataTable } from '@/components/common/DataTable'
import { HelpHint } from '@/components/common/HelpHint'

const OPTIONS: AthleteOption[] = [
  { id: 1, label: 'Ana María Pérez', hint: '13 años' },
  { id: 2, label: 'José Gómez', hint: '14 años' },
  { id: 3, label: 'Lucía Ramírez', hint: '12 años' },
]

function PickerHarness({ onChange }: { onChange: (id: number | null) => void }) {
  const [value, setValue] = useState<number | null>(null)
  return (
    <>
      <label htmlFor="picker">Deportista</label>
      <AthletePicker
        id="picker"
        options={OPTIONS}
        value={value}
        onChange={(id) => {
          setValue(id)
          onChange(id)
        }}
      />
    </>
  )
}

describe('HelpHint', () => {
  it('explica el término del glosario al abrirlo', async () => {
    const user = userEvent.setup()
    render(<HelpHint term="acwr" />)

    await user.click(screen.getByRole('button', { name: 'Qué es ACWR (relación aguda:crónica)' }))

    expect(await screen.findByText(/Divide la carga aguda/)).toBeInTheDocument()
  })
})

describe('AthletePicker', () => {
  it('busca sin importar tildes y selecciona con el teclado', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PickerHarness onChange={onChange} />)

    const input = screen.getByRole('combobox', { name: 'Deportista' })
    await user.click(input)
    await user.type(input, 'jose')

    expect(screen.getAllByRole('option')).toHaveLength(1)
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith(2)
    expect(input).toHaveValue('José Gómez')
  })

  it('avisa cuando no hay coincidencias', async () => {
    const user = userEvent.setup()
    render(<PickerHarness onChange={vi.fn()} />)

    await user.type(screen.getByRole('combobox', { name: 'Deportista' }), 'zzz')

    expect(screen.getByText('No encontramos deportistas con ese nombre.')).toBeInTheDocument()
  })
})

describe('DataTable', () => {
  const columns = [{ key: 'name', header: 'Nombre', cell: (row: { name: string }) => row.name }]

  it('muestra el estado vacío cuando no hay filas', () => {
    render(
      <DataTable caption="Categorías" columns={columns} rows={[]} getRowKey={(row) => row.name} />,
    )
    expect(screen.getByText('No hay registros para mostrar')).toBeInTheDocument()
  })

  it('pagina en el servidor', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <DataTable
        caption="Categorías"
        columns={columns}
        rows={[{ name: 'Sub-15' }]}
        getRowKey={(row) => row.name}
        pagination={{ page: 1, limit: 10, total: 25, totalPages: 3 }}
        onPageChange={onPageChange}
      />,
    )

    expect(screen.getByText('Página 1 de 3 · 25 registros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
