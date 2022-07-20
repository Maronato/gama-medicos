import { FunctionComponent } from "react"

import { Marker, Popup } from "react-leaflet"

import ProviderItem from "@/components/ProviderList/ProviderItem"

import type { HealthProvider } from "@/database/models"

import "./popupStyles.css"

const ProviderMarker: FunctionComponent<{ provider: HealthProvider }> = ({
  provider,
}) => {
  return (
    <Marker position={[provider.location.lat, provider.location.lng]}>
      <Popup className="dark:bg-neutral-800">
        <ProviderItem provider={provider} simple />
      </Popup>
    </Marker>
  )
}

export default ProviderMarker
