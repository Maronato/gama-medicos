import {
  FunctionComponent,
  useEffect,
  useState,
  Fragment,
  useMemo,
  FocusEventHandler,
  MouseEventHandler,
} from "react"

import { Combobox, Transition } from "@headlessui/react"
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid"
import classNames from "classnames"

const MultiComboboxOption: FunctionComponent<{
  option: string
  disabled?: boolean
}> = ({ option, disabled }) => {
  return (
    <Combobox.Option
      disabled={disabled}
      className={({ active }) =>
        classNames("input-option !pl-10", active ? "active" : "inactive")
      }
      value={option}>
      {({ selected }) => (
        <>
          <span className={classNames("input-option-text", { selected })}>
            {option}
          </span>
          {selected ? (
            <span className="input-option-icon">
              <CheckIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
        </>
      )}
    </Combobox.Option>
  )
}

const MultiComboboxOptions: FunctionComponent<{
  query: string
  options: string[]
  loading: boolean
}> = ({ query, options, loading }) => {
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase())
  )

  const Results = useMemo(() => {
    if (loading) {
      return <MultiComboboxOption option="Carregando..." disabled />
    }
    if (filteredOptions.length === 0) {
      return <MultiComboboxOption option="Nenhum resultado" disabled />
    }
    return (
      <>
        {filteredOptions.map((option) => (
          <MultiComboboxOption key={option} option={option} />
        ))}
      </>
    )
  }, [filteredOptions, loading])

  return (
    <Transition
      as={Fragment}
      leave="transition ease-in duration-50"
      leaveFrom="opacity-100"
      leaveTo="opacity-0">
      <Combobox.Options className="input-options">{Results}</Combobox.Options>
    </Transition>
  )
}
type MultiComboboxProps = {
  options: string[]
  loading: boolean
  onChange: (options: string[]) => void
  placeholder: string
  name: string
}

const MultiCombobox: FunctionComponent<MultiComboboxProps> = ({
  onChange,
  options,
  loading,
  placeholder,
  name,
}) => {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null)
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)

  const handleFocus: FocusEventHandler = () => {
    buttonRef?.click()
  }
  const handleClick: MouseEventHandler = (e) => {
    setQuery("")
    if (e.isTrusted) {
      e.preventDefault()
      inputRef?.focus()
    }
  }

  useEffect(() => {
    onChange(selected)
  }, [onChange, selected])

  const inputPlaceholder =
    selected.length > 0
      ? `${selected[0]}${selected.length > 1 ? ` +${selected.length - 1}` : ""}`
      : placeholder

  return (
    <Combobox value={selected} onChange={setSelected} multiple name={name}>
      <div className="relative mt-1 w-full">
        <div className="input-wrapper">
          <Combobox.Input
            ref={setInputRef}
            onFocus={handleFocus}
            className="input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={inputPlaceholder}
          />
          <Combobox.Button
            ref={setButtonRef}
            onClick={handleClick}
            disabled
            className="absolute inset-y-0 right-0 flex items-center pr-2">
            <SelectorIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <MultiComboboxOptions
          query={query}
          options={options}
          loading={loading}
        />
      </div>
    </Combobox>
  )
}

export default MultiCombobox
