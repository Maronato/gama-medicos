import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react"

import { MapContainer, TileLayer } from "react-leaflet"

import { filterFetchProvider, ProviderFilters, useDatabase } from "@/database"
import { useColorScheme, usePick } from "@/lib/hooks"

import type { HealthProvider } from "@/database/models"
import type { LatLngExpression, Map, TileLayer as TileLayerType } from "leaflet"

import MiniMap from "./MiniMap"
import ProviderMarkers from "./ProviderMarkers"

import "leaflet/dist/leaflet.css"

const tileProviders = {
  light: {
    url: "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",
  },
  dark: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  },
}

type MapProps = {
  zoom: number
  center: LatLngExpression
  filters: ProviderFilters
  setMap: (map: Map) => void
}

const ProviderMap: FunctionComponent<MapProps> = ({
  zoom,
  center,
  setMap,
  filters,
}) => {
  const db = useDatabase()
  const [providers, setProviders] = useState<HealthProvider[]>([])
  const theme = useColorScheme()

  const pickedFilters = usePick(filters, ["name", "categories", "specialties"])

  useEffect(() => {
    if (db) {
      filterFetchProvider(db, pickedFilters).then((providers) => {
        setProviders(providers)
      })
    }
  }, [db, pickedFilters])

  const tileLayerRef = useRef<TileLayerType>(null)
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(tileProviders[theme].url)
    }
  }, [theme, tileLayerRef])

  return useMemo(
    () => (
      <MapContainer
        minZoom={3}
        center={center}
        zoom={zoom}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        zoomControl={false}
        ref={setMap}
        className="h-full w-full">
        <TileLayer
          ref={tileLayerRef}
          url={tileProviders[theme].url}
          attribution={`&copy; <a href="http://openstreetmap.org">OpenStreetMap</a>`}
        />
        <ProviderMarkers providers={providers} />
        <MiniMap position="topleft" />
      </MapContainer>
    ),
    [zoom, providers, theme, setMap, center]
  )
}

export default ProviderMap
