import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'
import { apiClient } from '@/lib/apiClient'
import { tokenStorage } from '@/utils/tokenStorage'

configure({ asyncUtilTimeout: 6000 })

apiClient.http.defaults.adapter = (config) =>
  Promise.reject(new Error(`Red deshabilitada en pruebas: ${config.method} ${config.url}`))

afterEach(() => {
  cleanup()
  tokenStorage.clear()
  window.localStorage.clear()
  document.documentElement.className = ''
})

const noop = () => undefined

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
      dispatchEvent: () => false,
    }) as MediaQueryList,
})

class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0]
  readonly scrollMargin = '0px'
  observe = noop
  unobserve = noop
  disconnect = noop
  takeRecords = () => []
}

Object.assign(window.HTMLElement.prototype, {
  scrollIntoView: noop,
  hasPointerCapture: () => false,
  releasePointerCapture: noop,
})

class ResizeObserverStub implements ResizeObserver {
  observe = noop
  unobserve = noop
  disconnect = noop
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
})

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverStub,
})
