export type BatchOutcome<T> = { ok: true; value: T } | { ok: false; error: unknown }

export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
  onSettled: (index: number, outcome: BatchOutcome<T>) => void,
): Promise<BatchOutcome<T>[]> {
  const outcomes: BatchOutcome<T>[] = new Array(tasks.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < tasks.length) {
      const index = nextIndex
      nextIndex += 1
      try {
        outcomes[index] = { ok: true, value: await tasks[index]() }
      } catch (error) {
        outcomes[index] = { ok: false, error }
      }
      onSettled(index, outcomes[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return outcomes
}
