import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LANDING_NAV_LINKS } from '@/constants/landing'
import { renderAppAt } from '@/test/renderWithProviders'

async function renderLanding() {
  const result = renderAppAt('/')
  await screen.findByRole('heading', { level: 1 })
  return result
}

async function openRegisterFromHero() {
  const user = userEvent.setup()
  const hero = screen.getByRole('region', { name: /historial completo/i })
  await user.click(within(hero).getByRole('button', { name: 'Crear cuenta' }))
  return user
}

describe('LandingView', () => {
  it('muestra el título de valor del hero', async () => {
    await renderLanding()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'El historial completo de cada deportista, de la escuela al primer equipo',
      }),
    ).toBeInTheDocument()
  })

  it('enlaza cada ancla de la navegación con una sección existente', async () => {
    const { container } = await renderLanding()
    LANDING_NAV_LINKS.forEach((link) => {
      expect(container.querySelector(`section#${link.id}`)).not.toBeNull()
    })
  })

  it('marca la ilustración del hero como ilustrativa', async () => {
    await renderLanding()
    expect(screen.getByRole('img', { name: /ilustrativos/i })).toBeInTheDocument()
  })

  it('cita la fuente de las cifras de costo', async () => {
    await renderLanding()
    expect(screen.getByText('Fuentes: Wyscout (2026); Catapult Sports (2026).')).toBeInTheDocument()
  })

  it('presenta a los desarrolladores con el texto exacto y sus iniciales', async () => {
    await renderLanding()
    const team = screen.getByRole('region', { name: 'Quienes desarrollan Lancelot' })
    expect(within(team).getByText('Daniel Jose Morales Teatino')).toBeInTheDocument()
    expect(within(team).getByText('Dev Backend - AI ML')).toBeInTheDocument()
    expect(within(team).getByText('Lukas David Davila Alzate')).toBeInTheDocument()
    expect(within(team).getByText('Dev Frontend')).toBeInTheDocument()
    expect(within(team).getByText('DM')).toBeInTheDocument()
    expect(within(team).getByText('LD')).toBeInTheDocument()
  })

  it('abre el modal de registro desde el hero sin cambiar de página', async () => {
    const { router } = await renderLanding()
    await openRegisterFromHero()

    expect(await screen.findByRole('dialog', { name: 'Crear cuenta' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('cambia de registro a inicio de sesión sin cerrar el modal', async () => {
    await renderLanding()
    const user = await openRegisterFromHero()
    const dialog = await screen.findByRole('dialog', { name: 'Crear cuenta' })

    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('dialog', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('cierra el modal con Escape', async () => {
    await renderLanding()
    const user = await openRegisterFromHero()
    await screen.findByRole('dialog', { name: 'Crear cuenta' })

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
