import { FunctionComponent } from "react"

import { Icon } from "leaflet"
import { Marker, Popup } from "react-leaflet"

import ProviderItem from "@/components/ProviderList/ProviderItem"

import type { HealthProvider } from "@/database/models"

import iconURL from "./marker-icon.png?url"
import iconShadowURL from "./marker-shadow.png?url"
import "./popupStyles.css"

const CustomIcon = new Icon({
  iconUrl: iconURL,
  shadowUrl: iconShadowURL,
})

const ProviderMarker: FunctionComponent<{ provider: HealthProvider }> = ({
  provider,
}) => {
  return (
    <Marker
      position={[provider.location.lat, provider.location.lng]}
      icon={CustomIcon}>
      <Popup className="dark:bg-neutral-800">
        <ProviderItem provider={provider} simple />
      </Popup>
    </Marker>
  )
}

export default ProviderMarker
