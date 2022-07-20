import { FunctionComponent, useEffect, useState } from "react"

import { deflateDB } from "@/database/backends/zlib/shared"

function saveDownload(data: Uint8Array) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([data]))
  a.download = "db.sqlite.zip"
  a.click()
}

const DownloadDBButton: FunctionComponent = () => {
  const [db, setDB] = useState<Uint8Array | null>(null)

  const triggerDownload = () => {
    if (db) {
      saveDownload(db)
    } else {
      deflateDB().then(setDB)
    }
  }

  useEffect(() => {
    if (db) {
      saveDownload(db)
    }
  }, [db])

  return (
    <button className="bg-blue-500" onClick={triggerDownload}>
      Download
    </button>
  )
}

export default DownloadDBButton
