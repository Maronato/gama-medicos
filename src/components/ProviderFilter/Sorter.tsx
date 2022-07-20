import { FunctionComponent, useEffect, useState } from "react"

import { Listbox } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/solid"
import classNames from "classnames"
import { useDebounce } from "use-debounce"

import type { ProviderFilters } from "@/database"

type Option = NonNullable<ProviderFilters["sort"]>
const options: Option[] = ["rating", "name"]

const labelMap = {
  rating: "Avaliação",
  name: "Nome",
}

const SorterOption: FunctionComponent<{ option: Option }> = ({ option }) => {
  return (
    <Listbox.Option
      value={option}
      className={({ active }) =>
        classNames("input-option", active ? "active" : "inactive")
      }>
      {({ selected }) => (
        <span className={classNames("input-option-text", { selected })}>
          {labelMap[option]}
        </span>
      )}
    </Listbox.Option>
  )
}

type SorterProps = {
  onChange: (sort: Option) => void
}

const Sorter: FunctionComponent<SorterProps> = ({ onChange }) => {
  const [sort, setSort] = useState<Option>("rating")
  const [debounced] = useDebounce(sort, 500)

  useEffect(() => {
    onChange(debounced)
  }, [onChange, debounced])

  return (
    <Listbox value={sort} onChange={setSort}>
      <div className="relative mt-1">
        <Listbox.Button className="input-wrapper input">
          <span className="flex flex-row truncate space-x-1 text-gray-900 text-opacity-60">
            <span>{`Ordem:`}</span>
            <span className="font-bold">{labelMap[sort]}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Listbox.Options className="input-options">
          {options.map((option) => (
            <SorterOption key={option} option={option} />
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}

export default Sorter
