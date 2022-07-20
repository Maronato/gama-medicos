import { FunctionComponent, useEffect, useState } from "react"

import { useDebounce } from "use-debounce"

import { useDatabase } from "@/database"
import { fetchCategories } from "@/database/queries"
import { arraysAreEqual } from "@/lib/utils"

import MultiCombobox from "../MultiCombobox"

type CategorySelectProps = {
  onChange: (categories: string[]) => void
}

const defaultSelected: string[] = []

const CategorySelect: FunctionComponent<CategorySelectProps> = ({
  onChange,
}) => {
  const db = useDatabase()
  const [ready, setReady] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>(defaultSelected)
  const [debounced] = useDebounce(selected, 500, {
    equalityFn: arraysAreEqual,
  })

  useEffect(() => {
    if (db) {
      fetchCategories(db).then((specialties) => {
        setCategories(specialties.map((s) => s.category))
        setReady(true)
      })
    }
  }, [db])

  useEffect(() => {
    onChange(debounced)
  }, [onChange, debounced])

  return (
    <MultiCombobox
      placeholder="Consultório / Hospital"
      loading={!ready}
      name="categorias"
      onChange={setSelected}
      options={categories}
    />
  )
}

export default CategorySelect
