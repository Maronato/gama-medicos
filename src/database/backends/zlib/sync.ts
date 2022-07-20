import sql, { Sql } from "sql-template-tag"

import { createLogger, Logger, makeid, perfRun } from "../utils"

import type { DBBackend, DB } from "../interface"
import type { Database } from "sql.js"

import { findMany, initDB } from "./shared"

export class ZlibBackend implements DBBackend {
  private sqlDB: Database | undefined
  private _db: DB | null = null
  private logger: Logger

  get db(): DB | null {
    return this._db
  }

  constructor(debug = false) {
    this.logger = createLogger(debug, "ZlibBackend")
  }

  async init() {
    const sqlDB = await initDB()
    this.sqlDB = sqlDB
    const logger = this.logger

    const db = {
      async query<T>(query: Sql) {
        const id = makeid()
        logger.log(`executing query ${id}`)
        logger.debug(`query ${id} '${query.sql}' with values ${query.values}`)
        const [result, time] = await perfRun(() => findMany<T>(sqlDB, query))
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
