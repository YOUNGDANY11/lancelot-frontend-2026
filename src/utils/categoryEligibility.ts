export interface AgeLimitedCategory {
  id_category: number
  name: string
  max_age?: number | null
}

export interface CategoryEligibility {
  eligible: boolean
  sportingAge: number | null
  reason?: string
}

export function referenceYearOf(startDate?: string | null): number {
  const year = Number(String(startDate ?? '').slice(0, 4))
  return startDate && Number.isFinite(year) ? year : new Date().getFullYear()
}

export function sportingAge(
  birthDate: string | null | undefined,
  referenceYear: number,
): number | null {
  if (!birthDate) return null
  const birthYear = Number(birthDate.slice(0, 4))
  return Number.isFinite(birthYear) ? referenceYear - birthYear : null
}

export function checkEligibility(
  birthDate: string | null | undefined,
  category: AgeLimitedCategory,
  referenceYear: number,
): CategoryEligibility {
  const age = sportingAge(birthDate, referenceYear)
  if (age === null)
    return {
      eligible: false,
      sportingAge: null,
      reason: 'No tiene fecha de nacimiento registrada.',
    }
  if (category.max_age === null || category.max_age === undefined)
    return { eligible: true, sportingAge: age }
  if (age > category.max_age)
    return {
      eligible: false,
      sportingAge: age,
      reason: `Cumple ${age} años en ${referenceYear} y ${category.name} es hasta ${category.max_age} años.`,
    }
  return { eligible: true, sportingAge: age }
}

export function eligibleCategories<T extends AgeLimitedCategory>(
  birthDate: string | null | undefined,
  categories: T[],
  referenceYear: number,
): T[] {
  return categories.filter(
    (category) => checkEligibility(birthDate, category, referenceYear).eligible,
  )
}

export function sortByAgeGroup<T extends { id_category?: number | null }>(
  items: T[],
  maxAgeById: Map<number, number>,
): T[] {
  return [...items].sort(
    (first, second) =>
      (maxAgeById.get(first.id_category ?? -1) ?? Infinity) -
      (maxAgeById.get(second.id_category ?? -1) ?? Infinity),
  )
}

export const ELIGIBILITY_RULE =
  'Un deportista puede estar en su categoría y en las superiores, nunca en una menor a su edad. La edad se cuenta con el año de nacimiento.'
