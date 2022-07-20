import type { Sql } from "sql-template-tag"

export interface DB {
  query<T>(query: Sql): Promise<T[]>
  paginatedQuery<T>(query: Sql, page: number, size: number): Promise<T[]>
}

export interface DBBackend {
  init(debug?: boolean): Promise<void>
  db: DB | null
}
