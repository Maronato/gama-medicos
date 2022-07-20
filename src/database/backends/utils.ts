export function makeid(length = 5) {
  let result = ""
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export async function perfRun<T>(fn: () => T) {
  const t1 = performance.now()
  const result = await fn()
  const t2 = performance.now()
  return [result, t2 - t1] as const
}

export type Logger = Pick<typeof console, "log" | "debug">

export function createLogger(debug: boolean, name: string): Logger {
  return {
    debug: (...args: string[]) => {
      if (debug) {
        console.debug(`[${name}] `, ...args)
      }
    },
    log: (...args: string[]) => {
      if (debug) {
        console.log(`[${name}] `, ...args)
      }
    },
  }
}
