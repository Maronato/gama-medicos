import { expose } from "comlink"

import type { Sql } from "sql-template-tag"
import type { Database } from "sql.js"

import { initDB, findMany } from "./shared"

export type ZlibWorker = {
  init: () => Promise<void>
  query: <T>(query: ReturnType<Sql["inspect"]>) => Promise<T[]>
}

const worker = {
  db: null as Database | null,
  async init() {
    if (this.db) {
      return
    }
    this.db = await initDB()
  },
  async query(query: Sql) {
    const db = this.db
    if (!db) {
      throw new Error("DB not initialized")
    }
    return findMany(db, query)
  },
}

expose(worker)
