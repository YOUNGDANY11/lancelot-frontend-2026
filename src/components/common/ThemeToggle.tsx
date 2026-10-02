import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { THEME_LABELS } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Cambiar a ${THEME_LABELS[nextTheme].toLowerCase()}`}
    >
      {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
