import { Remote, wrap } from "comlink"
import sql, { Sql } from "sql-template-tag"

import { once } from "@/lib/utils"

import { createLogger, Logger, makeid, perfRun } from "../utils"

import type { DBBackend, DB } from "../interface"
import type { ZlibWorker } from "./async.worker"

const loadWorker = once(() => {
  const worker = new Worker(new URL("./async.worker.ts", import.meta.url), {
    type: "module",
  })
  return wrap<ZlibWorker>(worker)
})

export class AsyncZlibBackend implements DBBackend {
  private worker: Remote<ZlibWorker> | null = null
  private _db: DB | null = null
  private logger: Logger

  get db(): DB | null {
    return this._db
  }

  constructor(debug = false) {
    this.logger = createLogger(debug, "AsyncZlibBackend")
  }

  async init() {
    this.worker = loadWorker()
    const worker = this.worker
    const logger = this.logger
    await this.worker.init()

    const db = {
      async query<T>(query: Sql) {
        const id = makeid()
        logger.log(`executing query ${id}`)
        logger.debug(`query ${id} '${query.sql}' with values ${query.values}`)
        const [result, time] = await perfRun(
          () => worker.query(query.inspect()) as Promise<T[]>
        )
        logger.log(
          `query ${id} took ${time}ms and returned ${result.length} rows`
        )
        return result
      },
      paginatedQuery<T>(query: Sql, page: number, size: number) {
        const paginated = sql`${query} LIMIT ${size} OFFSET ${page * size}`
        return this.query<T>(paginated)
      },
    }
    this._db = db
  }
}
