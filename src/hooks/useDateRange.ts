import { subDays } from 'date-fns'
import { useState } from 'react'
import { toApiDate, todayApiDate } from '@/utils/formatDate'

export function useDateRange(defaultDays = 28, defaultFrom?: string) {
  const [from, setFrom] = useState(defaultFrom ?? toApiDate(subDays(new Date(), defaultDays - 1)))
  const [to, setTo] = useState(todayApiDate())
  const error =
    !from || !to
      ? 'Elige las dos fechas.'
      : from > to
        ? 'La fecha inicial debe ser anterior a la final.'
        : undefined
  return { from, to, setFrom, setTo, error, isValid: error === undefined }
}
