import { FunctionComponent, useEffect, useState } from "react"

import { SearchIcon } from "@heroicons/react/solid"
import { useDebounce } from "use-debounce"

type NameInputProps = {
  onChange: (name: string) => void
}

const NameInput: FunctionComponent<NameInputProps> = ({ onChange }) => {
  const [name, setName] = useState("")
  const [debounced] = useDebounce(name, 500)

  useEffect(() => {
    onChange(debounced)
  }, [onChange, debounced])

  return (
    <div className="relative mt-1 w-full">
      <div className="input-wrapper">
        <input
          className="input"
          placeholder="Fulano de Tal"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

export default NameInput
