import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GLOSSARY, type GlossaryKey } from '@/constants/glossary'
import { cn } from '@/lib/utils'

interface HelpHintProps {
  term: GlossaryKey
  className?: string
}

export function HelpHint({ term, className }: HelpHintProps) {
  const entry = GLOSSARY[term]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn('rounded-full text-muted-foreground hover:text-primary', className)}
          aria-label={`Qué es ${entry.term}`}
        >
          <Info aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]" align="start">
        <p className="font-heading font-semibold">{entry.term}</p>
        <p className="text-sm text-pretty text-muted-foreground">{entry.definition}</p>
        {'source' in entry && entry.source && (
          <p className="text-xs text-muted-foreground italic">Fuente: {entry.source}</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
