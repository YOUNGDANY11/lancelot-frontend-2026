import { HERO_CONTENT } from '@/constants/landing'

export function IllustrativeTag() {
  return (
    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
      {HERO_CONTENT.illustrativeLabel}
    </span>
  )
}
