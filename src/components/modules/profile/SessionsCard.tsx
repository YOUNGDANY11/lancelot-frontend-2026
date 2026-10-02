import { MonitorSmartphone } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PROFILE_TEXTS } from '@/constants/authTexts'

interface SessionsCardProps {
  isConfirmOpen: boolean
  onOpenConfirm: () => void
  onConfirmOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function SessionsCard({
  isConfirmOpen,
  onOpenConfirm,
  onConfirmOpenChange,
  onConfirm,
  isPending,
}: SessionsCardProps) {
  return (
    <Card className="glass-subtle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MonitorSmartphone aria-hidden="true" className="size-5 text-primary" />
          {PROFILE_TEXTS.sessionsTitle}
        </CardTitle>
        <CardDescription>{PROFILE_TEXTS.sessionsDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" className="w-full sm:w-auto" onClick={onOpenConfirm}>
          {PROFILE_TEXTS.logoutAll}
        </Button>
        <ConfirmDialog
          open={isConfirmOpen}
          onOpenChange={onConfirmOpenChange}
          title={PROFILE_TEXTS.logoutAllConfirmTitle}
          description={PROFILE_TEXTS.logoutAllConfirmDescription}
          confirmLabel={PROFILE_TEXTS.logoutAllConfirm}
          onConfirm={onConfirm}
          pending={isPending}
          destructive
        />
      </CardContent>
    </Card>
  )
}
