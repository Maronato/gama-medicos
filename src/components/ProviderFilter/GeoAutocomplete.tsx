import { Fragment, FunctionComponent, useEffect, useState } from "react"

import { Combobox, Transition } from "@headlessui/react"
import { SearchIcon } from "@heroicons/react/solid"
import classNames from "classnames"
import { useDebounce } from "use-debounce"

import Spinner from "@/components/Spinner"

export type SearchResult = {
  place_id: number
  lat: string
  lon: string
  address: {
    state: string
    city_district: string
    city: string
    country: string
  }
  display_name: string
  namedetails: { name: string; short_name?: string }
}

const findLocation = async (query: string): Promise<SearchResult[]> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&namedetails=1`
  )
  const data = await (res.json() as Promise<SearchResult[]>)
  return data.slice(0, 3)
}

const GeoOption: FunctionComponent<{
  option: Pick<SearchResult, "display_name">
  disabled?: boolean
}> = ({ option, disabled }) => {
  return (
    <Combobox.Option
      disabled={disabled}
      className={({ active }) =>
        classNames("input-option", active ? "active" : "inactive")
      }
      value={option}>
      {({ selected }) => (
        <span className={classNames("input-option-text", { selected })}>
          {option.display_name}
        </span>
      )}
    </Combobox.Option>
  )
}

const GeoOptions: FunctionComponent<{
  options: SearchResult[]
  query: string
  loading: boolean
}> = ({ options, query, loading }) => {
  const Results: FunctionComponent = () => {
    if (options.length === 0 && query !== "") {
      if (loading) {
        return <GeoOption option={{ display_name: "Carregando..." }} disabled />
      } else {
        return (
          <GeoOption option={{ display_name: "Nenhum resultado" }} disabled />
        )
      }
    }
    return (
      <>
        {options.map((option) => (
          <GeoOption key={option.place_id} option={option} />
        ))}
      </>
    )
  }

  if (options.length === 0 && !loading) {
    return null
  }

  return (
    <Transition
      as={Fragment}
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0">
      <Combobox.Options className="input-options">
        <Results />
      </Combobox.Options>
    </Transition>
  )
}

type GeoAutocompleteProps = {
  onSelect: (result: SearchResult) => void
}

const GeoAutocomplete: FunctionComponent<GeoAutocompleteProps> = ({
  onSelect,
}) => {
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [query, setQuery] = useState("")
  const [debouncedQuery] = useDebounce(query, 500)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(query.length > 0)
  }, [query])

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      findLocation(debouncedQuery)
        .then((results) => setResults(results))
        .finally(() => setLoading(false))
    } else {
      setResults([])
    }
  }, [debouncedQuery])

  useEffect(() => {
    if (selected) {
      onSelect(selected)
    }
  }, [selected, onSelect])

  return (
    <Combobox value={selected} onChange={setSelected} nullable>
      <div className="relative mt-1 w-full">
        <div className="input-wrapper">
          <Combobox.Input
            className="input"
            placeholder="Minha cidade, estado"
            displayValue={(res: SearchResult | null) =>
              res?.namedetails.name || ""
            }
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            {loading ? (
              <Spinner className="h-4 w-4 text-gray-400" aria-hidden="true" />
            ) : (
              <SearchIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            )}
          </Combobox.Button>
        </div>
        <GeoOptions options={results} query={query} loading={loading} />
      </div>
    </Combobox>
  )
}

export default GeoAutocomplete
