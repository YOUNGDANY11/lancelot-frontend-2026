import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTabParam } from '@/hooks/useTabParam'

export interface ModuleTab<T extends string> {
  value: T
  label: string
  content: ReactNode
}

interface ModuleTabsProps<T extends string> {
  tabs: ModuleTab<T>[]
  defaultTab: T
  label: string
}

export function ModuleTabs<T extends string>({ tabs, defaultTab, label }: ModuleTabsProps<T>) {
  const { activeTab, setActiveTab } = useTabParam(
    tabs.map((tab) => tab.value),
    defaultTab,
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-5">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList aria-label={label} className="w-max">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <h2 className="sr-only">{tab.label}</h2>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
