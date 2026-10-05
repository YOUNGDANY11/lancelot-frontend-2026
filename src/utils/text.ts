export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function matchesSearch(text: string, query: string): boolean {
  const normalizedQuery = normalizeForSearch(query)
  if (!normalizedQuery) return true
  const normalizedText = normalizeForSearch(text)
  return normalizedQuery.split(/\s+/).every((word) => normalizedText.includes(word))
}

export function fullName(person: { name?: string | null; lastname?: string | null }): string {
  return [person.name, person.lastname].filter(Boolean).join(' ').trim()
}

export function initialsOf(person: { name?: string | null; lastname?: string | null }): string {
  return [person.name, person.lastname]
    .map((part) => part?.trim().charAt(0) ?? '')
    .join('')
    .toUpperCase()
}
