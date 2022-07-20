import { FunctionComponent, useCallback } from "react"

import type { ProviderFilters } from "@/database"
import type { LatLngExpression } from "leaflet"

import CategorySelect from "./CategorySelect"
import GeoAutocomplete, { SearchResult } from "./GeoAutocomplete"
import NameInput from "./NameInput"
import Sorter from "./Sorter"
import SpecialtySelect from "./SpecialtySelect"

type ProviderFilterProps = {
  onFilter: (filters: Partial<ProviderFilters>) => void
  onChangeCenter: (center: LatLngExpression) => void
}

const ProviderFilter: FunctionComponent<ProviderFilterProps> = ({
  onFilter,
  onChangeCenter,
}) => {
  const onGeoSelect = useCallback(
    (result: SearchResult) => {
      onChangeCenter([parseFloat(result.lat), parseFloat(result.lon)])
    },
    [onChangeCenter]
  )

  const onNameChange = useCallback(
    (name: string) => {
      onFilter({ name })
    },
    [onFilter]
  )

  const onSortChange = useCallback(
    (sort: ProviderFilters["sort"]) => {
      onFilter({ sort })
    },
    [onFilter]
  )

  const onSpecialtyChange = useCallback(
    (specialties: string[]) => {
      onFilter({ specialties })
    },
    [onFilter]
  )

  const onCategoryChange = useCallback(
    (categories: string[]) => {
      onFilter({ categories })
    },
    [onFilter]
  )

  return (
    <div className="flex flex-col space-y-6 w-full max-w-3xl mx-auto">
      <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
        <div className="flex flex-col space-y-0 w-full">
          <span className="text-gray-600 dark:text-gray-200 text-sm font-bold tracking-tight">
            Localização
          </span>
          <GeoAutocomplete onSelect={onGeoSelect} />
        </div>
        <div className="flex flex-col space-y-0 w-full">
          <span className="text-gray-600 dark:text-gray-200 text-sm font-bold tracking-tight">
            Nome
          </span>
          <NameInput onChange={onNameChange} />
        </div>
      </div>

      <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0">
        <div className="flex flex-col space-y-0 w-full">
          <span className="text-gray-600 dark:text-gray-200 text-sm font-bold tracking-tight">
            Especialidade
          </span>
          <SpecialtySelect onChange={onSpecialtyChange} />
        </div>
        <div className="flex flex-col space-y-0 w-full">
          <span className="text-gray-600 dark:text-gray-200 text-sm font-bold tracking-tight">
            Categoria
          </span>
          <CategorySelect onChange={onCategoryChange} />
        </div>
      </div>

      <div className="flex flex-row mx-auto">
        <Sorter onChange={onSortChange} />
      </div>
    </div>
  )
}

export default ProviderFilter
