import { differenceInYears } from 'date-fns'
import { parseApiDate } from '@/utils/formatDate'

export const ADULT_AGE = 18

export function calculateAge(
  birthDate: string | null | undefined,
  today = new Date(),
): number | null {
  const parsed = parseApiDate(birthDate)
  if (!parsed) return null
  return differenceInYears(today, parsed)
}

export function isMinor(birthDate: string | null | undefined, today = new Date()): boolean {
  const age = calculateAge(birthDate, today)
  return age !== null && age >= 0 && age < ADULT_AGE
}
