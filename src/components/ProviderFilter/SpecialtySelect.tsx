import { FunctionComponent, useEffect, useState } from "react"

import { useDebounce } from "use-debounce"

import { useDatabase } from "@/database"
import { fetchSpecialties } from "@/database/queries"
import { arraysAreEqual } from "@/lib/utils"

import MultiCombobox from "../MultiCombobox"

type SpecialtySelectProps = {
  onChange: (specialties: string[]) => void
}

const SpecialtySelect: FunctionComponent<SpecialtySelectProps> = ({
  onChange,
}) => {
  const db = useDatabase()
  const [ready, setReady] = useState(false)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [debounced] = useDebounce(selected, 500, { equalityFn: arraysAreEqual })

  useEffect(() => {
    if (db) {
      fetchSpecialties(db).then((specialties) => {
        setSpecialties(specialties.map((s) => s.specialty))
        setReady(true)
      })
    }
  }, [db])

  useEffect(() => {
    onChange(debounced)
  }, [onChange, debounced])

  return (
    <MultiCombobox
      placeholder="Filtrar especialidades"
      loading={!ready}
      name="especialidades"
      onChange={setSelected}
      options={specialties}
    />
  )
}

export default SpecialtySelect
