import { CircleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FormAlertProps {
  message?: string
}

export function FormAlert({ message }: FormAlertProps) {
  if (!message) return null

  return (
    <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
      <CircleAlert aria-hidden="true" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
