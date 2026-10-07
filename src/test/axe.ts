import axe from 'axe-core'

export interface AxeViolationSummary {
  id: string
  impact: string | null | undefined
  help: string
  targets: string[]
}

export async function findAxeViolations(
  root: Element = document.body,
): Promise<AxeViolationSummary[]> {
  const results = await axe.run(root, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
    resultTypes: ['violations'],
  })
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.slice(0, 3).map((node) => node.target.join(' ')),
  }))
}
