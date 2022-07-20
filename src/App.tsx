import { FunctionComponent, useCallback, useEffect, useState } from "react"

import classnames from "classnames"

import Button from "@/components/Button"
import ProviderFilter from "@/components/ProviderFilter"
import ProviderList from "@/components/ProviderList"
import ProviderMap from "@/components/ProviderMap"
import {
  useExternalMap,
  useExternalMapBounds,
} from "@/components/ProviderMap/hooks"

import type { ProviderFilters } from "@/database"
import type { LatLngExpression } from "leaflet"

const App: FunctionComponent = () => {
  const [map, setMap] = useExternalMap()
  const [showMap, setShowMap] = useState(false)
  const bounds = useExternalMapBounds(map)

  const [filters, setFilters] = useState<ProviderFilters>({})
  const updateFilters = useCallback(
    (newFilters: Partial<ProviderFilters>) =>
      setFilters((curFilters) => ({ ...curFilters, ...newFilters })),
    []
  )

  useEffect(() => {
    if (bounds) {
      updateFilters({ bounds })
    }
  }, [bounds, updateFilters])

  const changeCenter = useCallback(
    (center: LatLngExpression) => {
      if (map) {
        map.setView(center, 14)
      }
    },
    [map]
  )

  return (
    <div className="h-screen w-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 w-full">
        <div
          className={classnames("flex-col space-y-4 mt-10 mx-4 md:mr-0", {
            "hidden md:flex": showMap,
          })}>
          <div className="flex mb-5">
            <div className="md:mx-auto flex flex-col">
              <span className="text-3xl">MckMédicos</span>
            </div>
          </div>
          <div className="flex">
            <Button
              className="md:hidden absolute top-0 right-0 mr-4 mt-4 z-[1000]"
              onClick={() => setShowMap(!showMap)}>
              Ver mapa
            </Button>
            <ProviderFilter
              onFilter={updateFilters}
              onChangeCenter={changeCenter}
            />
          </div>
          <div>
            <ProviderList filters={filters} />
          </div>
        </div>
        <div
          className={classnames("h-screen w-full top-0 self-start", {
            "invisible absolute md:visible md:sticky": !showMap,
            sticky: showMap,
          })}>
          <Button
            className="md:hidden fixed top-0 right-0 mr-4 mt-4 z-[1000]"
            onClick={() => setShowMap(!showMap)}>
            Ver lista
          </Button>
          <ProviderMap filters={filters} zoom={14} setMap={setMap} />
        </div>
      </div>
    </div>
  )
}

export default App
