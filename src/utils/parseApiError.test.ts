import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'
import { API_ERROR_MESSAGES } from '@/constants/messages'
import { createApiError as apiError } from '@/test/apiErrors'
import { getApiErrorStatus, parseApiError, translateValidationMessage } from '@/utils/parseApiError'

describe('parseApiError', () => {
  it('devuelve el mensaje de negocio del backend', () => {
    const error = apiError(400, { status: 'Error', mensaje: 'No existe esta temporada' })
    expect(parseApiError(error)).toBe('No existe esta temporada')
  })

  it('corrige las tildes de mensajes conocidos del backend', () => {
    const error = apiError(401, {
      status: 'Error',
      mensaje: 'Este correo no esta asociado a ninguna cuenta',
    })
    expect(parseApiError(error)).toBe('Este correo no está asociado a ninguna cuenta.')
  })

  it('traduce los errores de validación de class-validator', () => {
    const error = apiError(400, {
      statusCode: 400,
      message: ['email must be an email', 'property id_role should not exist'],
      error: 'Bad Request',
    })
    expect(parseApiError(error)).toBe(
      'Revisa estos datos: Correo debe ser un correo válido; Rol no está permitido.',
    )
  })

  it('conserva los mensajes de validación que ya vienen en español', () => {
    expect(translateValidationMessage('La fecha debe tener el formato YYYY-MM-DD')).toBe(
      'La fecha debe tener el formato YYYY-MM-DD',
    )
  })

  it('explica un error de red', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK')
    expect(parseApiError(error)).toBe(API_ERROR_MESSAGES.network)
  })

  it('usa un texto por estado cuando no hay cuerpo reconocible', () => {
    expect(parseApiError(apiError(403, ''))).toBe(API_ERROR_MESSAGES.forbidden)
    expect(parseApiError(apiError(502, ''))).toBe(API_ERROR_MESSAGES.server)
  })

  it('maneja errores que no vienen de la API', () => {
    expect(parseApiError(new Error('x'))).toBe(API_ERROR_MESSAGES.unexpected)
    expect(getApiErrorStatus(new Error('x'))).toBeUndefined()
  })
})
