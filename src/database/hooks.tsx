import {
  createContext,
  useContext,
  FunctionComponent,
  useEffect,
  ReactNode,
  useState,
} from "react"

import { DB, DBBackend, AsyncZlibBackend } from "./backends"

const dbContext = createContext<DBBackend | null>(null)

export const useDBBackend = (): DBBackend | null => {
  const backend = useContext(dbContext)
  return backend
}

export const useDatabase = (): DB | null => {
  const backend = useDBBackend()
  return backend?.db ?? null
}

export const DatabaseProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [backend, setBackend] = useState<DBBackend | null>(null)

  useEffect(() => {
    const backend = new AsyncZlibBackend()
    backend.init().then(() => setBackend(backend))
  }, [])

  return <dbContext.Provider value={backend}>{children}</dbContext.Provider>
}
