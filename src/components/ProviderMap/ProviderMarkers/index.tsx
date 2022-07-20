import { FunctionComponent } from "react"

import MarkerCluster from "../MarkerCluster"

import type { HealthProvider } from "@/database/models"

import ProviderMarker from "./ProviderMarker"

const ProviderMarkers: FunctionComponent<{ providers: HealthProvider[] }> = ({
  providers,
}: {
  providers: HealthProvider[]
}) => {
  return (
    <MarkerCluster>
      {providers.map((provider) => (
        <ProviderMarker key={provider.contract} provider={provider} />
      ))}
    </MarkerCluster>
  )
}

export default ProviderMarkers
