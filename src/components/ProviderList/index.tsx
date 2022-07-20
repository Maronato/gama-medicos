import { FunctionComponent, useEffect, useState } from "react"

import classnames from "classnames"

import Spinner from "@/components/Spinner"
import { filterFetchProvider, ProviderFilters, useDatabase } from "@/database"
import { useIntersectionObserver } from "@/lib/hooks"

import type { HealthProvider } from "@/database/models"

import ProviderItem from "./ProviderItem"

type ProviderListProps = {
  filters: ProviderFilters
}

const ProviderList: FunctionComponent<ProviderListProps> = ({ filters }) => {
  const db = useDatabase()
  const [providers, setProviders] = useState<HealthProvider[]>([])
  const [page, setPage] = useState(1)
  const [ref, isVisible] = useIntersectionObserver({ rootMargin: "200px" })
  const [loading, setLoading] = useState(true)
  const [loadTime, setLoadTime] = useState<number>(0)

  const pageSize = 10

  useEffect(() => {
    if (db) {
      setLoading(true)
      const start = performance.now()
      filterFetchProvider(db, filters)
        .then(setProviders)
        .finally(() => {
          setLoadTime(performance.now() - start)
          setLoading(false)
        })
    }
  }, [db, filters])

  useEffect(() => {
    // Reset page when list is updated
    setPage(1)
    window.scrollTo(0, 0)
  }, [providers])

  const paginatedProviders = providers.slice(0, page * pageSize)

  const hasMore = paginatedProviders.length < providers.length

  useEffect(() => {
    if (isVisible && hasMore) {
      setPage((p) => p + 1)
    }
  }, [isVisible, hasMore])

  return (
    <div>
      <div className="w-full flex flex-row justify-center my-2">
        <span className="flex flex-row">
          {`${providers.length} resultado${
            providers.length !== 1 ? "s" : ""
          } em ${loadTime?.toFixed(0)}ms `}
          <Spinner
            className={classnames(
              "ml-2 w-4 h-4 self-center text-gray-600 dark:text-gray-400",
              { "opacity-0": !loading }
            )}
          />
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-5 xl:gap-8">
        {paginatedProviders.map((provider) => (
          <ProviderItem key={provider.contract} provider={provider} />
        ))}
        {providers.length === 0 && (
          <div className="w-full h-80 justify-center flex flex-col col-span-3">
            <span className="mx-auto text-xl font-bold">
              {loading ? `Carregando...` : `Nenhum resultado 😞`}
            </span>
          </div>
        )}
        <div ref={ref} />
      </div>
    </div>
  )
}

export default ProviderList
