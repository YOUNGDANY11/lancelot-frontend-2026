import { describe, expect, it } from 'vitest'
import { DEFAULT_API_URL, resolveApiUrl } from '@/lib/env'

describe('resolveApiUrl', () => {
  it('usa la URL por defecto cuando la variable no está definida', () => {
    expect(resolveApiUrl(undefined)).toBe(DEFAULT_API_URL)
  })

  it('usa la URL por defecto cuando la variable está vacía', () => {
    expect(resolveApiUrl('   ')).toBe(DEFAULT_API_URL)
  })

  it('quita las barras finales de la URL configurada', () => {
    expect(resolveApiUrl('https://api.lancelot.co/api//')).toBe('https://api.lancelot.co/api')
  })
})
