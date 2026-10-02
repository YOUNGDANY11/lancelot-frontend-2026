import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { THEME_STORAGE_KEY } from '@/constants/theme'
import { ThemeProvider } from '@/context/ThemeProvider'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeProvider', () => {
  it('inicia en tema oscuro por defecto', () => {
    renderToggle()
    expect(document.documentElement).toHaveClass('dark')
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toBeInTheDocument()
  })

  it('respeta el tema claro guardado', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
    renderToggle()
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('alterna el tema y guarda la preferencia', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: 'Cambiar a tema claro' }))

    expect(document.documentElement).not.toHaveClass('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toBeInTheDocument()
  })

  it('ignora valores guardados que no son un tema válido', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'azul')
    renderToggle()
    expect(document.documentElement).toHaveClass('dark')
  })
})
