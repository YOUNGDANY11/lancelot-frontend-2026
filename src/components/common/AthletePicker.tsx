import { Check, Search } from 'lucide-react'
import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import type { FormControlProps } from '@/components/common/FormField'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { matchesSearch } from '@/utils/text'

export interface AthleteOption {
  id: number
  label: string
  hint?: string
}

interface AthletePickerProps extends Partial<FormControlProps> {
  options: AthleteOption[]
  value: number | null
  onChange: (id: number | null) => void
  isLoading?: boolean
  placeholder?: string
  emptyMessage?: string
}

const MAX_VISIBLE_OPTIONS = 50

export function AthletePicker({
  options,
  value,
  onChange,
  isLoading = false,
  placeholder = 'Busca por nombre o apellido',
  emptyMessage = 'No encontramos deportistas con ese nombre.',
  id,
  ...controlProps
}: AthletePickerProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const listboxId = `${inputId}-opciones`
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const selected = options.find((option) => option.id === value)

  const filtered = useMemo(
    () =>
      options
        .filter((option) => matchesSearch(`${option.label} ${option.hint ?? ''}`, query))
        .slice(0, MAX_VISIBLE_OPTIONS),
    [options, query],
  )

  const open = () => {
    setQuery('')
    setActiveIndex(0)
    setIsOpen(true)
  }

  const choose = (option: AthleteOption) => {
    onChange(option.id)
    setIsOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) open()
      setActiveIndex((current) => Math.min(current + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && isOpen) {
      event.preventDefault()
      const option = filtered[activeIndex]
      if (option) choose(option)
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      event.stopPropagation()
      setIsOpen(false)
    }
  }

  const activeOption = isOpen ? filtered[activeIndex] : undefined

  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        {...controlProps}
        id={inputId}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeOption ? `${listboxId}-${activeOption.id}` : undefined}
        autoComplete="off"
        className="pl-9"
        placeholder={isLoading ? 'Cargando deportistas…' : placeholder}
        disabled={isLoading}
        value={isOpen ? query : (selected?.label ?? '')}
        onFocus={open}
        onClick={() => !isOpen && open()}
        onBlur={() => setIsOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(0)
          if (!isOpen) setIsOpen(true)
        }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Deportistas"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li role="presentation" className="px-3 py-2 text-sm text-muted-foreground">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((option, index) => {
              const isSelected = option.id === value
              return (
                <li
                  key={option.id}
                  id={`${listboxId}-${option.id}`}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm',
                    index === activeIndex && 'bg-muted',
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    choose(option)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{option.label}</span>
                    {option.hint && (
                      <span className="truncate text-xs text-muted-foreground">{option.hint}</span>
                    )}
                  </span>
                  {isSelected && <Check aria-hidden="true" className="size-4 text-primary" />}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
