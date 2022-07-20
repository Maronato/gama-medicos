import Pako from "pako"
import initSqlJs, { BindParams, Database } from "sql.js"

import { once } from "@/lib/utils"

import type { Sql } from "sql-template-tag"

export const deflateDB = once(async () => {
  const res = await fetch("/db.sqlite")
  const buffer = await res.arrayBuffer()
  const buff = new Uint8Array(buffer)
  const deflated = Pako.deflate(buff)
  return deflated
})

const inflateDB = once(async () => {
  const res = await fetch("/db.sqlite.zip")
  const buffer = await res.arrayBuffer()
  const buff = new Uint8Array(buffer)
  return Pako.inflate(buff)
})

export const initDB = once(async () => {
  const dbFile = await inflateDB()
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  })
  return new SQL.Database(dbFile)
})

export function findMany<T>(db: Database, query: Sql): T[] {
  const stmt = db.prepare(query.sql, query.values as BindParams)
  const results: T[] = []
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T)
  }
  stmt.free()
  stmt.freemem()
  return results
}
