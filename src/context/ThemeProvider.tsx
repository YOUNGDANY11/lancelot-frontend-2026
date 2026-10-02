import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Theme } from '@/constants/theme'
import { ThemeContext, type ThemeContextValue } from '@/context/ThemeContext'
import { applyThemeToDocument, readStoredTheme, storeTheme } from '@/utils/themeStorage'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    applyThemeToDocument(theme)
    storeTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])

  const toggleTheme = useCallback(
    () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  )

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
