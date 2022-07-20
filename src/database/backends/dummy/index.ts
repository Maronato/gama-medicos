import { Sql } from "sql-template-tag"

import type { DB, DBBackend } from "../interface"

class DummyDB implements DB {
  async query<T>(_query: Sql): Promise<T[]> {
    return []
  }
  async paginatedQuery<T>(
    _query: Sql,
    _page: number,
    _size: number
  ): Promise<T[]> {
    return []
  }
}

export class DummyBackend implements DBBackend {
  private _db = new DummyDB()
  get db() {
    return this._db
  }

  init(): Promise<void> {
    return Promise.resolve()
  }
}
