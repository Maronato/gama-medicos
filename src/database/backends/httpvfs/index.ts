import sql, { Sql } from "sql-template-tag"
import { createDbWorker, WorkerHttpvfs } from "sql.js-httpvfs"
import wasmUrl from "sql.js-httpvfs/dist/sql-wasm.wasm?url"
import workerUrl from "sql.js-httpvfs/dist/sqlite.worker.js?url"

import { once } from "@/lib/utils"

import { createLogger, Logger, makeid, perfRun } from "../utils"

import type { DBBackend, DB } from "../interface"
import type { SplitFileConfig } from "sql.js-httpvfs/dist/sqlite.worker"

function getWorkerConfig(url: string) {
  const config: SplitFileConfig = {
    from: "inline",
    config: {
      serverMode: "full",
      requestChunkSize: 4096,
      url,
    },
  }
  return config
}

function createWorker(url: string) {
  // Generate config
  const config = getWorkerConfig(url)
  return createDbWorker([config], workerUrl.toString(), wasmUrl.toString())
}

const initDB = once(async () => {
  const worker = await createWorker("/db.sqlite")
  return worker
})

export class HTTPvfsBackend implements DBBackend {
  private worker: WorkerHttpvfs | undefined
  private _db: DB | null = null
  private logger: Logger

  get db(): DB | null {
    return this._db
  }

  constructor(debug = false) {
    this.logger = createLogger(debug, "HTTPvfsBackend")
  }

  async init() {
    const worker = await initDB()
    this.worker = worker
    const logger = this.logger

    this._db = {
      async query<T>(query: Sql) {
        const id = makeid()
        logger.log(`executing query ${id}`)
        logger.debug(`query ${id} '${query.sql}' with values ${query.values}`)

        const [result, time] = await perfRun(
          () => worker.db.query(query.sql, query.values) as Promise<T[]>
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
  }
}
