/**
 * Make sure that a function is called only once.
 * Further calls return the original result.
 *
 * @param fn function to be executed
 * @returns the once-fied function
 */
export const once = <T>(fn: () => T) => {
  const initial = Symbol("initialValue")
  let result: T | typeof initial = initial

  return () => {
    if (result === initial) {
      result = fn()
    }
    return result
  }
}

export const isNotNull = <T>(value: T | null): value is T => value !== null

export const arraysAreEqual = (a: unknown[], b: unknown[]) => {
  return a.length === b.length && a.every((v, i) => v === b[i])
}
