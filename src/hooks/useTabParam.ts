import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export const TAB_PARAM = 'tab'

export function useTabParam<T extends string>(tabs: readonly T[], defaultTab: T) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get(TAB_PARAM)
  const activeTab = tabs.find((tab) => tab === requested) ?? defaultTab

  const setActiveTab = useCallback(
    (tab: string) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set(TAB_PARAM, tab)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return { activeTab, setActiveTab }
}
