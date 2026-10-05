import { useContext } from 'react'
import { AppContext, type AppContextValue } from '@/context/AppContext'

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext debe usarse dentro de AppContextProvider')
  return context
}
