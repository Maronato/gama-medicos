import { useCallback, useEffect, useState } from "react"

import type { LatLngBounds, Map } from "leaflet"

export function useExternalMap() {
  const [map, setMap] = useState<Map | null>(null)
  return [map, setMap] as const
}

export function useExternalMapBounds(map: Map | null) {
  const [bounds, setBounds] = useState<LatLngBounds>()
  const onMoveEnd = useCallback(() => {
    if (map) {
      setBounds(map.getBounds())
    }
  }, [map])

  useEffect(() => {
    if (map) {
      setBounds(map.getBounds())
      map.on("moveend", onMoveEnd)
      return () => {
        map.off("moveend", onMoveEnd)
      }
    }
  }, [map, onMoveEnd])
  return bounds
}

export function useExternalMapReady(map: Map | null) {
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    if (map) {
      map.whenReady(() => {
        setIsReady(true)
      })
    }
  }, [map])
  return isReady
}
